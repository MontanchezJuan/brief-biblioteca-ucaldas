import { Multa } from "../../../domain/entities/multa";
import { getDatabase } from "../connection";
import { mapMulta, toInteger } from "./mappers";

export class MultaRepository {
  list(): Multa[] {
    return getDatabase()
      .prepare("SELECT * FROM multas ORDER BY fecha_generacion ASC, id ASC")
      .all()
      .map(mapMulta);
  }

  findById(id: string): Multa | undefined {
    const row = getDatabase().prepare("SELECT * FROM multas WHERE id = ?").get(id);
    return row ? mapMulta(row) : undefined;
  }

  unpaidTotalByEstudiante(estudianteId: string): number {
    const row = getDatabase()
      .prepare("SELECT COALESCE(SUM(valor_total), 0) AS total FROM multas WHERE estudiante_id = ? AND pagada = 0")
      .get(estudianteId);
    return Number(row?.total ?? 0);
  }

  create(multa: Multa): Multa {
    getDatabase()
      .prepare(
        `
        INSERT INTO multas (
          id, prestamo_id, estudiante_id, dias_retraso, valor_por_dia, valor_total,
          pagada, fecha_generacion, fecha_pago
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
      )
      .run(
        multa.id,
        multa.prestamo_id,
        multa.estudiante_id,
        multa.dias_retraso,
        multa.valor_por_dia,
        multa.valor_total,
        toInteger(multa.pagada),
        multa.fecha_generacion,
        multa.fecha_pago ?? null
      );
    return multa;
  }

  update(multa: Multa): Multa {
    getDatabase()
      .prepare("UPDATE multas SET pagada = ?, fecha_pago = ? WHERE id = ?")
      .run(toInteger(multa.pagada), multa.fecha_pago ?? null, multa.id);
    return multa;
  }
}
