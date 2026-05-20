import { Multa } from "../../domain/entities/multa";
import { AppError } from "../../domain/errors/app-error";
import { runInTransaction } from "../../infrastructure/sqlite/connection";
import { EstudianteRepository } from "../../infrastructure/sqlite/repositories/estudiante.repository";
import { MultaRepository } from "../../infrastructure/sqlite/repositories/multa.repository";
import { nowIso, parseOptionalIso } from "../../shared/date";

export class MultaService {
  private readonly multas = new MultaRepository();
  private readonly estudiantes = new EstudianteRepository();

  list(filters: { pagada?: boolean; estudiante_id?: string }): Multa[] {
    return this.multas.list().filter((multa) => {
      if (filters.pagada !== undefined && multa.pagada !== filters.pagada) return false;
      if (filters.estudiante_id && multa.estudiante_id !== filters.estudiante_id) return false;
      return true;
    });
  }

  pay(id: string, input: { fecha_pago?: string }): Multa {
    const multa = this.multas.findById(id);
    if (!multa) throw new AppError(404, "multa_no_encontrada");
    if (multa.pagada) throw new AppError(409, "multa_ya_pagada");
    const fechaPago = input.fecha_pago ? parseOptionalIso(input.fecha_pago) : new Date();
    if (!fechaPago) throw new AppError(400, "fecha_pago_invalida");

    multa.pagada = true;
    multa.fecha_pago = fechaPago.toISOString();

    return runInTransaction(() => {
      this.multas.update(multa);
      const estudiante = this.estudiantes.findById(multa.estudiante_id);
      if (estudiante) {
        this.estudiantes.updateMultasPendientes(
          estudiante.id,
          Math.max(0, estudiante.multas_pendientes - multa.valor_total),
          nowIso()
        );
      }
      return multa;
    });
  }
}
