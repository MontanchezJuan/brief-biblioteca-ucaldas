import { Estudiante, TipoEstudiante } from "../../domain/entities/estudiante";
import { AppError } from "../../domain/errors/app-error";
import { EstudianteRepository } from "../../infrastructure/sqlite/repositories/estudiante.repository";
import { createId } from "../../shared/id";
import { nowIso } from "../../shared/date";

export class EstudianteService {
  private readonly estudiantes = new EstudianteRepository();

  list(filters: { codigo_estudiante?: string; nombre?: string; tipo?: TipoEstudiante }): Estudiante[] {
    return this.estudiantes.list().filter((estudiante) => {
      if (filters.codigo_estudiante && estudiante.codigo_estudiante !== filters.codigo_estudiante) return false;
      if (filters.nombre && !estudiante.nombre.toLowerCase().includes(filters.nombre.toLowerCase())) return false;
      if (filters.tipo && estudiante.tipo !== filters.tipo) return false;
      return true;
    });
  }

  getById(id: string): Estudiante {
    const estudiante = this.estudiantes.findById(id);
    if (!estudiante) throw new AppError(404, "estudiante_no_encontrado");
    return estudiante;
  }

  create(input: {
    codigo_estudiante: string;
    nombre: string;
    programa: string;
    semestre: number;
    tipo: TipoEstudiante;
  }): Estudiante {
    if (this.estudiantes.existsByCodigo(input.codigo_estudiante)) {
      throw new AppError(409, "codigo_estudiante_duplicado");
    }
    const timestamp = nowIso();
    const estudiante: Estudiante = {
      id: createId(),
      ...input,
      max_prestamos_activos: input.tipo === "PREGRADO" ? 3 : 5,
      multas_pendientes: 0,
      activo: true,
      created_at: timestamp,
      updated_at: timestamp
    };
    return this.estudiantes.create(estudiante);
  }

  update(
    id: string,
    input: Partial<Pick<Estudiante, "nombre" | "programa" | "semestre" | "tipo" | "activo">>
  ): Estudiante {
    const estudiante = this.getById(id);
    Object.assign(estudiante, input);
    if (input.tipo) estudiante.max_prestamos_activos = input.tipo === "PREGRADO" ? 3 : 5;
    estudiante.updated_at = nowIso();
    return this.estudiantes.update(estudiante);
  }
}
