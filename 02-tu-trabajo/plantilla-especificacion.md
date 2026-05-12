# Especificación Formal — Sistema de Préstamo de Libros

> **Autor:** Juan Felipe Montanchez Botina
> **Fecha:** 05 de Mayo de 2026
> **Versión:** 1.0
> **Brief de origen:** Correo de Diana Restrepo, Coordinadora de Biblioteca

---

## 1. Propósito del sistema

Actualmente en una biblioteca se usan hojas de calculo y se necesita un software de biblioteca en el cual se necesitan las siguientes caracteristicas: ver los libros disponibles, solicitar libros por parte de los estudiantes, vigencia de libros prestados, prestamos vencidos.

---

## 2. Alcance

**Incluido en esta versión:**

- CRUD de libros
- Consultas de vigencia de libros

**Explícitamente fuera del alcance:**

- Prestamos
- Devoluciones

---

## 3. Modelo de datos

### Entidad: Libro

| Campo             | Tipo          | Obligatorio | Descripción                                             |
| ----------------- | ------------- | ----------- | ------------------------------------------------------- |
| id                | string (UUID) | sí          | Identificador interno del libro                         |
| codigo_inventario | string        | sí          | Código único del libro en catálogo                      |
| titulo            | string        | sí          | Título del libro                                        |
| autor             | string        | sí          | Autor principal                                         |
| sala              | string        | sí          | Sala donde se ubica el libro                            |
| alta_demanda      | boolean       | sí          | Indica si es libro de reserva (alta demanda)            |
| dias_prestamo     | number        | sí          | Días permitidos de préstamo (15 normal, 3 alta demanda) |
| created_at        | datetime      | sí          | Fecha de creación del registro                          |
| updated_at        | datetime      | sí          | Última actualización del registro                       |

---

### Entidad: Ejemplar

Cada libro puede tener varios ejemplares físicos, cada uno con su código único.

| Campo           | Tipo          | Obligatorio | Descripción                                                               |
| --------------- | ------------- | ----------- | ------------------------------------------------------------------------- |
| id              | string (UUID) | sí          | Identificador interno del ejemplar                                        |
| libro_id        | string (FK)   | sí          | Referencia al libro al que pertenece                                      |
| codigo_ejemplar | string        | sí          | Código único físico del ejemplar                                          |
| estado          | enum          | sí          | Estado del ejemplar: `DISPONIBLE`, `PRESTADO`, `MANTENIMIENTO`, `PERDIDO` |
| observaciones   | string        | no          | Notas adicionales del ejemplar                                            |
| created_at      | datetime      | sí          | Fecha de creación del registro                                            |
| updated_at      | datetime      | sí          | Última actualización del registro                                         |

---

### Entidad: Estudiante

Solo se manejarán estudiantes de pregrado y posgrado.

| Campo                 | Tipo          | Obligatorio | Descripción                                                     |
| --------------------- | ------------- | ----------- | --------------------------------------------------------------- |
| id                    | string (UUID) | sí          | Identificador interno del estudiante                            |
| codigo_estudiante     | string        | sí          | Código único del estudiante                                     |
| nombre                | string        | sí          | Nombre completo del estudiante                                  |
| programa              | string        | sí          | Programa académico                                              |
| semestre              | number        | sí          | Semestre actual                                                 |
| tipo                  | enum          | sí          | Tipo de estudiante: `PREGRADO`, `POSGRADO`                      |
| max_prestamos_activos | number        | sí          | Máximo de préstamos activos permitidos (3 pregrado, 5 posgrado) |
| multas_pendientes     | number        | sí          | Valor acumulado de multas no pagadas                            |
| activo                | boolean       | sí          | Indica si el estudiante está habilitado                         |
| created_at            | datetime      | sí          | Fecha de creación del registro                                  |
| updated_at            | datetime      | sí          | Última actualización del registro                               |

---

### Entidad: Préstamo

Registro de préstamos de ejemplares.

| Campo                     | Tipo          | Obligatorio | Descripción                                          |
| ------------------------- | ------------- | ----------- | ---------------------------------------------------- |
| id                        | string (UUID) | sí          | Identificador del préstamo                           |
| estudiante_id             | string (FK)   | sí          | Referencia al estudiante que realiza el préstamo     |
| ejemplar_id               | string (FK)   | sí          | Referencia al ejemplar prestado                      |
| fecha_prestamo            | datetime      | sí          | Fecha en que se realiza el préstamo                  |
| fecha_devolucion_esperada | datetime      | sí          | Fecha límite de devolución                           |
| fecha_devolucion_real     | datetime      | no          | Fecha real de devolución (si ya fue devuelto)        |
| estado                    | enum          | sí          | Estado del préstamo: `ACTIVO`, `DEVUELTO`, `VENCIDO` |
| renovaciones              | number        | sí          | Cantidad de renovaciones realizadas                  |
| created_at                | datetime      | sí          | Fecha de creación del registro                       |
| updated_at                | datetime      | sí          | Última actualización del registro                    |

---

### Entidad: SolicitudReserva (opcional pero recomendada)

Se usa para bloquear renovaciones si otro estudiante solicitó el libro.

| Campo           | Tipo          | Obligatorio | Descripción                                  |
| --------------- | ------------- | ----------- | -------------------------------------------- |
| id              | string (UUID) | sí          | Identificador de la solicitud                |
| estudiante_id   | string (FK)   | sí          | Estudiante que solicita el libro             |
| libro_id        | string (FK)   | sí          | Libro solicitado (no ejemplar específico)    |
| fecha_solicitud | datetime      | sí          | Fecha en que se realiza la solicitud         |
| estado          | enum          | sí          | Estado: `PENDIENTE`, `ATENDIDA`, `CANCELADA` |
| created_at      | datetime      | sí          | Fecha de creación del registro               |
| updated_at      | datetime      | sí          | Última actualización del registro            |

---

### Entidad: Multa

Se genera automáticamente cuando el estudiante devuelve tarde un ejemplar.

| Campo            | Tipo          | Obligatorio | Descripción                                     |
| ---------------- | ------------- | ----------- | ----------------------------------------------- |
| id               | string (UUID) | sí          | Identificador de la multa                       |
| prestamo_id      | string (FK)   | sí          | Préstamo asociado a la multa                    |
| estudiante_id    | string (FK)   | sí          | Estudiante multado                              |
| dias_retraso     | number        | sí          | Días de retraso                                 |
| valor_por_dia    | number        | sí          | Valor por día (2000 pesos)                      |
| valor_total      | number        | sí          | Total calculado (dias_retraso \* valor_por_dia) |
| pagada           | boolean       | sí          | Indica si la multa ya fue pagada                |
| fecha_generacion | datetime      | sí          | Fecha de generación de la multa                 |
| fecha_pago       | datetime      | no          | Fecha de pago de la multa (si aplica)           |

---

### Diagrama de relaciones

```
Libro 1 --- N Ejemplar

Libro 1 --- N SolicitudReserva
Estudiante 1 --- N SolicitudReserva

Estudiante 1 --- N Prestamo
Ejemplar 1 --- N Prestamo (a lo largo del tiempo, pero solo 0..1 ACTIVO)

Prestamo 0..1 --- 1 Multa
Estudiante 1 --- N Multa
```

---

## 4. Endpoints REST

| Método   | Ruta                         | Propósito                                         | Body / Query                                                                       | Respuesta éxito                              | Códigos error posibles |
| -------- | ---------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------------------- | -------------------------------------------- | ---------------------- |
| `GET`    | `/libros`                    | Listar catálogo de libros                         | Query opcional: `titulo`, `autor`, `sala`, `alta_demanda`, `disponible=true/false` | `200` lista de libros                        | `400`                  |
| `GET`    | `/libros/:id`                | Consultar detalle de un libro                     | -                                                                                  | `200` objeto libro                           | `404`                  |
| `POST`   | `/libros`                    | Crear un libro                                    | `{codigo_inventario, titulo, autor, sala, alta_demanda}`                           | `201` libro creado                           | `400`, `409`           |
| `PUT`    | `/libros/:id`                | Actualizar un libro                               | `{titulo?, autor?, sala?, alta_demanda?}`                                          | `200` libro actualizado                      | `400`, `404`           |
| `DELETE` | `/libros/:id`                | Eliminar un libro                                 | -                                                                                  | `204` sin contenido                          | `404`, `409`           |
| `GET`    | `/libros/:id/ejemplares`     | Listar ejemplares de un libro                     | Query opcional: `estado`                                                           | `200` lista de ejemplares                    | `404`                  |
| `POST`   | `/libros/:id/ejemplares`     | Crear ejemplar asociado a un libro                | `{codigo_ejemplar, estado?}`                                                       | `201` ejemplar creado                        | `400`, `404`, `409`    |
| `PUT`    | `/ejemplares/:id`            | Actualizar estado de ejemplar                     | `{estado, observaciones?}`                                                         | `200` ejemplar actualizado                   | `400`, `404`           |
| `GET`    | `/estudiantes`               | Listar estudiantes                                | Query opcional: `codigo_estudiante`, `nombre`, `tipo`                              | `200` lista de estudiantes                   | `400`                  |
| `GET`    | `/estudiantes/:id`           | Consultar estudiante                              | -                                                                                  | `200` objeto estudiante                      | `404`                  |
| `POST`   | `/estudiantes`               | Crear estudiante                                  | `{codigo_estudiante, nombre, programa, semestre, tipo}`                            | `201` estudiante creado                      | `400`, `409`           |
| `PUT`    | `/estudiantes/:id`           | Actualizar estudiante                             | `{nombre?, programa?, semestre?, tipo?, activo?}`                                  | `200` estudiante actualizado                 | `400`, `404`           |
| `GET`    | `/estudiantes/:id/prestamos` | Consultar historial de préstamos de un estudiante | Query opcional: `estado`, `desde`, `hasta`                                         | `200` lista de préstamos                     | `404`                  |
| `GET`    | `/prestamos`                 | Listar préstamos del sistema                      | Query opcional: `estado`, `estudiante_id`, `vencidos=true`                         | `200` lista de préstamos                     | `400`                  |
| `POST`   | `/prestamos`                 | Crear préstamo de ejemplar                        | `{estudiante_id, ejemplar_id}`                                                     | `201` préstamo creado                        | `400`, `404`, `409`    |
| `POST`   | `/prestamos/:id/devolucion`  | Registrar devolución                              | `{fecha_devolucion_real?}`                                                         | `200` préstamo actualizado + multa si aplica | `400`, `404`, `409`    |
| `POST`   | `/prestamos/:id/renovar`     | Renovar préstamo                                  | -                                                                                  | `200` préstamo renovado                      | `404`, `409`           |
| `GET`    | `/prestamos/vencidos`        | Consultar préstamos vencidos                      | Query opcional: `dias_minimo`                                                      | `200` lista de préstamos vencidos            | `400`                  |
| `POST`   | `/solicitudes`               | Crear solicitud de reserva de libro               | `{estudiante_id, libro_id}`                                                        | `201` solicitud creada                       | `400`, `404`, `409`    |
| `GET`    | `/solicitudes`               | Listar solicitudes                                | Query opcional: `estado`, `libro_id`, `estudiante_id`                              | `200` lista de solicitudes                   | `400`                  |
| `PUT`    | `/solicitudes/:id`           | Cambiar estado de solicitud                       | `{estado}`                                                                         | `200` solicitud actualizada                  | `400`, `404`           |
| `GET`    | `/multas`                    | Listar multas                                     | Query opcional: `pagada`, `estudiante_id`                                          | `200` lista de multas                        | `400`                  |
| `POST`   | `/multas/:id/pagar`          | Registrar pago de multa                           | `{fecha_pago?}`                                                                    | `200` multa pagada                           | `404`, `409`           |

---

## 5. Reglas de negocio

### RN1 — Límite de préstamos por tipo de estudiante

- **Trigger:** al recibir `POST /prestamos`.
- **Condición:**
  - Estudiante tipo `PREGRADO`: máximo 3 préstamos con `estado = "ACTIVO"`.
  - Estudiante tipo `POSGRADO`: máximo 5 préstamos con `estado = "ACTIVO"`.
- **Acción si cumple:** permitir creación del préstamo.
- **Acción si no cumple:** retornar `409 Conflict` con `{error: "limite_prestamos_alcanzado", limite: N, actuales: M}`.

---

### RN2 — Bloqueo por préstamos vencidos

- **Trigger:** al recibir `POST /prestamos`.
- **Condición:** el estudiante tiene al menos 1 préstamo con `estado = "VENCIDO"` o (`estado="ACTIVO"` y `fecha_devolucion_esperada < hoy`).
- **Acción si cumple:** bloquear el préstamo.
- **Acción si no cumple:** continuar con el flujo.
- **Acción si no cumple la regla:** retornar `409 Conflict` con `{error: "estudiante_con_prestamo_vencido"}`.

---

### RN3 — Bloqueo por multas pendientes

- **Trigger:** al recibir `POST /prestamos`.
- **Condición:** `multas_pendientes > 0` o existe al menos una multa `pagada = false`.
- **Acción si cumple:** bloquear creación del préstamo.
- **Acción si no cumple:** continuar.
- **Acción si no cumple la regla:** retornar `409 Conflict` con `{error: "multas_pendientes", total: valor}`.

---

### RN4 — No prestar ejemplar no disponible

- **Trigger:** al recibir `POST /prestamos`.
- **Condición:** el ejemplar debe tener `estado = "DISPONIBLE"`.
- **Acción si cumple:** permitir préstamo.
- **Acción si no cumple:** retornar `409 Conflict` con `{error: "ejemplar_no_disponible", estado_actual: "PRESTADO"}`.

---

### RN5 — Un ejemplar solo puede tener un préstamo activo

- **Trigger:** al recibir `POST /prestamos`.
- **Condición:** no debe existir préstamo con `ejemplar_id = X` y `estado = "ACTIVO"`.
- **Acción si cumple:** permitir creación.
- **Acción si no cumple:** retornar `409 Conflict` con `{error: "ejemplar_con_prestamo_activo"}`.

---

### RN6 — Cálculo de fecha_devolucion_esperada según tipo de libro

- **Trigger:** al crear préstamo (`POST /prestamos`) o renovar (`POST /prestamos/:id/renovar`).
- **Condición:**
  - Si el libro tiene `alta_demanda = true` → plazo = 3 días.
  - Si no → plazo = 15 días.
- **Acción si cumple:** asignar `fecha_devolucion_esperada = fecha_prestamo + dias_prestamo`.

---

### RN7 — Renovación solo si el préstamo está activo

- **Trigger:** al recibir `POST /prestamos/:id/renovar`.
- **Condición:** préstamo debe tener `estado = "ACTIVO"`.
- **Acción si cumple:** continuar con renovación.
- **Acción si no cumple:** retornar `409 Conflict` con `{error: "prestamo_no_activo"}`.

---

### RN8 — Renovación bloqueada si existe solicitud pendiente del libro

- **Trigger:** al recibir `POST /prestamos/:id/renovar`.
- **Condición:** existe `SolicitudReserva` con `libro_id` del préstamo y `estado = "PENDIENTE"`.
- **Acción si cumple:** bloquear renovación.
- **Acción si no cumple:** permitir renovación.
- **Acción si no cumple la regla:** retornar `409 Conflict` con `{error: "renovacion_bloqueada_por_solicitud"}`.

---

### RN9 — Renovación actualiza fecha_devolucion_esperada

- **Trigger:** al recibir `POST /prestamos/:id/renovar`.
- **Condición:** se cumplen RN7 y RN8.
- **Acción si cumple:**
  - `renovaciones += 1`
  - `fecha_devolucion_esperada = hoy + dias_prestamo`
- **Acción si no cumple:** retornar error según regla fallida.

---

### RN10 — Registrar devolución cambia estado del préstamo y del ejemplar

- **Trigger:** al recibir `POST /prestamos/:id/devolucion`.
- **Condición:** préstamo debe existir y estar `ACTIVO` o `VENCIDO`.
- **Acción si cumple:**
  - set `fecha_devolucion_real = hoy`
  - set `estado = "DEVUELTO"`
  - set ejemplar.estado = `DISPONIBLE`
- **Acción si no cumple:** retornar `409 Conflict` con `{error: "prestamo_ya_devuelto"}`.

---

### RN11 — Cálculo de multa automática por retraso

- **Trigger:** al registrar devolución (`POST /prestamos/:id/devolucion`).
- **Condición:** `fecha_devolucion_real > fecha_devolucion_esperada`.
- **Acción si cumple:**
  - calcular `dias_retraso`
  - crear entidad `Multa`
  - actualizar `multas_pendientes` del estudiante
- **Acción si no cumple:** no se crea multa.

---

### RN12 — Valor de multa por día

- **Trigger:** al calcular multa.
- **Condición:** siempre que haya retraso.
- **Acción:** `valor_por_dia = 2000` y `valor_total = dias_retraso * 2000`.

---

### RN13 — Un estudiante puede solicitar reserva de un libro

- **Trigger:** al recibir `POST /solicitudes`.
- **Condición:** el libro existe y el estudiante existe.
- **Acción si cumple:** crear solicitud con `estado="PENDIENTE"`.
- **Acción si no cumple:** retornar `404 Not Found`.

---

### RN14 — No duplicar solicitudes pendientes del mismo estudiante al mismo libro

- **Trigger:** al recibir `POST /solicitudes`.
- **Condición:** no debe existir solicitud con `estudiante_id=X`, `libro_id=Y`, `estado="PENDIENTE"`.
- **Acción si cumple:** crear solicitud.
- **Acción si no cumple:** retornar `409 Conflict` con `{error: "solicitud_duplicada"}`.

---

### RN15 — Préstamos vencidos deben marcarse automáticamente

- **Trigger:** al consultar préstamos (`GET /prestamos`, `GET /prestamos/vencidos`) o al crear un nuevo préstamo.
- **Condición:** `estado="ACTIVO"` y `fecha_devolucion_esperada < hoy`.
- **Acción si cumple:** actualizar `estado="VENCIDO"`.

---

## 6. Decisiones tomadas (lo que el correo no dice)

### D1 — Los días de retraso se calculan como días calendario

- **Contexto:** el correo no define si son días hábiles o calendario.
- **Decisión:** se usarán días calendario.
- **Justificación:** simplifica el sistema y es el estándar más común.

---

### D2 — Las solicitudes se hacen por Libro y no por Ejemplar

- **Contexto:** el correo menciona que se solicita “ese libro”, no un ejemplar específico.
- **Decisión:** `SolicitudReserva` apunta a `libro_id`.
- **Justificación:** el usuario realmente espera cualquier ejemplar disponible.

---

### D3 — El estado VENCIDO se maneja a nivel de préstamo

- **Contexto:** no se explica cómo identificar vencidos técnicamente.
- **Decisión:** un préstamo se considera vencido cuando `fecha_devolucion_esperada < hoy` y no se ha devuelto.
- **Justificación:** permite consultas rápidas y bloqueo de préstamos.

---

### D4 — El sistema no permitirá eliminar libros con ejemplares asociados

- **Contexto:** el correo no indica políticas de borrado.
- **Decisión:** `DELETE /libros/:id` solo funciona si no tiene ejemplares.
- **Justificación:** evita pérdida de consistencia del catálogo.

---

### D5 — Un ejemplar en mantenimiento o perdido no se puede prestar

- **Contexto:** el correo solo habla de disponible o prestado.
- **Decisión:** se agregan estados `MANTENIMIENTO` y `PERDIDO`.
- **Justificación:** cubre casos reales frecuentes en bibliotecas.

---

### D6 — La multa se genera únicamente al momento de la devolución

- **Contexto:** el correo indica que se calcula al devolver.
- **Decisión:** no se generan multas automáticamente por el simple hecho de vencer.
- **Justificación:** cumple estrictamente la regla del correo y evita cálculos innecesarios.

---

### D7 — La multa queda asociada al préstamo y al estudiante

- **Contexto:** el correo solo dice que la multa se acumula al historial.
- **Decisión:** `Multa` tendrá `prestamo_id` y `estudiante_id`.
- **Justificación:** permite auditoría y trazabilidad completa.

---

### D8 — El sistema almacena multas pendientes en el estudiante como dato derivado

- **Contexto:** el correo no define si se calcula en tiempo real.
- **Decisión:** se mantiene `multas_pendientes` como acumulado.
- **Justificación:** permite validaciones rápidas al prestar.

---

## 7. Códigos HTTP usados

| Código | Significado           | Cuándo se usa                                                           |
| ------ | --------------------- | ----------------------------------------------------------------------- |
| 200    | OK                    | GET exitosos y actualizaciones correctas                                |
| 201    | Created               | Creación exitosa de libro, estudiante, préstamo, solicitud              |
| 204    | No Content            | Eliminación exitosa sin respuesta                                       |
| 400    | Bad Request           | Body inválido o parámetros incorrectos                                  |
| 404    | Not Found             | Libro, ejemplar, estudiante, préstamo, multa no existe                  |
| 409    | Conflict              | Reglas de negocio violadas (límite, bloqueos, no disponible, duplicado) |
| 422    | Unprocessable Entity  | Datos correctos en formato pero inválidos (ej: semestre negativo)       |
| 500    | Internal Server Error | Error inesperado del servidor                                           |

---

## 8. Restricciones técnicas

- **Stack:** Node.js + Express (TypeScript).
- **Arquitectura:** API REST.
- **Persistencia:** almacenamiento en memoria (arrays/maps). Sin base de datos.
- **Autenticación:** no se implementa en esta versión.
- **Autorización / roles:** no se implementa en esta versión.
- **Frontend:** no se incluye, solo API.
- **Formato de respuesta:** JSON.
- **Formato de fechas:** ISO 8601 (ej: `2026-05-05T10:30:00Z`).
- **Validación:** se deben validar tipos, campos obligatorios y reglas de negocio.
- **Registros únicos:**
  - `Libro.codigo_inventario` debe ser único.
  - `Ejemplar.codigo_ejemplar` debe ser único.
  - `Estudiante.codigo_estudiante` debe ser único.
- **Cálculos automáticos:**
  - vencimiento de préstamos
  - multas al devolver
- **Zona horaria:** se manejará en UTC para evitar inconsistencias.
- **Manejo de errores:** siempre retornar `{error: "codigo_error", detalle?: "..."}`.
