# API Biblioteca UCaldas

API REST en Node.js, Express y TypeScript para gestionar el sistema de prestamo de libros definido en la especificacion del taller.

## Stack

- Node.js
- Express
- TypeScript
- Zod
- Jest
- Supertest
- Datos en memoria

## Instalacion

```bash
npm install
```

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
