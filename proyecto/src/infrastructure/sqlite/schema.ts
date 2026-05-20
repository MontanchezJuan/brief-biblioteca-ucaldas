export const schemaSql = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS libros (
  id TEXT PRIMARY KEY,
  codigo_inventario TEXT NOT NULL UNIQUE,
  titulo TEXT NOT NULL,
  autor TEXT NOT NULL,
  sala TEXT NOT NULL,
  alta_demanda INTEGER NOT NULL CHECK (alta_demanda IN (0, 1)),
  dias_prestamo INTEGER NOT NULL CHECK (dias_prestamo > 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS ejemplares (
  id TEXT PRIMARY KEY,
  libro_id TEXT NOT NULL,
  codigo_ejemplar TEXT NOT NULL UNIQUE,
  estado TEXT NOT NULL CHECK (estado IN ('DISPONIBLE', 'PRESTADO', 'MANTENIMIENTO', 'PERDIDO')),
  observaciones TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (libro_id) REFERENCES libros(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS estudiantes (
  id TEXT PRIMARY KEY,
  codigo_estudiante TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  programa TEXT NOT NULL,
  semestre INTEGER NOT NULL CHECK (semestre > 0),
  tipo TEXT NOT NULL CHECK (tipo IN ('PREGRADO', 'POSGRADO')),
  max_prestamos_activos INTEGER NOT NULL CHECK (max_prestamos_activos > 0),
  multas_pendientes INTEGER NOT NULL CHECK (multas_pendientes >= 0),
  activo INTEGER NOT NULL CHECK (activo IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS prestamos (
  id TEXT PRIMARY KEY,
  estudiante_id TEXT NOT NULL,
  ejemplar_id TEXT NOT NULL,
  fecha_prestamo TEXT NOT NULL,
  fecha_devolucion_esperada TEXT NOT NULL,
  fecha_devolucion_real TEXT,
  estado TEXT NOT NULL CHECK (estado IN ('ACTIVO', 'DEVUELTO', 'VENCIDO')),
  renovaciones INTEGER NOT NULL CHECK (renovaciones >= 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (ejemplar_id) REFERENCES ejemplares(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_prestamos_ejemplar_activo
  ON prestamos(ejemplar_id)
  WHERE estado = 'ACTIVO';

CREATE INDEX IF NOT EXISTS idx_prestamos_estudiante ON prestamos(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_prestamos_estado ON prestamos(estado);

CREATE TABLE IF NOT EXISTS solicitudes (
  id TEXT PRIMARY KEY,
  estudiante_id TEXT NOT NULL,
  libro_id TEXT NOT NULL,
  fecha_solicitud TEXT NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('PENDIENTE', 'ATENDIDA', 'CANCELADA')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (libro_id) REFERENCES libros(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_solicitudes_pendiente_unica
  ON solicitudes(estudiante_id, libro_id)
  WHERE estado = 'PENDIENTE';

CREATE INDEX IF NOT EXISTS idx_solicitudes_libro_estado ON solicitudes(libro_id, estado);

CREATE TABLE IF NOT EXISTS multas (
  id TEXT PRIMARY KEY,
  prestamo_id TEXT NOT NULL,
  estudiante_id TEXT NOT NULL,
  dias_retraso INTEGER NOT NULL CHECK (dias_retraso > 0),
  valor_por_dia INTEGER NOT NULL CHECK (valor_por_dia > 0),
  valor_total INTEGER NOT NULL CHECK (valor_total >= 0),
  pagada INTEGER NOT NULL CHECK (pagada IN (0, 1)),
  fecha_generacion TEXT NOT NULL,
  fecha_pago TEXT,
  FOREIGN KEY (prestamo_id) REFERENCES prestamos(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_multas_estudiante ON multas(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_multas_pagada ON multas(pagada);
`;

export const clearDataSql = `
DELETE FROM multas;
DELETE FROM solicitudes;
DELETE FROM prestamos;
DELETE FROM ejemplares;
DELETE FROM estudiantes;
DELETE FROM libros;
`;
