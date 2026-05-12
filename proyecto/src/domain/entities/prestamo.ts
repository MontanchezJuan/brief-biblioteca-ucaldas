export type EstadoPrestamo = "ACTIVO" | "DEVUELTO" | "VENCIDO";

export interface Prestamo {
  id: string;
  estudiante_id: string;
  ejemplar_id: string;
  fecha_prestamo: string;
  fecha_devolucion_esperada: string;
  fecha_devolucion_real?: string;
  estado: EstadoPrestamo;
  renovaciones: number;
  created_at: string;
  updated_at: string;
}
