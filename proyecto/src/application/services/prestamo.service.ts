import { Multa } from "../../domain/entities/multa";
import { Prestamo } from "../../domain/entities/prestamo";
import { AppError } from "../../domain/errors/app-error";
import { db } from "../../infrastructure/memory/database";
import { addCalendarDays, daysLate, nowIso, parseOptionalIso } from "../../shared/date";
import { createId } from "../../shared/id";

export class PrestamoService {
  list(filters: { estado?: string; estudiante_id?: string; vencidos?: boolean }): Prestamo[] {
    this.markOverdue();
    return db.prestamos.filter((prestamo) => {
      if (filters.estado && prestamo.estado !== filters.estado) return false;
      if (filters.estudiante_id && prestamo.estudiante_id !== filters.estudiante_id) return false;
      if (filters.vencidos && prestamo.estado !== "VENCIDO") return false;
      return true;
    });
  }

  listByStudent(estudianteId: string, filters: { estado?: string; desde?: string; hasta?: string }): Prestamo[] {
    this.markOverdue();
    if (!db.estudiantes.some((estudiante) => estudiante.id === estudianteId)) {
      throw new AppError(404, "estudiante_no_encontrado");
    }
    const desde = parseOptionalIso(filters.desde);
    const hasta = parseOptionalIso(filters.hasta);
    return db.prestamos.filter((prestamo) => {
      const fecha = new Date(prestamo.fecha_prestamo);
      if (prestamo.estudiante_id !== estudianteId) return false;
      if (filters.estado && prestamo.estado !== filters.estado) return false;
      if (filters.desde && !desde) throw new AppError(400, "fecha_desde_invalida");
      if (filters.hasta && !hasta) throw new AppError(400, "fecha_hasta_invalida");
      if (desde && fecha < desde) return false;
      if (hasta && fecha > hasta) return false;
      return true;
    });
  }

  create(input: { estudiante_id: string; ejemplar_id: string }): Prestamo {
    this.markOverdue();
    const estudiante = db.estudiantes.find((item) => item.id === input.estudiante_id);
    if (!estudiante) throw new AppError(404, "estudiante_no_encontrado");
    if (!estudiante.activo) throw new AppError(409, "estudiante_inactivo");

    const totalMultas = db.multas
      .filter((multa) => multa.estudiante_id === estudiante.id && !multa.pagada)
      .reduce((sum, multa) => sum + multa.valor_total, 0);
    if (estudiante.multas_pendientes > 0 || totalMultas > 0) {
      throw new AppError(409, "multas_pendientes", undefined, { total: estudiante.multas_pendientes || totalMultas });
    }

    const hasOverdue = db.prestamos.some(
      (prestamo) => prestamo.estudiante_id === estudiante.id && prestamo.estado === "VENCIDO"
    );
    if (hasOverdue) throw new AppError(409, "estudiante_con_prestamo_vencido");

    const ejemplar = db.ejemplares.find((item) => item.id === input.ejemplar_id);
    if (!ejemplar) throw new AppError(404, "ejemplar_no_encontrado");
    if (ejemplar.estado !== "DISPONIBLE") {
      throw new AppError(409, "ejemplar_no_disponible", undefined, { estado_actual: ejemplar.estado });
    }
    if (db.prestamos.some((prestamo) => prestamo.ejemplar_id === ejemplar.id && prestamo.estado === "ACTIVO")) {
      throw new AppError(409, "ejemplar_con_prestamo_activo");
    }

    const activos = db.prestamos.filter(
      (prestamo) => prestamo.estudiante_id === estudiante.id && prestamo.estado === "ACTIVO"
    ).length;
    if (activos >= estudiante.max_prestamos_activos) {
      throw new AppError(409, "limite_prestamos_alcanzado", undefined, {
        limite: estudiante.max_prestamos_activos,
        actuales: activos
      });
    }

    const libro = db.libros.find((item) => item.id === ejemplar.libro_id);
    if (!libro) throw new AppError(404, "libro_no_encontrado");

    const fechaPrestamo = new Date();
    const timestamp = nowIso();
    const prestamo: Prestamo = {
      id: createId(),
      estudiante_id: estudiante.id,
      ejemplar_id: ejemplar.id,
      fecha_prestamo: fechaPrestamo.toISOString(),
      fecha_devolucion_esperada: addCalendarDays(fechaPrestamo, libro.dias_prestamo).toISOString(),
      estado: "ACTIVO",
      renovaciones: 0,
      created_at: timestamp,
      updated_at: timestamp
    };
    db.prestamos.push(prestamo);
    ejemplar.estado = "PRESTADO";
    ejemplar.updated_at = timestamp;
    return prestamo;
  }

  returnLoan(id: string, input: { fecha_devolucion_real?: string }): { prestamo: Prestamo; multa?: Multa } {
    this.markOverdue();
    const prestamo = db.prestamos.find((item) => item.id === id);
    if (!prestamo) throw new AppError(404, "prestamo_no_encontrado");
    if (prestamo.estado === "DEVUELTO") throw new AppError(409, "prestamo_ya_devuelto");

    const requestedDate = input.fecha_devolucion_real ? parseOptionalIso(input.fecha_devolucion_real) : new Date();
    if (!requestedDate) throw new AppError(400, "fecha_devolucion_real_invalida");

    const timestamp = nowIso();
    prestamo.fecha_devolucion_real = requestedDate.toISOString();
    prestamo.estado = "DEVUELTO";
    prestamo.updated_at = timestamp;

    const ejemplar = db.ejemplares.find((item) => item.id === prestamo.ejemplar_id);
    if (ejemplar) {
      ejemplar.estado = "DISPONIBLE";
      ejemplar.updated_at = timestamp;
    }

    const expected = new Date(prestamo.fecha_devolucion_esperada);
    if (requestedDate <= expected) return { prestamo };

    const estudiante = db.estudiantes.find((item) => item.id === prestamo.estudiante_id);
    const dias_retraso = daysLate(requestedDate, expected);
    const multa: Multa = {
      id: createId(),
      prestamo_id: prestamo.id,
      estudiante_id: prestamo.estudiante_id,
      dias_retraso,
      valor_por_dia: 2000,
      valor_total: dias_retraso * 2000,
      pagada: false,
      fecha_generacion: timestamp
    };
    db.multas.push(multa);
    if (estudiante) estudiante.multas_pendientes += multa.valor_total;
    return { prestamo, multa };
  }

  renew(id: string): Prestamo {
    const prestamo = db.prestamos.find((item) => item.id === id);
    if (!prestamo) throw new AppError(404, "prestamo_no_encontrado");
    if (prestamo.estado !== "ACTIVO") throw new AppError(409, "prestamo_no_activo");

    const ejemplar = db.ejemplares.find((item) => item.id === prestamo.ejemplar_id);
    const libro = ejemplar ? db.libros.find((item) => item.id === ejemplar.libro_id) : undefined;
    if (!ejemplar || !libro) throw new AppError(404, "libro_no_encontrado");
    if (db.solicitudes.some((solicitud) => solicitud.libro_id === libro.id && solicitud.estado === "PENDIENTE")) {
      throw new AppError(409, "renovacion_bloqueada_por_solicitud");
    }

    prestamo.renovaciones += 1;
    prestamo.fecha_devolucion_esperada = addCalendarDays(new Date(), libro.dias_prestamo).toISOString();
    prestamo.updated_at = nowIso();
    return prestamo;
  }

  listOverdue(diasMinimo?: number): Prestamo[] {
    this.markOverdue();
    const today = new Date();
    return db.prestamos.filter((prestamo) => {
      if (prestamo.estado !== "VENCIDO") return false;
      if (diasMinimo === undefined) return true;
      return daysLate(today, new Date(prestamo.fecha_devolucion_esperada)) >= diasMinimo;
    });
  }

  markOverdue(): void {
    const today = new Date();
    db.prestamos.forEach((prestamo) => {
      if (prestamo.estado === "ACTIVO" && new Date(prestamo.fecha_devolucion_esperada) < today) {
        prestamo.estado = "VENCIDO";
        prestamo.updated_at = nowIso();
      }
    });
  }
}
