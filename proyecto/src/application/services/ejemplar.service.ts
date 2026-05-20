import { EstadoEjemplar, Ejemplar } from "../../domain/entities/ejemplar";
import { AppError } from "../../domain/errors/app-error";
import { EjemplarRepository } from "../../infrastructure/sqlite/repositories/ejemplar.repository";
import { createId } from "../../shared/id";
import { nowIso } from "../../shared/date";
import { LibroService } from "./libro.service";

export class EjemplarService {
  private readonly libros = new LibroService();
  private readonly ejemplares = new EjemplarRepository();

  listByLibro(libroId: string, estado?: EstadoEjemplar): Ejemplar[] {
    this.libros.getById(libroId);
    return this.ejemplares.listByLibro(libroId).filter((ejemplar) => !estado || ejemplar.estado === estado);
  }

  create(libroId: string, input: { codigo_ejemplar: string; estado?: EstadoEjemplar }): Ejemplar {
    this.libros.getById(libroId);
    if (this.ejemplares.existsByCodigo(input.codigo_ejemplar)) {
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
    return this.ejemplares.create(ejemplar);
  }

  update(id: string, input: { estado: EstadoEjemplar; observaciones?: string }): Ejemplar {
    const ejemplar = this.ejemplares.findById(id);
    if (!ejemplar) throw new AppError(404, "ejemplar_no_encontrado");
    ejemplar.estado = input.estado;
    ejemplar.observaciones = input.observaciones;
    ejemplar.updated_at = nowIso();
    return this.ejemplares.update(ejemplar);
  }
}
