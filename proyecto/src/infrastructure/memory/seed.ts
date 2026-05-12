import { MemoryDatabase } from "./database";

const createdAt = "2026-05-05T10:00:00.000Z";

export function seedData(): MemoryDatabase {
  return {
    libros: [
      {
        id: "lib-001",
        codigo_inventario: "BIB-ALG-001",
        titulo: "Algoritmos basicos",
        autor: "Ana Ruiz",
        sala: "Ingenieria",
        alta_demanda: false,
        dias_prestamo: 15,
        created_at: createdAt,
        updated_at: createdAt
      },
      {
        id: "lib-002",
        codigo_inventario: "BIB-CAL-001",
        titulo: "Calculo diferencial",
        autor: "Luis Pardo",
        sala: "Ciencias exactas",
        alta_demanda: true,
        dias_prestamo: 3,
        created_at: createdAt,
        updated_at: createdAt
      }
    ],
    ejemplares: [
      {
        id: "eje-001",
        libro_id: "lib-001",
        codigo_ejemplar: "ALG-001-A",
        estado: "DISPONIBLE",
        created_at: createdAt,
        updated_at: createdAt
      },
      {
        id: "eje-002",
        libro_id: "lib-001",
        codigo_ejemplar: "ALG-001-B",
        estado: "DISPONIBLE",
        created_at: createdAt,
        updated_at: createdAt
      },
      {
        id: "eje-003",
        libro_id: "lib-002",
        codigo_ejemplar: "CAL-001-A",
        estado: "DISPONIBLE",
        created_at: createdAt,
        updated_at: createdAt
      }
    ],
    estudiantes: [
      {
        id: "est-001",
        codigo_estudiante: "2026001",
        nombre: "Laura Gomez",
        programa: "Ingenieria de Sistemas",
        semestre: 4,
        tipo: "PREGRADO",
        max_prestamos_activos: 3,
        multas_pendientes: 0,
        activo: true,
        created_at: createdAt,
        updated_at: createdAt
      },
      {
        id: "est-002",
        codigo_estudiante: "2026901",
        nombre: "Carlos Mejia",
        programa: "Maestria en Educacion",
        semestre: 2,
        tipo: "POSGRADO",
        max_prestamos_activos: 5,
        multas_pendientes: 0,
        activo: true,
        created_at: createdAt,
        updated_at: createdAt
      }
    ],
    prestamos: [],
    solicitudes: [],
    multas: []
  };
}
