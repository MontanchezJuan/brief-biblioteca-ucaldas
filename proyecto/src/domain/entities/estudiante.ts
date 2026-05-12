export type TipoEstudiante = "PREGRADO" | "POSGRADO";

export interface Estudiante {
  id: string;
  codigo_estudiante: string;
  nombre: string;
  programa: string;
  semestre: number;
  tipo: TipoEstudiante;
  max_prestamos_activos: number;
  multas_pendientes: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}
