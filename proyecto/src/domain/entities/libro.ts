export interface Libro {
  id: string;
  codigo_inventario: string;
  titulo: string;
  autor: string;
  sala: string;
  alta_demanda: boolean;
  dias_prestamo: number;
  created_at: string;
  updated_at: string;
}
