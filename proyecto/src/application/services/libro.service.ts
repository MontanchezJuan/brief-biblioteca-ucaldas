import { AppError } from "../../domain/errors/app-error";
import { Libro } from "../../domain/entities/libro";
import { LibroRepository } from "../../infrastructure/sqlite/repositories/libro.repository";
import { createId } from "../../shared/id";
import { nowIso } from "../../shared/date";

type CreateLibroInput = Pick<Libro, "codigo_inventario" | "titulo" | "autor" | "sala" | "alta_demanda">;
type UpdateLibroInput = Partial<Pick<Libro, "titulo" | "autor" | "sala" | "alta_demanda">>;

export class LibroService {
  private readonly libros = new LibroRepository();

  list(filters: {
    titulo?: string;
    autor?: string;
    sala?: string;
    alta_demanda?: boolean;
    disponible?: boolean;
  }): Array<Libro & { total_ejemplares: number; ejemplares_disponibles: number; disponible: boolean }> {
    return this.libros.listWithAvailability().filter((libro) => {
      if (filters.titulo && !libro.titulo.toLowerCase().includes(filters.titulo.toLowerCase())) return false;
      if (filters.autor && !libro.autor.toLowerCase().includes(filters.autor.toLowerCase())) return false;
      if (filters.sala && libro.sala.toLowerCase() !== filters.sala.toLowerCase()) return false;
      if (filters.alta_demanda !== undefined && libro.alta_demanda !== filters.alta_demanda) return false;
      if (filters.disponible !== undefined && libro.disponible !== filters.disponible) return false;
      return true;
    });
  }

  getById(id: string): Libro {
    const libro = this.libros.findById(id);
    if (!libro) throw new AppError(404, "libro_no_encontrado");
    return libro;
  }

  create(input: CreateLibroInput): Libro {
    if (this.libros.existsByCodigoInventario(input.codigo_inventario)) {
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
    return this.libros.create(libro);
  }

  update(id: string, input: UpdateLibroInput): Libro {
    const libro = this.getById(id);
    Object.assign(libro, input);
    if (input.alta_demanda !== undefined) libro.dias_prestamo = input.alta_demanda ? 3 : 15;
    libro.updated_at = nowIso();
    return this.libros.update(libro);
  }

  delete(id: string): void {
    this.getById(id);
    if (this.libros.hasEjemplares(id)) {
      throw new AppError(409, "libro_con_ejemplares");
    }
    this.libros.delete(id);
  }
}
