import { EstadoSolicitud, SolicitudReserva } from "../../domain/entities/solicitud-reserva";
import { AppError } from "../../domain/errors/app-error";
import { EstudianteRepository } from "../../infrastructure/sqlite/repositories/estudiante.repository";
import { LibroRepository } from "../../infrastructure/sqlite/repositories/libro.repository";
import { SolicitudRepository } from "../../infrastructure/sqlite/repositories/solicitud.repository";
import { createId } from "../../shared/id";
import { nowIso } from "../../shared/date";

export class SolicitudService {
  private readonly solicitudes = new SolicitudRepository();
  private readonly estudiantes = new EstudianteRepository();
  private readonly libros = new LibroRepository();

  list(filters: { estado?: EstadoSolicitud; libro_id?: string; estudiante_id?: string }): SolicitudReserva[] {
    return this.solicitudes.list().filter((solicitud) => {
      if (filters.estado && solicitud.estado !== filters.estado) return false;
      if (filters.libro_id && solicitud.libro_id !== filters.libro_id) return false;
      if (filters.estudiante_id && solicitud.estudiante_id !== filters.estudiante_id) return false;
      return true;
    });
  }

  create(input: { estudiante_id: string; libro_id: string }): SolicitudReserva {
    if (!this.estudiantes.findById(input.estudiante_id)) {
      throw new AppError(404, "estudiante_no_encontrado");
    }
    if (!this.libros.findById(input.libro_id)) {
      throw new AppError(404, "libro_no_encontrado");
    }
    if (this.solicitudes.existsPending(input.estudiante_id, input.libro_id)) {
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
    return this.solicitudes.create(solicitud);
  }

  update(id: string, input: { estado: EstadoSolicitud }): SolicitudReserva {
    const solicitud = this.solicitudes.findById(id);
    if (!solicitud) throw new AppError(404, "solicitud_no_encontrada");
    solicitud.estado = input.estado;
    solicitud.updated_at = nowIso();
    return this.solicitudes.update(solicitud);
  }
}
