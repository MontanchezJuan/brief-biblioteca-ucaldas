import { AppError } from "../../domain/errors/app-error";
import { Libro } from "../../domain/entities/libro";
import { db } from "../../infrastructure/memory/database";
import { createId } from "../../shared/id";
import { nowIso } from "../../shared/date";

type CreateLibroInput = Pick<Libro, "codigo_inventario" | "titulo" | "autor" | "sala" | "alta_demanda">;
type UpdateLibroInput = Partial<Pick<Libro, "titulo" | "autor" | "sala" | "alta_demanda">>;

export class LibroService {
  list(filters: {
    titulo?: string;
    autor?: string;
    sala?: string;
    alta_demanda?: boolean;
    disponible?: boolean;
  }): Array<Libro & { total_ejemplares: number; ejemplares_disponibles: number; disponible: boolean }> {
    return db.libros
      .map((libro) => this.withAvailability(libro))
      .filter((libro) => {
        if (filters.titulo && !libro.titulo.toLowerCase().includes(filters.titulo.toLowerCase())) return false;
        if (filters.autor && !libro.autor.toLowerCase().includes(filters.autor.toLowerCase())) return false;
        if (filters.sala && libro.sala.toLowerCase() !== filters.sala.toLowerCase()) return false;
        if (filters.alta_demanda !== undefined && libro.alta_demanda !== filters.alta_demanda) return false;
        if (filters.disponible !== undefined && libro.disponible !== filters.disponible) return false;
        return true;
      });
  }

  getById(id: string): Libro {
    const libro = db.libros.find((item) => item.id === id);
    if (!libro) throw new AppError(404, "libro_no_encontrado");
    return libro;
  }

  create(input: CreateLibroInput): Libro {
    if (db.libros.some((libro) => libro.codigo_inventario === input.codigo_inventario)) {
      throw new AppError(409, "codigo_inventario_duplicado");
    }

    const timestamp = nowIso();
    const libro: Libro = {
      id: createId(),
      ...input,
      dias_prestamo: input.alta_demanda ? 3 : 15,
      created_at: timestamp,
      updated_at: timestamp
    };
    db.libros.push(libro);
    return libro;
  }

  update(id: string, input: UpdateLibroInput): Libro {
    const libro = this.getById(id);
    Object.assign(libro, input);
    if (input.alta_demanda !== undefined) libro.dias_prestamo = input.alta_demanda ? 3 : 15;
    libro.updated_at = nowIso();
    return libro;
  }

  delete(id: string): void {
    this.getById(id);
    if (db.ejemplares.some((ejemplar) => ejemplar.libro_id === id)) {
      throw new AppError(409, "libro_con_ejemplares");
    }
    db.libros = db.libros.filter((libro) => libro.id !== id);
  }

  private withAvailability(libro: Libro): Libro & {
    total_ejemplares: number;
    ejemplares_disponibles: number;
    disponible: boolean;
  } {
    const ejemplares = db.ejemplares.filter((ejemplar) => ejemplar.libro_id === libro.id);
    const disponibles = ejemplares.filter((ejemplar) => ejemplar.estado === "DISPONIBLE").length;
    return {
      ...libro,
      total_ejemplares: ejemplares.length,
      ejemplares_disponibles: disponibles,
      disponible: disponibles > 0
    };
  }
}
