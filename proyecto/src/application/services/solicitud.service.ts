import { EstadoSolicitud, SolicitudReserva } from "../../domain/entities/solicitud-reserva";
import { AppError } from "../../domain/errors/app-error";
import { db } from "../../infrastructure/memory/database";
import { createId } from "../../shared/id";
import { nowIso } from "../../shared/date";

export class SolicitudService {
  list(filters: { estado?: EstadoSolicitud; libro_id?: string; estudiante_id?: string }): SolicitudReserva[] {
    return db.solicitudes.filter((solicitud) => {
      if (filters.estado && solicitud.estado !== filters.estado) return false;
      if (filters.libro_id && solicitud.libro_id !== filters.libro_id) return false;
      if (filters.estudiante_id && solicitud.estudiante_id !== filters.estudiante_id) return false;
      return true;
    });
  }

  create(input: { estudiante_id: string; libro_id: string }): SolicitudReserva {
    if (!db.estudiantes.some((estudiante) => estudiante.id === input.estudiante_id)) {
      throw new AppError(404, "estudiante_no_encontrado");
    }
    if (!db.libros.some((libro) => libro.id === input.libro_id)) {
      throw new AppError(404, "libro_no_encontrado");
    }
    if (
      db.solicitudes.some(
        (solicitud) =>
          solicitud.estudiante_id === input.estudiante_id &&
          solicitud.libro_id === input.libro_id &&
          solicitud.estado === "PENDIENTE"
      )
    ) {
      throw new AppError(409, "solicitud_duplicada");
    }
    const timestamp = nowIso();
    const solicitud: SolicitudReserva = {
      id: createId(),
      estudiante_id: input.estudiante_id,
      libro_id: input.libro_id,
      fecha_solicitud: timestamp,
      estado: "PENDIENTE",
      created_at: timestamp,
      updated_at: timestamp
    };
    db.solicitudes.push(solicitud);
    return solicitud;
  }

  update(id: string, input: { estado: EstadoSolicitud }): SolicitudReserva {
    const solicitud = db.solicitudes.find((item) => item.id === id);
    if (!solicitud) throw new AppError(404, "solicitud_no_encontrada");
    solicitud.estado = input.estado;
    solicitud.updated_at = nowIso();
    return solicitud;
  }
}
