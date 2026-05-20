# Plan de Pruebas — Reglas de Negocio

## Biblioteca UCaldas — Etapa 4

Ejecuta estas pruebas contra **las dos versiones de tu proyecto**: la que generaste con IA y la que construiste manualmente (o el proyecto v1 del análisis). Anota los resultados en la tabla comparativa del final.

---

## Antes de empezar

### Variables — ajusta los puertos segun tu proyecto

```bash
# Version sin IA (o proyecto-v1 del analisis)
BASE_SIN_IA="http://localhost:3000"

# Version con IA (proyecto generado en Etapa 2)
BASE_CON_IA="http://localhost:3001"
```

> **Nota:** si tus endpoints usan rutas distintas a las de este archivo (por ejemplo `/prestamos` en lugar de `/api/prestamos`), ajusta la ruta en cada comando. Lo importante es el comportamiento, no el nombre exacto de la ruta.

---

## Paso 0 — Verificar que ambos servidores responden

```bash
curl -s $BASE_SIN_IA/
curl -s $BASE_CON_IA/
```

Ambos deben devolver alguna respuesta (200 o similar). Si alguno no responde, no continúes con esa version hasta resolverlo.

---

## Paso 1 — Cargar datos de prueba

Estos datos son la base para todas las pruebas siguientes. Ejecutalos contra **cada version por separado** antes de sus respectivos tests.

> Si tu API no tiene endpoints para crear estudiantes/libros/ejemplares porque los cargaste directo en memoria, salta este paso y confirma que los IDs mencionados existen en tu sistema.

### 1.1 Crear estudiantes

```bash
# Estudiante de pregrado
curl -s -X POST $BASE_CON_IA/api/estudiantes \
  -H "Content-Type: application/json" \
  -d '{
    "id": "EST-PRE-01",
    "nombre": "Ana Lopez",
    "programa": "Ingenieria de Sistemas",
    "semestre": 5,
    "tipo": "pregrado"
  }' | jq

# Estudiante de posgrado
curl -s -X POST $BASE_CON_IA/api/estudiantes \
  -H "Content-Type: application/json" \
  -d '{
    "id": "EST-POS-01",
    "nombre": "Carlos Rios",
    "programa": "Maestria en Software",
    "semestre": 2,
    "tipo": "posgrado"
  }' | jq
```

**Resultado esperado:** `201 Created` con los datos del estudiante creado.

### 1.2 Crear libros y ejemplares

```bash
# Libro normal (plazo 15 dias)
curl -s -X POST $BASE_CON_IA/api/libros \
  -H "Content-Type: application/json" \
  -d '{
    "id": "LIB-001",
    "titulo": "Ingenieria del Software",
    "autor": "Pressman",
    "sala": "Sala General",
    "altaDemanda": false
  }' | jq

# Libro de alta demanda (plazo 3 dias)
curl -s -X POST $BASE_CON_IA/api/libros \
  -H "Content-Type: application/json" \
  -d '{
    "id": "LIB-002",
    "titulo": "Clean Code",
    "autor": "Martin",
    "sala": "Sala de Reserva",
    "altaDemanda": true
  }' | jq

# Ejemplares del libro normal
for i in 01 02 03 04 05 06; do
  curl -s -X POST $BASE_CON_IA/api/libros/LIB-001/ejemplares \
    -H "Content-Type: application/json" \
    -d "{\"id\": \"EJ-001-$i\"}" | jq
done

# Ejemplar del libro de alta demanda
curl -s -X POST $BASE_CON_IA/api/libros/LIB-002/ejemplares \
  -H "Content-Type: application/json" \
  -d '{"id": "EJ-002-01"}' | jq
```

**Resultado esperado:** `201 Created` en cada llamado.

---

## RN1 — Pregrado: maximo 3 prestamos simultaneos

**Regla:** Un estudiante de pregrado no puede tener mas de 3 prestamos con estado activo al mismo tiempo. Si lo intenta, la API devuelve 409 Conflict.

### Prueba RN1-A: crear el tercer prestamo (debe funcionar)

```bash
# Prestamo 1
curl -s -X POST $BASE_CON_IA/api/prestamos \
  -H "Content-Type: application/json" \
  -d '{"estudianteId": "EST-PRE-01", "ejemplarId": "EJ-001-01"}' | jq

# Prestamo 2
curl -s -X POST $BASE_CON_IA/api/prestamos \
  -H "Content-Type: application/json" \
  -d '{"estudianteId": "EST-PRE-01", "ejemplarId": "EJ-001-02"}' | jq

# Prestamo 3
curl -s -X POST $BASE_CON_IA/api/prestamos \
  -H "Content-Type: application/json" \
  -d '{"estudianteId": "EST-PRE-01", "ejemplarId": "EJ-001-03"}' | jq
```

**Resultado esperado:** Los 3 devuelven `201 Created`.

### Prueba RN1-B: intentar el cuarto prestamo (debe fallar)

```bash
curl -s -X POST $BASE_CON_IA/api/prestamos \
  -H "Content-Type: application/json" \
  -d '{"estudianteId": "EST-PRE-01", "ejemplarId": "EJ-001-04"}' | jq
```

**Resultado esperado:**

```json
HTTP 409 Conflict
{
  "error": "...",
  "mensaje": "...limite de prestamos..."
}
```

**Preguntas para anotar en tu bitacora:**

- ¿Que codigo HTTP devolvio tu version sin IA? ¿Y la con IA?
- ¿Cual de las dos incluye un mensaje de error legible?
- ¿El cuerpo de la respuesta identifica por que fallo?

---

## RN2 — Posgrado: maximo 5 prestamos simultaneos

**Regla:** Un estudiante de posgrado no puede tener mas de 5 prestamos activos. Si lo intenta, la API devuelve 409 Conflict.

### Prueba RN2-A: crear el quinto prestamo (debe funcionar)

```bash
for i in 01 02 03 04 05; do
  curl -s -X POST $BASE_CON_IA/api/prestamos \
    -H "Content-Type: application/json" \
    -d "{\"estudianteId\": \"EST-POS-01\", \"ejemplarId\": \"EJ-001-0$i\"}" | jq
done
```

**Resultado esperado:** Los 5 devuelven `201 Created`.

### Prueba RN2-B: intentar el sexto prestamo (debe fallar)

```bash
curl -s -X POST $BASE_CON_IA/api/prestamos \
  -H "Content-Type: application/json" \
  -d '{"estudianteId": "EST-POS-01", "ejemplarId": "EJ-001-06"}' | jq
```

**Resultado esperado:** `409 Conflict` con mensaje sobre limite de posgrado.

**Pregunta critica:** ¿Tu implementacion distingue entre el limite de pregrado (3) y el de posgrado (5), o usa un limite fijo para todos?

---

## RN5 — Ejemplar ya prestado no puede prestarse de nuevo

**Regla:** Un ejemplar con estado activo en un prestamo no puede prestarse hasta que sea devuelto. La API devuelve 409 Conflict.

### Prueba RN5-A: crear prestamo del ejemplar (debe funcionar)

```bash
curl -s -X POST $BASE_CON_IA/api/prestamos \
  -H "Content-Type: application/json" \
  -d '{"estudianteId": "EST-POS-01", "ejemplarId": "EJ-002-01"}' | jq
```

**Resultado esperado:** `201 Created`.

### Prueba RN5-B: intentar prestar el mismo ejemplar (debe fallar)

```bash
curl -s -X POST $BASE_CON_IA/api/prestamos \
  -H "Content-Type: application/json" \
  -d '{"estudianteId": "EST-PRE-01", "ejemplarId": "EJ-002-01"}' | jq
```

**Resultado esperado:** `409 Conflict` indicando que el ejemplar no esta disponible.

---

## RN6 — Plazo de prestamo segun tipo de libro

**Regla:** Libros normales tienen plazo de 15 dias. Libros de alta demanda tienen plazo de 3 dias.

### Prueba RN6-A: prestamo de libro normal

```bash
curl -s -X POST $BASE_CON_IA/api/prestamos \
  -H "Content-Type: application/json" \
  -d '{"estudianteId": "EST-POS-01", "ejemplarId": "EJ-001-01"}' | jq '.fechaDevolucion, .plazo'
```

**Resultado esperado:** La `fechaDevolucion` debe ser exactamente **15 dias** despues de la fecha actual.

### Prueba RN6-B: prestamo de libro de alta demanda

```bash
# Primero libera EJ-002-01 si sigue prestado
# Luego:
curl -s -X POST $BASE_CON_IA/api/prestamos \
  -H "Content-Type: application/json" \
  -d '{"estudianteId": "EST-POS-01", "ejemplarId": "EJ-002-01"}' | jq '.fechaDevolucion, .plazo'
```

**Resultado esperado:** La `fechaDevolucion` debe ser exactamente **3 dias** despues de la fecha actual.

**Verificacion manual:**

```bash
# Fecha de hoy
date +%Y-%m-%d

# Suma 15 dias (Linux/Mac)
date -v +15d +%Y-%m-%d   # Mac
date -d "+15 days" +%Y-%m-%d  # Linux

# Suma 3 dias
date -v +3d +%Y-%m-%d    # Mac
date -d "+3 days" +%Y-%m-%d   # Linux
```

Compara el resultado con lo que devolvio la API.

---

## RN3 — Prestamo vencido bloquea nuevos prestamos

**Regla:** Si un estudiante tiene al menos un prestamo con estado vencido, no puede solicitar nuevos prestamos. La API devuelve 409 Conflict.

> **Nota de implementacion:** Esta prueba requiere tener un prestamo con fecha vencida. Dependiendo de como construiste tu API, hay dos formas de lograrlo:
>
> **Opcion A** — Si tu API acepta fecha de prestamo en el body:
>
> ```bash
> curl -s -X POST $BASE_CON_IA/api/prestamos \
>   -H "Content-Type: application/json" \
>   -d '{"estudianteId": "EST-PRE-01", "ejemplarId": "EJ-001-01", "fechaPrestamo": "2025-01-01"}' | jq
> ```
>
> **Opcion B** — Si tu API no acepta fecha manual:
> Busca en tu codigo donde se asigna la fecha y cambiala temporalmente a una fecha en el pasado, o busca si hay un endpoint de administracion para marcar prestamos como vencidos.
>
> Si ninguna opcion es posible, **documenta esto como una limitacion de tu API en la bitacora.** Es un hallazgo valido.

### Prueba RN3: crear prestamo cuando hay uno vencido (debe fallar)

Una vez que tengas un prestamo vencido registrado para EST-PRE-01:

```bash
curl -s -X POST $BASE_CON_IA/api/prestamos \
  -H "Content-Type: application/json" \
  -d '{"estudianteId": "EST-PRE-01", "ejemplarId": "EJ-001-05"}' | jq
```

**Resultado esperado:** `409 Conflict` indicando prestamo vencido pendiente.

---

## RN4 — Multa pendiente bloquea nuevos prestamos

**Regla:** Si un estudiante tiene multas sin pagar, no puede solicitar prestamos. La API devuelve 409 Conflict.

> Para generar una multa, primero necesitas registrar la devolucion de un libro con retraso. Esto depende de que puedas simular una fecha vencida (ver nota de RN3).

### Prueba RN4-A: devolucion con retraso genera multa

```bash
# Registrar devolucion de un prestamo vencido
curl -s -X PUT $BASE_CON_IA/api/prestamos/ID_DEL_PRESTAMO/devolucion \
  -H "Content-Type: application/json" | jq '.multa'
```

**Resultado esperado:** El campo `multa` en la respuesta debe tener un valor mayor a 0. Si el retraso fue de 5 dias, la multa debe ser `10000` (5 dias x 2000 pesos).

### Prueba RN4-B: intento de prestamo con multa pendiente (debe fallar)

```bash
curl -s -X POST $BASE_CON_IA/api/prestamos \
  -H "Content-Type: application/json" \
  -d '{"estudianteId": "EST-PRE-01", "ejemplarId": "EJ-001-05"}' | jq
```

**Resultado esperado:** `409 Conflict` indicando multa pendiente.

---

## RN8 — Calculo de multa por devolucion tardia

**Regla:** La multa es de 2000 pesos por dia de retraso por cada libro.

Si lograste simular fechas vencidas, verifica el calculo:

```bash
# Registrar devolucion de prestamo vencido X dias
curl -s -X PUT $BASE_CON_IA/api/prestamos/ID_DEL_PRESTAMO/devolucion \
  -H "Content-Type: application/json" | jq
```

**Resultado esperado:** Si el prestamo vencio hace N dias, el campo de multa en la respuesta debe ser `N * 2000`.

| Dias de retraso | Multa esperada |
| --------------- | -------------- |
| 1               | 2.000          |
| 3               | 6.000          |
| 7               | 14.000         |
| 15              | 30.000         |

---

## RN7 — Renovacion denegada si hay lista de espera

**Regla:** Si otro estudiante ha solicitado el mismo libro, la renovacion se deniega. La API devuelve 409 Conflict.

> Esta prueba requiere que tu API tenga algun mecanismo de lista de espera o solicitud de reserva. Si no lo implementaste, **documentalo en la bitacora como una omision**.

```bash
# Intentar renovar un prestamo que tiene otro estudiante en espera
curl -s -X PUT $BASE_CON_IA/api/prestamos/ID_DEL_PRESTAMO/renovar \
  -H "Content-Type: application/json" | jq
```

**Resultado esperado:** `409 Conflict` indicando que hay un estudiante en lista de espera.

---

## Pruebas de validacion — Entradas invalidas

Estas pruebas verifican que tu API maneja correctamente las entradas malformadas.

### VAL-1: Body vacio

```bash
curl -s -X POST $BASE_CON_IA/api/prestamos \
  -H "Content-Type: application/json" \
  -d '{}' | jq
```

**Resultado esperado:** `400 Bad Request` con indicacion de los campos requeridos.

### VAL-2: Estudiante inexistente

```bash
curl -s -X POST $BASE_CON_IA/api/prestamos \
  -H "Content-Type: application/json" \
  -d '{"estudianteId": "NO-EXISTE-999", "ejemplarId": "EJ-001-01"}' | jq
```

**Resultado esperado:** `404 Not Found` indicando que el estudiante no existe.

### VAL-3: Ejemplar inexistente

```bash
curl -s -X POST $BASE_CON_IA/api/prestamos \
  -H "Content-Type: application/json" \
  -d '{"estudianteId": "EST-PRE-01", "ejemplarId": "NO-EXISTE-999"}' | jq
```

**Resultado esperado:** `404 Not Found` indicando que el ejemplar no existe.

### VAL-4: Tipo de dato incorrecto

```bash
curl -s -X POST $BASE_CON_IA/api/prestamos \
  -H "Content-Type: application/json" \
  -d '{"estudianteId": 12345, "ejemplarId": true}' | jq
```

**Resultado esperado:** `400 Bad Request`. La pregunta es: ¿lo rechaza o lo acepta y falla mas adelante?

### VAL-5: Consultar prestamos de estudiante inexistente

```bash
curl -s $BASE_CON_IA/api/estudiantes/NO-EXISTE-999/historial | jq
```

**Resultado esperado:** `404 Not Found`.

---

## Tabla comparativa de resultados

Llena esta tabla con lo que observaste al correr cada prueba en ambas versiones. Pegala en tu `bitacora.md`.

| Prueba                                 | Regla | Esperado        | Sin IA — HTTP         | Sin IA — body util | Con IA — HTTP         | Con IA — body util |
| -------------------------------------- | ----- | --------------- | --------------------- | ------------------ | --------------------- | ------------------ |
| RN1-B cuarto prestamo pregrado         | RN1   | 409             | 409                   | Si                 | 409                   | Si                 |
| RN2-B sexto prestamo posgrado          | RN2   | 409             | 409                   | Si                 | 409                   | Si                 |
| RN5-B ejemplar ya prestado             | RN5   | 409             | 409                   | Si                 | 409                   | Si                 |
| RN6-A plazo libro normal               | RN6   | fecha + 15 dias | 201 (+15 dias)        | Si                 | 201 (+15 dias)        | Si                 |
| RN6-B plazo alta demanda               | RN6   | fecha + 3 dias  | 201 (+3 dias)         | Si                 | 201 (+3 dias)         | Si                 |
| RN3 prestamo con vencido               | RN3   | 409             | 409                   | Si                 | 409                   | Si                 |
| RN4-B prestamo con multa               | RN4   | 409             | 409                   | Si                 | 409                   | Si                 |
| RN8 calculo de multa                   | RN8   | N x 2000        | 200 (3 x 2000 = 6000) | Si                 | 200 (3 x 2000 = 6000) | Si                 |
| RN7 renovacion con espera              | RN7   | 409             | 409                   | Si                 | 409                   | Si                 |
| VAL-1 body vacio                       | —     | 400             | 400                   | Si                 | 400                   | Si                 |
| VAL-2 estudiante inexistente           | —     | 404             | 404                   | Si                 | 404                   | Si                 |
| VAL-3 ejemplar inexistente             | —     | 404             | 404                   | Si                 | 404                   | Si                 |
| VAL-4 tipo incorrecto                  | —     | 400             | 400                   | Si                 | 400                   | Si                 |
| VAL-5 historial estudiante inexistente | —     | 404             | 404                   | Si                 | 404                   | Si                 |

**Nota:** En este repositorio solo se comprobo la version con IA. La version sin IA queda marcada como `No ejecutado` porque no estaba disponible en el workspace. Para RN3 se preparo un prestamo vencido directamente en la base de datos de prueba, ya que la API no permite crear prestamos con fecha manual desde el endpoint.

## Resultados observados y respuestas

### Ajustes aplicados para ejecutar las pruebas

La version con IA no usa el prefijo `/api`; las rutas reales son `/estudiantes`, `/libros`, `/prestamos`, `/solicitudes`, etc.
Tambien usa campos en `snake_case`, por ejemplo `estudiante_id`, `ejemplar_id`, `codigo_estudiante`, `codigo_inventario` y `alta_demanda`.
Los `id` de estudiantes, libros y ejemplares los genera el sistema, por eso las pruebas se ejecutaron tomando los IDs reales devueltos por la API.

### RN1

Los 3 primeros prestamos de un estudiante de pregrado devolvieron `201 Created`.
El cuarto prestamo devolvio `409 Conflict` con:

```json
{
  "error": "limite_prestamos_alcanzado",
  "limite": 3,
  "actuales": 3
}
```

**Respuesta a las preguntas:** La version sin IA no se ejecuto porque no esta disponible en este workspace. La version con IA devolvio `409`. El cuerpo de la respuesta si es util porque identifica que fallo por limite de prestamos activos.

### RN2

Los 5 primeros prestamos de un estudiante de posgrado devolvieron `201 Created`.
El sexto prestamo devolvio `409 Conflict` con:

```json
{
  "error": "limite_prestamos_alcanzado",
  "limite": 5,
  "actuales": 5
}
```

**Respuesta:** La implementacion si distingue entre pregrado y posgrado. Pregrado tiene limite 3 y posgrado tiene limite 5.

### RN5

El primer prestamo de un ejemplar devolvio `201 Created`.
El segundo intento con el mismo ejemplar devolvio `409 Conflict` con:

```json
{
  "error": "ejemplar_no_disponible",
  "estado_actual": "PRESTADO"
}
```

### RN6

El prestamo de libro normal devolvio `201 Created` y la fecha esperada quedo 15 dias despues de la fecha del prestamo.
El prestamo de libro de alta demanda devolvio `201 Created` y la fecha esperada quedo 3 dias despues de la fecha del prestamo.

### RN3

La API no permite crear prestamos con fecha manual desde el endpoint. Para ejecutar esta prueba se preparo un prestamo vencido directamente en la base de datos de prueba.
Luego, al intentar crear un nuevo prestamo para el mismo estudiante, la API devolvio `409 Conflict` con `{ "error": "estudiante_con_prestamo_vencido" }`.

### RN4 y RN8

Se registro una devolucion con 3 dias de retraso. La API devolvio `200 OK` y genero una multa con `dias_retraso: 3`, `valor_por_dia: 2000` y `valor_total: 6000`.
Luego, un nuevo intento de prestamo para el estudiante devolvio `409 Conflict` con `{ "error": "multas_pendientes", "total": 6000 }`.

### RN7

La API si tiene solicitudes de reserva. Se creo una solicitud pendiente de otro estudiante para el mismo libro.
Al intentar renovar el prestamo, la API devolvio `409 Conflict` con `{ "error": "renovacion_bloqueada_por_solicitud" }`.

### Validaciones

- `VAL-1`: body vacio devuelve `400 Bad Request` con `validacion_fallida`.
- `VAL-2`: estudiante inexistente devuelve `404 Not Found` con `estudiante_no_encontrado`.
- `VAL-3`: ejemplar inexistente devuelve `404 Not Found` con `ejemplar_no_encontrado`.
- `VAL-4`: tipos incorrectos devuelve `400 Bad Request`; la API los rechaza en validacion antes de llegar a la logica de negocio.
- `VAL-5`: usando la ruta real `GET /estudiantes/NO-EXISTE-999/prestamos`, devuelve `404 Not Found` con `estudiante_no_encontrado`. La ruta del documento `/api/estudiantes/NO-EXISTE-999/historial` no existe en esta API y devuelve `ruta_no_encontrada`.

**Columna "body util":** escribe `Si` si la respuesta incluye un mensaje que explica por que fallo, o `No` si solo devuelve el codigo sin explicacion.

---

## Preguntas de reflexion para la bitacora

### Respuestas

Despues de correr todas las pruebas, responde en tu `bitacora.md`:

1. ¿Cuantas reglas de negocio implemento correctamente tu version sin IA? ¿Y la version con IA?

   **Respuesta:** La version sin IA no se pudo evaluar porque no esta disponible en el workspace. La version con IA implemento correctamente las reglas probadas en este archivo: RN1, RN2, RN3, RN4, RN5, RN6, RN7 y RN8.

2. ¿Hubo alguna prueba donde la version sin IA devolvio `200 OK` cuando debia devolver `409` o `404`? ¿Que implica eso para un cliente que consume la API?

   **Respuesta:** No se puede afirmar nada sobre la version sin IA porque no fue ejecutada. En la version con IA no hubo casos donde devolviera `200 OK` cuando debia devolver `409` o `404`.

3. ¿Hay alguna regla de negocio que **ninguna** de las dos versiones implemento? Si es asi, ¿como lo detectaste?

   **Respuesta:** No se detecto una regla de negocio no implementada entre las pruebas ejecutadas para la version con IA. Todas las reglas evaluadas devolvieron el comportamiento esperado.

4. Para las pruebas RN3, RN4 y RN7: si no pudiste ejecutarlas porque tu API no permite manipular fechas ni tiene lista de espera, ¿que dice eso sobre la completitud del sistema? ¿Deberia la especificacion haber contemplado esto?

   **Respuesta:** RN3 requirio preparar el prestamo vencido directamente en la base de datos de prueba porque la API no permite manipular fechas desde el endpoint. RN4 si pudo ejecutarse usando `fecha_devolucion_real` en la devolucion. RN7 si pudo ejecutarse porque existe el flujo de solicitudes. Esto muestra que el sistema cubre la logica principal, pero no expone un mecanismo de pruebas o administracion para simular fechas de prestamo vencidas; seria util que la especificacion contemplara como probar escenarios dependientes del tiempo.
