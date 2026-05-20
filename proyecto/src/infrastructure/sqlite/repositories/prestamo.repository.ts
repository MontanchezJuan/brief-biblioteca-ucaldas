import { Prestamo } from "../../../domain/entities/prestamo";
import { getDatabase } from "../connection";
import { mapPrestamo } from "./mappers";

export class PrestamoRepository {
  list(): Prestamo[] {
    return getDatabase()
      .prepare("SELECT * FROM prestamos ORDER BY created_at ASC, id ASC")
      .all()
      .map(mapPrestamo);
  }

  listByEstudiante(estudianteId: string): Prestamo[] {
    return getDatabase()
      .prepare("SELECT * FROM prestamos WHERE estudiante_id = ? ORDER BY created_at ASC, id ASC")
      .all(estudianteId)
      .map(mapPrestamo);
  }

  findById(id: string): Prestamo | undefined {
    const row = getDatabase().prepare("SELECT * FROM prestamos WHERE id = ?").get(id);
    return row ? mapPrestamo(row) : undefined;
  }

  hasOverdueByEstudiante(estudianteId: string): boolean {
    const row = getDatabase()
      .prepare("SELECT 1 AS found FROM prestamos WHERE estudiante_id = ? AND estado = 'VENCIDO' LIMIT 1")
      .get(estudianteId);
    return Boolean(row);
  }

  hasActiveByEjemplar(ejemplarId: string): boolean {
    const row = getDatabase()
      .prepare("SELECT 1 AS found FROM prestamos WHERE ejemplar_id = ? AND estado = 'ACTIVO' LIMIT 1")
      .get(ejemplarId);
    return Boolean(row);
  }

  countActiveByEstudiante(estudianteId: string): number {
    const row = getDatabase()
      .prepare("SELECT COUNT(*) AS total FROM prestamos WHERE estudiante_id = ? AND estado = 'ACTIVO'")
      .get(estudianteId);
    return Number(row?.total ?? 0);
  }

  create(prestamo: Prestamo): Prestamo {
    getDatabase()
      .prepare(
        `
        INSERT INTO prestamos (
          id, estudiante_id, ejemplar_id, fecha_prestamo, fecha_devolucion_esperada,
          fecha_devolucion_real, estado, renovaciones, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
      )
      .run(
        prestamo.id,
        prestamo.estudiante_id,
        prestamo.ejemplar_id,
        prestamo.fecha_prestamo,
        prestamo.fecha_devolucion_esperada,
        prestamo.fecha_devolucion_real ?? null,
        prestamo.estado,
        prestamo.renovaciones,
        prestamo.created_at,
        prestamo.updated_at
      );
    return prestamo;
  }

  update(prestamo: Prestamo): Prestamo {
    getDatabase()
      .prepare(
        `
        UPDATE prestamos
        SET fecha_devolucion_esperada = ?, fecha_devolucion_real = ?, estado = ?,
            renovaciones = ?, updated_at = ?
        WHERE id = ?
        `
      )
      .run(
        prestamo.fecha_devolucion_esperada,
        prestamo.fecha_devolucion_real ?? null,
        prestamo.estado,
        prestamo.renovaciones,
        prestamo.updated_at,
        prestamo.id
      );
    return prestamo;
  }

  markOverdue(now: string): void {
    getDatabase()
      .prepare(
        `
        UPDATE prestamos
        SET estado = 'VENCIDO', updated_at = ?
        WHERE estado = 'ACTIVO' AND fecha_devolucion_esperada < ?
        `
      )
      .run(now, now);
  }
}
