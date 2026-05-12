export interface Multa {
  id: string;
  prestamo_id: string;
  estudiante_id: string;
  dias_retraso: number;
  valor_por_dia: number;
  valor_total: number;
  pagada: boolean;
  fecha_generacion: string;
  fecha_pago?: string;
}
