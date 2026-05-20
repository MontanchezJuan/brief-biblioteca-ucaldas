import { Ejemplar } from "../../../domain/entities/ejemplar";
import { getDatabase } from "../connection";
import { mapEjemplar } from "./mappers";

export class EjemplarRepository {
  listByLibro(libroId: string): Ejemplar[] {
    return getDatabase()
      .prepare("SELECT * FROM ejemplares WHERE libro_id = ? ORDER BY created_at ASC, id ASC")
      .all(libroId)
      .map(mapEjemplar);
  }

  findById(id: string): Ejemplar | undefined {
    const row = getDatabase().prepare("SELECT * FROM ejemplares WHERE id = ?").get(id);
    return row ? mapEjemplar(row) : undefined;
  }

  existsByCodigo(codigoEjemplar: string): boolean {
    const row = getDatabase().prepare("SELECT 1 AS found FROM ejemplares WHERE codigo_ejemplar = ?").get(codigoEjemplar);
    return Boolean(row);
  }

  create(ejemplar: Ejemplar): Ejemplar {
    getDatabase()
      .prepare(
        `
        INSERT INTO ejemplares (
          id, libro_id, codigo_ejemplar, estado, observaciones, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `
      )
      .run(
        ejemplar.id,
        ejemplar.libro_id,
        ejemplar.codigo_ejemplar,
        ejemplar.estado,
        ejemplar.observaciones ?? null,
        ejemplar.created_at,
        ejemplar.updated_at
      );
    return ejemplar;
  }

  update(ejemplar: Ejemplar): Ejemplar {
    getDatabase()
      .prepare(
        `
        UPDATE ejemplares
        SET estado = ?, observaciones = ?, updated_at = ?
        WHERE id = ?
        `
      )
      .run(ejemplar.estado, ejemplar.observaciones ?? null, ejemplar.updated_at, ejemplar.id);
    return ejemplar;
  }

  updateEstado(id: string, estado: Ejemplar["estado"], updatedAt: string): void {
    getDatabase()
      .prepare("UPDATE ejemplares SET estado = ?, updated_at = ? WHERE id = ?")
      .run(estado, updatedAt, id);
  }
}
