# API Biblioteca UCaldas

API REST en Node.js, Express y TypeScript para gestionar el sistema de prestamo de libros definido en la especificacion del taller.

## Stack

- Node.js
- Express
- TypeScript
- Zod
- SQLite (`node:sqlite`)
- Jest
- Supertest
- Persistencia en SQLite

## Instalacion

```bash
npm install
```

Requisito de runtime: Node.js 22 o superior con soporte para `node:sqlite`.

## Base de datos

La API usa SQLite como fuente activa de persistencia. Por defecto crea el archivo:

```bash
data/biblioteca.sqlite
```

Puede cambiarse con la variable de entorno `SQLITE_PATH`.

Inicializar el esquema:

```bash
npm run db:init
```

Migrar los datos base actuales desde `src/infrastructure/memory/seed.ts` hacia SQLite:

```bash
npm run db:migrate
```

El comando de migracion limpia las tablas existentes y vuelve a insertar el seed base. El archivo `seed.ts` queda como referencia historica y fuente de migracion inicial; no es la persistencia activa.

## Desarrollo

```bash
npm run dev
```

Servidor por defecto: `http://localhost:3000`.

## Produccion local

```bash
npm run build
npm start
```

## Tests

```bash
npm test
```

## Endpoints

- `GET /health`
- `GET /libros`
- `GET /libros/:id`
- `POST /libros`
- `PUT /libros/:id`
- `DELETE /libros/:id`
- `GET /libros/:id/ejemplares`
- `POST /libros/:id/ejemplares`
- `PUT /ejemplares/:id`
- `GET /estudiantes`
- `GET /estudiantes/:id`
- `POST /estudiantes`
- `PUT /estudiantes/:id`
- `GET /estudiantes/:id/prestamos`
- `GET /prestamos`
- `POST /prestamos`
- `POST /prestamos/:id/devolucion`
- `POST /prestamos/:id/renovar`
- `GET /prestamos/vencidos`
- `POST /solicitudes`
- `GET /solicitudes`
- `PUT /solicitudes/:id`
- `GET /multas`
- `POST /multas/:id/pagar`
