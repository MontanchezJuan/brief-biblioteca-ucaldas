import { Multa } from "../../domain/entities/multa";
import { AppError } from "../../domain/errors/app-error";
import { db } from "../../infrastructure/memory/database";
import { nowIso, parseOptionalIso } from "../../shared/date";

export class MultaService {
  list(filters: { pagada?: boolean; estudiante_id?: string }): Multa[] {
    return db.multas.filter((multa) => {
      if (filters.pagada !== undefined && multa.pagada !== filters.pagada) return false;
      if (filters.estudiante_id && multa.estudiante_id !== filters.estudiante_id) return false;
      return true;
    });
  }

  pay(id: string, input: { fecha_pago?: string }): Multa {
    const multa = db.multas.find((item) => item.id === id);
    if (!multa) throw new AppError(404, "multa_no_encontrada");
    if (multa.pagada) throw new AppError(409, "multa_ya_pagada");
    const fechaPago = input.fecha_pago ? parseOptionalIso(input.fecha_pago) : new Date();
    if (!fechaPago) throw new AppError(400, "fecha_pago_invalida");

    multa.pagada = true;
    multa.fecha_pago = fechaPago.toISOString();

    const estudiante = db.estudiantes.find((item) => item.id === multa.estudiante_id);
    if (estudiante) {
      estudiante.multas_pendientes = Math.max(0, estudiante.multas_pendientes - multa.valor_total);
      estudiante.updated_at = nowIso();
    }
    return multa;
  }
}
