import { Ejemplar } from "../../domain/entities/ejemplar";
import { Estudiante } from "../../domain/entities/estudiante";
import { Libro } from "../../domain/entities/libro";
import { Multa } from "../../domain/entities/multa";
import { Prestamo } from "../../domain/entities/prestamo";
import { SolicitudReserva } from "../../domain/entities/solicitud-reserva";
import { seedData } from "./seed";

export interface MemoryDatabase {
  libros: Libro[];
  ejemplares: Ejemplar[];
  estudiantes: Estudiante[];
  prestamos: Prestamo[];
  solicitudes: SolicitudReserva[];
  multas: Multa[];
}

export const db: MemoryDatabase = seedData();

export function resetDatabase(): void {
  const fresh = seedData();
  db.libros = fresh.libros;
  db.ejemplares = fresh.ejemplares;
  db.estudiantes = fresh.estudiantes;
  db.prestamos = fresh.prestamos;
  db.solicitudes = fresh.solicitudes;
  db.multas = fresh.multas;
}
