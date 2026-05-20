import { Multa } from "../../domain/entities/multa";
import { Prestamo } from "../../domain/entities/prestamo";
import { AppError } from "../../domain/errors/app-error";
import { runInTransaction } from "../../infrastructure/sqlite/connection";
import { EjemplarRepository } from "../../infrastructure/sqlite/repositories/ejemplar.repository";
import { EstudianteRepository } from "../../infrastructure/sqlite/repositories/estudiante.repository";
import { LibroRepository } from "../../infrastructure/sqlite/repositories/libro.repository";
import { MultaRepository } from "../../infrastructure/sqlite/repositories/multa.repository";
import { PrestamoRepository } from "../../infrastructure/sqlite/repositories/prestamo.repository";
import { SolicitudRepository } from "../../infrastructure/sqlite/repositories/solicitud.repository";
import { addCalendarDays, daysLate, nowIso, parseOptionalIso } from "../../shared/date";
import { createId } from "../../shared/id";

export class PrestamoService {
  private readonly prestamos = new PrestamoRepository();
  private readonly estudiantes = new EstudianteRepository();
  private readonly ejemplares = new EjemplarRepository();
  private readonly libros = new LibroRepository();
  private readonly multas = new MultaRepository();
  private readonly solicitudes = new SolicitudRepository();

  list(filters: { estado?: string; estudiante_id?: string; vencidos?: boolean }): Prestamo[] {
    this.markOverdue();
    return this.prestamos.list().filter((prestamo) => {
      if (filters.estado && prestamo.estado !== filters.estado) return false;
      if (filters.estudiante_id && prestamo.estudiante_id !== filters.estudiante_id) return false;
      if (filters.vencidos && prestamo.estado !== "VENCIDO") return false;
      return true;
    });
  }

  listByStudent(estudianteId: string, filters: { estado?: string; desde?: string; hasta?: string }): Prestamo[] {
    this.markOverdue();
    if (!this.estudiantes.findById(estudianteId)) {
      throw new AppError(404, "estudiante_no_encontrado");
    }
    const desde = parseOptionalIso(filters.desde);
    const hasta = parseOptionalIso(filters.hasta);
    return this.prestamos.listByEstudiante(estudianteId).filter((prestamo) => {
      const fecha = new Date(prestamo.fecha_prestamo);
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
    const estudiante = this.estudiantes.findById(input.estudiante_id);
    if (!estudiante) throw new AppError(404, "estudiante_no_encontrado");
    if (!estudiante.activo) throw new AppError(409, "estudiante_inactivo");

    const totalMultas = this.multas.unpaidTotalByEstudiante(estudiante.id);
    if (estudiante.multas_pendientes > 0 || totalMultas > 0) {
      throw new AppError(409, "multas_pendientes", undefined, { total: estudiante.multas_pendientes || totalMultas });
    }

    const hasOverdue = this.prestamos.hasOverdueByEstudiante(estudiante.id);
    if (hasOverdue) throw new AppError(409, "estudiante_con_prestamo_vencido");

    const ejemplar = this.ejemplares.findById(input.ejemplar_id);
    if (!ejemplar) throw new AppError(404, "ejemplar_no_encontrado");
    if (ejemplar.estado !== "DISPONIBLE") {
      throw new AppError(409, "ejemplar_no_disponible", undefined, { estado_actual: ejemplar.estado });
    }
    if (this.prestamos.hasActiveByEjemplar(ejemplar.id)) {
      throw new AppError(409, "ejemplar_con_prestamo_activo");
    }

    const activos = this.prestamos.countActiveByEstudiante(estudiante.id);
    if (activos >= estudiante.max_prestamos_activos) {
      throw new AppError(409, "limite_prestamos_alcanzado", undefined, {
        limite: estudiante.max_prestamos_activos,
        actuales: activos
      });
    }

    const libro = this.libros.findById(ejemplar.libro_id);
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

    return runInTransaction(() => {
      this.prestamos.create(prestamo);
      this.ejemplares.updateEstado(ejemplar.id, "PRESTADO", timestamp);
      return prestamo;
    });
  }

  returnLoan(id: string, input: { fecha_devolucion_real?: string }): { prestamo: Prestamo; multa?: Multa } {
    this.markOverdue();
    const prestamo = this.prestamos.findById(id);
    if (!prestamo) throw new AppError(404, "prestamo_no_encontrado");
    if (prestamo.estado === "DEVUELTO") throw new AppError(409, "prestamo_ya_devuelto");

    const requestedDate = input.fecha_devolucion_real ? parseOptionalIso(input.fecha_devolucion_real) : new Date();
    if (!requestedDate) throw new AppError(400, "fecha_devolucion_real_invalida");

    const timestamp = nowIso();
    prestamo.fecha_devolucion_real = requestedDate.toISOString();
    prestamo.estado = "DEVUELTO";
    prestamo.updated_at = timestamp;

    const expected = new Date(prestamo.fecha_devolucion_esperada);
    return runInTransaction(() => {
      this.prestamos.update(prestamo);
      this.ejemplares.updateEstado(prestamo.ejemplar_id, "DISPONIBLE", timestamp);

      if (requestedDate <= expected) return { prestamo };

      const estudiante = this.estudiantes.findById(prestamo.estudiante_id);
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
      this.multas.create(multa);
      if (estudiante) {
        this.estudiantes.updateMultasPendientes(
          estudiante.id,
          estudiante.multas_pendientes + multa.valor_total,
          timestamp
        );
      }
      return { prestamo, multa };
    });
  }

  renew(id: string): Prestamo {
    const prestamo = this.prestamos.findById(id);
    if (!prestamo) throw new AppError(404, "prestamo_no_encontrado");
    if (prestamo.estado !== "ACTIVO") throw new AppError(409, "prestamo_no_activo");

    const ejemplar = this.ejemplares.findById(prestamo.ejemplar_id);
    const libro = ejemplar ? this.libros.findById(ejemplar.libro_id) : undefined;
    if (!ejemplar || !libro) throw new AppError(404, "libro_no_encontrado");
    if (this.solicitudes.existsPendingByLibro(libro.id)) {
      throw new AppError(409, "renovacion_bloqueada_por_solicitud");
    }

    prestamo.renovaciones += 1;
    prestamo.fecha_devolucion_esperada = addCalendarDays(new Date(), libro.dias_prestamo).toISOString();
    prestamo.updated_at = nowIso();
    return this.prestamos.update(prestamo);
  }

  listOverdue(diasMinimo?: number): Prestamo[] {
    this.markOverdue();
    const today = new Date();
    return this.prestamos.list().filter((prestamo) => {
      if (prestamo.estado !== "VENCIDO") return false;
      if (diasMinimo === undefined) return true;
      return daysLate(today, new Date(prestamo.fecha_devolucion_esperada)) >= diasMinimo;
    });
  }

  markOverdue(): void {
    this.prestamos.markOverdue(nowIso());
  }
}
