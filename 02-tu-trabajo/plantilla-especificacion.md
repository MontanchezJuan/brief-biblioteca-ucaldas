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

| Método | Ruta          | Propósito       | Body / Query                   | Respuesta éxito    | Códigos error posibles |
| ------ | ------------- | --------------- | ------------------------------ | ------------------ | ---------------------- |
| `GET`  | `/libros`     | Listar catálogo | filtros opcionales             | `200` con lista    | -                      |
| `GET`  | `/libros/:id` | Detalle libro   | -                              | `200` con objeto   | `404`                  |
| `POST` | `/prestamos`  | Crear préstamo  | `{estudiante_id, ejemplar_id}` | `201` con préstamo | `400`, `404`, `409`    |
| ...    | ...           | ...             | ...                            | ...                | ...                    |

[Llena la tabla con todos los endpoints que necesitas. Mínimo 8.]

---

## 5. Reglas de negocio

### RN1 — [nombre corto de la regla]

- **Trigger:** [cuándo se evalúa]
- **Condición:** [qué se valida exactamente, en términos precisos]
- **Acción si cumple:** [qué hace el sistema]
- **Acción si no cumple:** [código HTTP, mensaje, qué retorna]

**Ejemplo:**

### RN1 — Límite de préstamos por tipo de estudiante

- **Trigger:** al recibir `POST /prestamos`.
- **Condición:**
  - Estudiante de pregrado: máximo 3 préstamos con `estado = "activo"`.
  - Estudiante de posgrado: máximo 5 préstamos con `estado = "activo"`.
- **Acción si cumple:** continuar con el flujo de creación.
- **Acción si no cumple:** retornar `409 Conflict` con `{error: "limite_prestamos_alcanzado", limite: N, actuales: M}`.

[Llena RN2, RN3, RN4... hasta cubrir todas las reglas del correo.]

### RN2 — [...]

[...]

### RN3 — [...]

[...]

---

## 6. Decisiones tomadas (lo que el correo no dice)

### D1 — [Decisión que tomaste]

- **Contexto:** [qué hueco había]
- **Decisión:** [qué decidiste]
- **Justificación:** [por qué esta decisión y no otra]

**Ejemplo:**

### D1 — Cálculo de días para multa

- **Contexto:** el correo no precisa si los días de retraso son calendario o hábiles.
- **Decisión:** usar días calendario.
- **Justificación:** es la interpretación más simple y se alinea con lo que la mayoría de bibliotecas hacen.

[Mínimo 5 decisiones documentadas.]

### D2, D3, D4, D5...

---

## 7. Códigos HTTP usados

| Código | Significado           | Cuándo se usa                                                  |
| ------ | --------------------- | -------------------------------------------------------------- |
| 200    | OK                    | GET exitosos                                                   |
| 201    | Created               | POST exitosos que crean recursos                               |
| 400    | Bad Request           | Body malformado o validación fallida                           |
| 404    | Not Found             | Recurso no existe                                              |
| 409    | Conflict              | Reglas de negocio violadas (límite alcanzado, duplicado, etc.) |
| 500    | Internal Server Error | Error no controlado del servidor                               |

---

## 8. Restricciones técnicas

- **Stack:** [Node.js + Express / Python + FastAPI / etc.]
- **Persistencia:** datos en memoria. No usar base de datos.
- **TypeScript** (según tu stack).
- **Sin autenticación** en esta versión.
- **Sin frontend** en esta versión. Solo API REST.
