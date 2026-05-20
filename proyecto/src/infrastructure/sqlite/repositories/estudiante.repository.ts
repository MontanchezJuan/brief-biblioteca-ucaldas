import { Estudiante } from "../../../domain/entities/estudiante";
import { getDatabase } from "../connection";
import { mapEstudiante, toInteger } from "./mappers";

export class EstudianteRepository {
  list(): Estudiante[] {
    return getDatabase()
      .prepare("SELECT * FROM estudiantes ORDER BY created_at ASC, id ASC")
      .all()
      .map(mapEstudiante);
  }

  findById(id: string): Estudiante | undefined {
    const row = getDatabase().prepare("SELECT * FROM estudiantes WHERE id = ?").get(id);
    return row ? mapEstudiante(row) : undefined;
  }

  existsByCodigo(codigoEstudiante: string): boolean {
    const row = getDatabase()
      .prepare("SELECT 1 AS found FROM estudiantes WHERE codigo_estudiante = ?")
      .get(codigoEstudiante);
    return Boolean(row);
  }

  create(estudiante: Estudiante): Estudiante {
    getDatabase()
      .prepare(
        `
        INSERT INTO estudiantes (
          id, codigo_estudiante, nombre, programa, semestre, tipo, max_prestamos_activos,
          multas_pendientes, activo, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
      )
      .run(
        estudiante.id,
        estudiante.codigo_estudiante,
        estudiante.nombre,
        estudiante.programa,
        estudiante.semestre,
        estudiante.tipo,
        estudiante.max_prestamos_activos,
        estudiante.multas_pendientes,
        toInteger(estudiante.activo),
        estudiante.created_at,
        estudiante.updated_at
      );
    return estudiante;
  }

  update(estudiante: Estudiante): Estudiante {
    getDatabase()
      .prepare(
        `
        UPDATE estudiantes
        SET nombre = ?, programa = ?, semestre = ?, tipo = ?, max_prestamos_activos = ?,
            multas_pendientes = ?, activo = ?, updated_at = ?
        WHERE id = ?
        `
      )
      .run(
        estudiante.nombre,
        estudiante.programa,
        estudiante.semestre,
        estudiante.tipo,
        estudiante.max_prestamos_activos,
        estudiante.multas_pendientes,
        toInteger(estudiante.activo),
        estudiante.updated_at,
        estudiante.id
      );
    return estudiante;
  }

  updateMultasPendientes(id: string, multasPendientes: number, updatedAt: string): void {
    getDatabase()
      .prepare("UPDATE estudiantes SET multas_pendientes = ?, updated_at = ? WHERE id = ?")
      .run(multasPendientes, updatedAt, id);
  }
}
