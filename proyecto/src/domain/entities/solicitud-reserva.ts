export type EstadoSolicitud = "PENDIENTE" | "ATENDIDA" | "CANCELADA";

export interface SolicitudReserva {
  id: string;
  estudiante_id: string;
  libro_id: string;
  fecha_solicitud: string;
  estado: EstadoSolicitud;
  created_at: string;
  updated_at: string;
}
