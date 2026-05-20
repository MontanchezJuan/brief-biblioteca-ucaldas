import { Libro } from "../../../domain/entities/libro";
import { getDatabase } from "../connection";
import { mapLibro, toInteger } from "./mappers";

type LibroWithAvailability = Libro & {
  total_ejemplares: number;
  ejemplares_disponibles: number;
  disponible: boolean;
};

export class LibroRepository {
  listWithAvailability(): LibroWithAvailability[] {
    const rows = getDatabase()
      .prepare(
        `
        SELECT
          l.*,
          COUNT(e.id) AS total_ejemplares,
          SUM(CASE WHEN e.estado = 'DISPONIBLE' THEN 1 ELSE 0 END) AS ejemplares_disponibles
        FROM libros l
        LEFT JOIN ejemplares e ON e.libro_id = l.id
        GROUP BY l.id
        ORDER BY l.created_at ASC, l.id ASC
        `
      )
      .all();

    return rows.map((row) => {
      const libro = mapLibro(row);
      const disponibles = Number(row.ejemplares_disponibles ?? 0);
      return {
        ...libro,
        total_ejemplares: Number(row.total_ejemplares ?? 0),
        ejemplares_disponibles: disponibles,
        disponible: disponibles > 0
      };
    });
  }

  findById(id: string): Libro | undefined {
    const row = getDatabase().prepare("SELECT * FROM libros WHERE id = ?").get(id);
    return row ? mapLibro(row) : undefined;
  }

  existsByCodigoInventario(codigoInventario: string): boolean {
    const row = getDatabase().prepare("SELECT 1 AS found FROM libros WHERE codigo_inventario = ?").get(codigoInventario);
    return Boolean(row);
  }

  hasEjemplares(id: string): boolean {
    const row = getDatabase().prepare("SELECT 1 AS found FROM ejemplares WHERE libro_id = ? LIMIT 1").get(id);
    return Boolean(row);
  }

  create(libro: Libro): Libro {
    getDatabase()
      .prepare(
        `
        INSERT INTO libros (
          id, codigo_inventario, titulo, autor, sala, alta_demanda, dias_prestamo, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `
      )
      .run(
        libro.id,
        libro.codigo_inventario,
        libro.titulo,
        libro.autor,
        libro.sala,
        toInteger(libro.alta_demanda),
        libro.dias_prestamo,
        libro.created_at,
        libro.updated_at
      );
    return libro;
  }

  update(libro: Libro): Libro {
    getDatabase()
      .prepare(
        `
        UPDATE libros
        SET titulo = ?, autor = ?, sala = ?, alta_demanda = ?, dias_prestamo = ?, updated_at = ?
        WHERE id = ?
        `
      )
      .run(
        libro.titulo,
        libro.autor,
        libro.sala,
        toInteger(libro.alta_demanda),
        libro.dias_prestamo,
        libro.updated_at,
        libro.id
      );
    return libro;
  }

  delete(id: string): void {
    getDatabase().prepare("DELETE FROM libros WHERE id = ?").run(id);
  }
}
