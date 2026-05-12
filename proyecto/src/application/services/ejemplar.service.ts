import { EstadoEjemplar, Ejemplar } from "../../domain/entities/ejemplar";
import { AppError } from "../../domain/errors/app-error";
import { db } from "../../infrastructure/memory/database";
import { createId } from "../../shared/id";
import { nowIso } from "../../shared/date";
import { LibroService } from "./libro.service";

export class EjemplarService {
  private readonly libros = new LibroService();

  listByLibro(libroId: string, estado?: EstadoEjemplar): Ejemplar[] {
    this.libros.getById(libroId);
    return db.ejemplares.filter((ejemplar) => ejemplar.libro_id === libroId && (!estado || ejemplar.estado === estado));
  }

  create(libroId: string, input: { codigo_ejemplar: string; estado?: EstadoEjemplar }): Ejemplar {
    this.libros.getById(libroId);
    if (db.ejemplares.some((ejemplar) => ejemplar.codigo_ejemplar === input.codigo_ejemplar)) {
      throw new AppError(409, "codigo_ejemplar_duplicado");
    }
    const timestamp = nowIso();
    const ejemplar: Ejemplar = {
      id: createId(),
      libro_id: libroId,
      codigo_ejemplar: input.codigo_ejemplar,
      estado: input.estado ?? "DISPONIBLE",
      created_at: timestamp,
      updated_at: timestamp
    };
    db.ejemplares.push(ejemplar);
    return ejemplar;
  }

  update(id: string, input: { estado: EstadoEjemplar; observaciones?: string }): Ejemplar {
    const ejemplar = db.ejemplares.find((item) => item.id === id);
    if (!ejemplar) throw new AppError(404, "ejemplar_no_encontrado");
    ejemplar.estado = input.estado;
    ejemplar.observaciones = input.observaciones;
    ejemplar.updated_at = nowIso();
    return ejemplar;
  }
}
