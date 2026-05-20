import { SolicitudReserva } from "../../../domain/entities/solicitud-reserva";
import { getDatabase } from "../connection";
import { mapSolicitud } from "./mappers";

export class SolicitudRepository {
  list(): SolicitudReserva[] {
    return getDatabase()
      .prepare("SELECT * FROM solicitudes ORDER BY created_at ASC, id ASC")
      .all()
      .map(mapSolicitud);
  }

  findById(id: string): SolicitudReserva | undefined {
    const row = getDatabase().prepare("SELECT * FROM solicitudes WHERE id = ?").get(id);
    return row ? mapSolicitud(row) : undefined;
  }

  existsPending(estudianteId: string, libroId: string): boolean {
    const row = getDatabase()
      .prepare(
        `
        SELECT 1 AS found
        FROM solicitudes
        WHERE estudiante_id = ? AND libro_id = ? AND estado = 'PENDIENTE'
        LIMIT 1
        `
      )
      .get(estudianteId, libroId);
    return Boolean(row);
  }

  existsPendingByLibro(libroId: string): boolean {
    const row = getDatabase()
      .prepare("SELECT 1 AS found FROM solicitudes WHERE libro_id = ? AND estado = 'PENDIENTE' LIMIT 1")
      .get(libroId);
    return Boolean(row);
  }

  create(solicitud: SolicitudReserva): SolicitudReserva {
    getDatabase()
      .prepare(
        `
        INSERT INTO solicitudes (
          id, estudiante_id, libro_id, fecha_solicitud, estado, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `
      )
      .run(
        solicitud.id,
        solicitud.estudiante_id,
        solicitud.libro_id,
        solicitud.fecha_solicitud,
        solicitud.estado,
        solicitud.created_at,
        solicitud.updated_at
      );
    return solicitud;
  }

  update(solicitud: SolicitudReserva): SolicitudReserva {
    getDatabase()
      .prepare("UPDATE solicitudes SET estado = ?, updated_at = ? WHERE id = ?")
      .run(solicitud.estado, solicitud.updated_at, solicitud.id);
    return solicitud;
  }
}
