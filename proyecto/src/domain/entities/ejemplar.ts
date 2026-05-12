export type EstadoEjemplar = "DISPONIBLE" | "PRESTADO" | "MANTENIMIENTO" | "PERDIDO";

export interface Ejemplar {
  id: string;
  libro_id: string;
  codigo_ejemplar: string;
  estado: EstadoEjemplar;
  observaciones?: string;
  created_at: string;
  updated_at: string;
}
