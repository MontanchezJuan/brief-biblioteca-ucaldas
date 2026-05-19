import { PrestamoService } from "../src/application/services/prestamo.service";
import { AppError } from "../src/domain/errors/app-error";
import { Prestamo } from "../src/domain/entities/prestamo";
import { db } from "../src/infrastructure/memory/database";

describe("PrestamoService", () => {
  it("RN1 - posgrado falla al intentar el sexto prestamo", () => {
    const service = new PrestamoService();
    const timestamp = "2026-05-05T10:00:00.000Z";
    const vigentes: Prestamo[] = Array.from({ length: 5 }, (_, index) => ({
      id: `pre-pos-${index + 1}`,
      estudiante_id: "est-002",
      ejemplar_id: `eje-pos-${index + 1}`,
      fecha_prestamo: timestamp,
      fecha_devolucion_esperada: "2099-05-20T10:00:00.000Z",
      estado: "ACTIVO",
      renovaciones: 0,
      created_at: timestamp,
      updated_at: timestamp
    }));

    db.prestamos.push(...vigentes);
    db.ejemplares.push({
      id: "eje-pos-006",
      libro_id: "lib-001",
      codigo_ejemplar: "ALG-001-F",
      estado: "DISPONIBLE",
      created_at: timestamp,
      updated_at: timestamp
    });

    let capturedError: unknown;
    try {
      service.create({ estudiante_id: "est-002", ejemplar_id: "eje-pos-006" });
    } catch (error) {
      capturedError = error;
    }

    expect(capturedError).toBeInstanceOf(AppError);
    expect((capturedError as AppError).statusCode).toBe(409);
    expect((capturedError as AppError).code).toBe("limite_prestamos_alcanzado");
    expect((capturedError as AppError).meta).toEqual({ limite: 5, actuales: 5 });
  });
});
