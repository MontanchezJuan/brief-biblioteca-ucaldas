import { Ejemplar } from "../../../domain/entities/ejemplar";
import { Estudiante } from "../../../domain/entities/estudiante";
import { Libro } from "../../../domain/entities/libro";
import { Multa } from "../../../domain/entities/multa";
import { Prestamo } from "../../../domain/entities/prestamo";
import { SolicitudReserva } from "../../../domain/entities/solicitud-reserva";

type Row = Record<string, unknown>;

export function toInteger(value: boolean): number {
  return value ? 1 : 0;
}

export function toBoolean(value: unknown): boolean {
  return Number(value) === 1;
}

export function mapLibro(row: Row): Libro {
  return {
    id: String(row.id),
    codigo_inventario: String(row.codigo_inventario),
    titulo: String(row.titulo),
    autor: String(row.autor),
    sala: String(row.sala),
    alta_demanda: toBoolean(row.alta_demanda),
    dias_prestamo: Number(row.dias_prestamo),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  };
}

export function mapEjemplar(row: Row): Ejemplar {
  return {
    id: String(row.id),
    libro_id: String(row.libro_id),
    codigo_ejemplar: String(row.codigo_ejemplar),
    estado: row.estado as Ejemplar["estado"],
    observaciones: row.observaciones === null || row.observaciones === undefined ? undefined : String(row.observaciones),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  };
}

export function mapEstudiante(row: Row): Estudiante {
  return {
    id: String(row.id),
    codigo_estudiante: String(row.codigo_estudiante),
    nombre: String(row.nombre),
    programa: String(row.programa),
    semestre: Number(row.semestre),
    tipo: row.tipo as Estudiante["tipo"],
    max_prestamos_activos: Number(row.max_prestamos_activos),
    multas_pendientes: Number(row.multas_pendientes),
    activo: toBoolean(row.activo),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  };
}

export function mapPrestamo(row: Row): Prestamo {
  return {
    id: String(row.id),
    estudiante_id: String(row.estudiante_id),
    ejemplar_id: String(row.ejemplar_id),
    fecha_prestamo: String(row.fecha_prestamo),
    fecha_devolucion_esperada: String(row.fecha_devolucion_esperada),
    fecha_devolucion_real:
      row.fecha_devolucion_real === null || row.fecha_devolucion_real === undefined
        ? undefined
        : String(row.fecha_devolucion_real),
    estado: row.estado as Prestamo["estado"],
    renovaciones: Number(row.renovaciones),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  };
}

export function mapSolicitud(row: Row): SolicitudReserva {
  return {
    id: String(row.id),
    estudiante_id: String(row.estudiante_id),
    libro_id: String(row.libro_id),
    fecha_solicitud: String(row.fecha_solicitud),
    estado: row.estado as SolicitudReserva["estado"],
    created_at: String(row.created_at),
    updated_at: String(row.updated_at)
  };
}

export function mapMulta(row: Row): Multa {
  return {
    id: String(row.id),
    prestamo_id: String(row.prestamo_id),
    estudiante_id: String(row.estudiante_id),
    dias_retraso: Number(row.dias_retraso),
    valor_por_dia: Number(row.valor_por_dia),
    valor_total: Number(row.valor_total),
    pagada: toBoolean(row.pagada),
    fecha_generacion: String(row.fecha_generacion),
    fecha_pago: row.fecha_pago === null || row.fecha_pago === undefined ? undefined : String(row.fecha_pago)
  };
}
