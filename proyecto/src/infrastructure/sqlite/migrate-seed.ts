import { seedData } from "../memory/seed";
import { getDatabase, initializeDatabase, runInTransaction } from "./connection";
import { clearDataSql } from "./schema";

export function migrateSeedToSQLite(options: { clearExisting?: boolean } = {}): void {
  const db = getDatabase();
  initializeDatabase(db);
  const seed = seedData();

  runInTransaction(() => {
    if (options.clearExisting) db.exec(clearDataSql);

    const insertLibro = db.prepare(`
      INSERT INTO libros (
        id, codigo_inventario, titulo, autor, sala, alta_demanda, dias_prestamo, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertEjemplar = db.prepare(`
      INSERT INTO ejemplares (
        id, libro_id, codigo_ejemplar, estado, observaciones, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const insertEstudiante = db.prepare(`
      INSERT INTO estudiantes (
        id, codigo_estudiante, nombre, programa, semestre, tipo, max_prestamos_activos,
        multas_pendientes, activo, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertPrestamo = db.prepare(`
      INSERT INTO prestamos (
        id, estudiante_id, ejemplar_id, fecha_prestamo, fecha_devolucion_esperada,
        fecha_devolucion_real, estado, renovaciones, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const insertSolicitud = db.prepare(`
      INSERT INTO solicitudes (
        id, estudiante_id, libro_id, fecha_solicitud, estado, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const insertMulta = db.prepare(`
      INSERT INTO multas (
        id, prestamo_id, estudiante_id, dias_retraso, valor_por_dia, valor_total,
        pagada, fecha_generacion, fecha_pago
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    seed.libros.forEach((libro) => {
      insertLibro.run(
        libro.id,
        libro.codigo_inventario,
        libro.titulo,
        libro.autor,
        libro.sala,
        libro.alta_demanda ? 1 : 0,
        libro.dias_prestamo,
        libro.created_at,
        libro.updated_at
      );
    });

    seed.ejemplares.forEach((ejemplar) => {
      insertEjemplar.run(
        ejemplar.id,
        ejemplar.libro_id,
        ejemplar.codigo_ejemplar,
        ejemplar.estado,
        ejemplar.observaciones ?? null,
        ejemplar.created_at,
        ejemplar.updated_at
      );
    });

    seed.estudiantes.forEach((estudiante) => {
      insertEstudiante.run(
        estudiante.id,
        estudiante.codigo_estudiante,
        estudiante.nombre,
        estudiante.programa,
        estudiante.semestre,
        estudiante.tipo,
        estudiante.max_prestamos_activos,
        estudiante.multas_pendientes,
        estudiante.activo ? 1 : 0,
        estudiante.created_at,
        estudiante.updated_at
      );
    });

    seed.prestamos.forEach((prestamo) => {
      insertPrestamo.run(
        prestamo.id,
        prestamo.estudiante_id,
        prestamo.ejemplar_id,
        prestamo.fecha_prestamo,
        prestamo.fecha_devolucion_esperada,
        prestamo.fecha_devolucion_real ?? null,
        prestamo.estado,
        prestamo.renovaciones,
        prestamo.created_at,
        prestamo.updated_at
      );
    });

    seed.solicitudes.forEach((solicitud) => {
      insertSolicitud.run(
        solicitud.id,
        solicitud.estudiante_id,
        solicitud.libro_id,
        solicitud.fecha_solicitud,
        solicitud.estado,
        solicitud.created_at,
        solicitud.updated_at
      );
    });

    seed.multas.forEach((multa) => {
      insertMulta.run(
        multa.id,
        multa.prestamo_id,
        multa.estudiante_id,
        multa.dias_retraso,
        multa.valor_por_dia,
        multa.valor_total,
        multa.pagada ? 1 : 0,
        multa.fecha_generacion,
        multa.fecha_pago ?? null
      );
    });
  });
}

export function resetDatabase(): void {
  migrateSeedToSQLite({ clearExisting: true });
}
