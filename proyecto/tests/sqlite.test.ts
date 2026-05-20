import { getDatabase } from "../src/infrastructure/sqlite/connection";
import { resetDatabase } from "../src/infrastructure/sqlite/migrate-seed";
import { LibroService } from "../src/application/services/libro.service";

describe("sqlite persistence", () => {
  it("inicializa esquema y migra los datos base desde seed", () => {
    const db = getDatabase();

    const libros = db.prepare("SELECT COUNT(*) AS total FROM libros").get();
    const ejemplares = db.prepare("SELECT COUNT(*) AS total FROM ejemplares").get();
    const estudiantes = db.prepare("SELECT COUNT(*) AS total FROM estudiantes").get();

    expect(libros?.total).toBe(2);
    expect(ejemplares?.total).toBe(3);
    expect(estudiantes?.total).toBe(2);
  });

  it("activa foreign keys y rechaza relaciones invalidas", () => {
    const db = getDatabase();
    const foreignKeys = db.prepare("PRAGMA foreign_keys").get();

    expect(foreignKeys?.foreign_keys).toBe(1);
    expect(() => {
      db.prepare(
        `
        INSERT INTO ejemplares (
          id, libro_id, codigo_ejemplar, estado, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
        `
      ).run("eje-invalid", "lib-inexistente", "INVALID-001", "DISPONIBLE", new Date().toISOString(), new Date().toISOString());
    }).toThrow();
  });

  it("la migracion es reproducible y vuelve al estado base", () => {
    const libros = new LibroService();

    libros.create({
      codigo_inventario: "BIB-FIS-001",
      titulo: "Fisica universitaria",
      autor: "Sonia Castro",
      sala: "Ciencias exactas",
      alta_demanda: true
    });

    expect(libros.list({})).toHaveLength(3);

    resetDatabase();

    expect(libros.list({})).toHaveLength(2);
    expect(libros.list({ titulo: "Fisica" })).toHaveLength(0);
  });
});
