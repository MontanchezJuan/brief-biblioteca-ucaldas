**Requisitos previos:** Haber explorado los proyectos `proyecto-v1` y `proyecto-v2` del repositorio

---

## Contexto

Durante este taller trabajarás con dos versiones de la misma API REST para gestión de préstamos de una biblioteca universitaria.

- **`proyecto-v1`** — Implementación simple en JavaScript con Express o . Sin validaciones formales, sin arquitectura en capas, sin tests.
- **`proyecto-v2`** — Implementación en TypeScript con Clean Architecture, validaciones con Zod, manejo de errores tipado y suite completa de tests unitarios e integración.

El objetivo no es determinar cuál versión es "mejor", sino comprender qué impacto tiene la estructura del código sobre la capacidad de probarlo.

---

## Antes de empezar

Levanta ambos servidores en terminales separadas:

```bash
# Terminal 1
cd proyecto-v1
node src/index.js
```

```bash
# Terminal 2
cd proyecto-v2
npm run dev
```

Verifica que ambos respondan:

```bash
curl http://localhost:3000/
curl http://localhost:3001/
```

---

## Bloque 1 — Lectura y comparación estructural

### Ejercicio 1.1 — Inventario de diferencias

Recorre ambos proyectos y completa la siguiente tabla en tu bitácora:

| Dimensión                          | v1                                             | v2                                                                                                 |
| ---------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Lenguaje                           | JavaScript                                     | TypeScript                                                                                         |
| Validación de entradas al servidor | Sin validaciones formales, segun el enunciado. | Zod en `src/interfaces/validations` y middleware `validate-request.ts`.                            |
| Manejo de errores HTTP             | Directo en rutas/controladores.                | `AppError` con `statusCode`, `code`, `detail` y `meta`; `error-handler.ts` traduce errores a JSON. |
| Arquitectura (número de capas)     | Implementacion simple                          | 4 capas visibles: interfaces, application/services, domain, infrastructure/memory.                 |
| Tests incluidos                    | Sin tests                                      | Jest + Supertest. Despues del cambio hay 7 suites y 18 tests.                                      |
| Tipado de datos                    | Tipado dinamico de JavaScript.                 | Tipos e interfaces TypeScript para entidades y entradas.                                           |
| Forma de iniciar la aplicación     | `node src/index.js`                            | `npm run dev`, `npm start` despues de compilar, y `npm test` para pruebas.                         |

### Ejercicio 1.2 — Rastreo de una regla de negocio

Localiza la **RN1: límite de préstamos simultáneos por tipo de estudiante** en ambas versiones y responde:

1. ¿En qué archivo está en v1? ¿En cuántas líneas se implementa?
   Implementación simple de Express
2. ¿En qué archivo(s) está en v2? ¿Qué capas atraviesa?
   En el proyecto actual, RN1 esta en `proyecto/src/application/services/prestamo.service.ts`, lineas 65-73: cuenta prestamos `ACTIVO` del estudiante y compara contra `estudiante.max_prestamos_activos`. La peticion atraviesa estas capas:

| Capa               | Archivo                                                     |
| ------------------ | ----------------------------------------------------------- |
| Ruta               | `src/interfaces/routes/prestamo.routes.ts`                  |
| Validacion         | `src/interfaces/validations/prestamo.schemas.ts`            |
| Controlador        | `src/interfaces/controllers/prestamo.controller.ts`         |
| Aplicacion / regla | `src/application/services/prestamo.service.ts`              |
| Dominio            | entidades `Estudiante`, `Prestamo`, `Ejemplar` y `AppError` |
| Infraestructura    | `src/infrastructure/memory/database.ts`                     |

3. Si el cliente pide cambiar el límite de pregrado de 3 a 4, ¿cuántos archivos hay que modificar en cada versión?

   | Versión              | Descripción                                                                                                                                                            |
   | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
   | v1                   | No verificable. Si el limite esta hardcodeado en una ruta, seria 1 archivo; si tambien hay datos iniciales, podria ser mas.                                            |
   | v2 / proyecto actual | Minimo 2 lugares para consistencia: `estudiante.service.ts` lineas 37 y 53, y `seed.ts` linea 65 para el estudiante inicial. Tambien conviene agregar o ajustar tests. |

4. ¿Cómo sabrías que el cambio no rompió nada en cada versión?

   | Version              | Estrategia                                                                                                                              |
   | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
   | v1                   | Pruebas manuales con `curl`, porque el enunciado dice que no trae tests. El riesgo es alto porque depende de recordar casos borde.      |
   | v2 / proyecto actual | Ejecutar `npm test` y agregar un test de RN1 para pregrado/posgrado. En este taller agregue el test de posgrado para el sexto prestamo. |

---

## Bloque 2 — Análisis de calidad y comportamiento ante errores

**Modalidad:** Parejas  
**Tiempo:** 30 minutos

### Ejercicio 2.1 — El request que no debería funcionar

Ejecuta el siguiente comando contra **v1**:

```bash
curl -s -X POST http://localhost:3000/api/prestamos \
  -H "Content-Type: application/json" \
  -d '{"estudianteId": "NO-EXISTE", "ejemplarId": "abc"}' | jq
```

Luego ejecuta el mismo request contra **v2** (ajusta el puerto si es necesario).

Responde en tu bitácora:

1. ¿Qué código HTTP devuelve cada versión?

2. ¿Qué información contiene el cuerpo de la respuesta en cada caso?

3. ¿Cuál respuesta es más útil para un cliente que consume la API?
4. ¿Qué pasa en v1 si `ejemplarId` llega como string en lugar de número? ¿Y en v2?

No pude ejecutar la comparacion real contra v1/v2 porque no existen esas carpetas ni servidores separados. En el proyecto actual, la ruta correcta es `/prestamos`, no `/api/prestamos`, y los campos correctos son `estudiante_id` y `ejemplar_id`, no `estudianteId` y `ejemplarId`.

Si se envia un body con nombres incorrectos, v2/proyecto actual responde `400` desde Zod con:

```json
{
  "error": "validacion_fallida",
  "detalle": "Required; Required"
}
```

Si se envia `{ "estudiante_id": "NO-EXISTE", "ejemplar_id": "abc" }`, el schema acepta ambos como strings y luego el servicio devuelve `404` con:

```json
{
  "error": "estudiante_no_encontrado"
}
```

Respuesta mas util para un cliente: la de v2/proyecto actual, porque separa errores de validacion (`400`) de errores de recurso inexistente (`404`) y devuelve codigos de error estables. En este proyecto `ejemplar_id` es string por diseno, asi que no es error que llegue como string; lo que se rechaza es que falte o venga con el nombre de campo incorrecto.

### Ejercicio 2.2 — Comparar errores de dominio

Provoca el mismo error de negocio en ambas versiones: intenta prestar un ejemplar que ya está prestado.

Pasos sugeridos:

1. Crea un préstamo con el ejemplar 1
2. Intenta crear otro préstamo con el mismo ejemplar 1

Registra y compara:

| Aspecto                                   | v1  | v2  |
| ----------------------------------------- | --- | --- |
| Código HTTP                               |     |     |
| Campo `error` en la respuesta             |     |     |
| Mensaje legible                           |     |     |
| Información adicional (detalles)          |     |     |
| ¿Expone información interna del servidor? |     |     |

En el proyecto actual ya existe un test de este caso en `proyecto/tests/prestamos.test.ts`, lineas 17-25: se presta `eje-001` y luego se intenta prestar otra vez.

| Aspecto                    | v1                             | v2 / proyecto actual                                                               |
| -------------------------- | ------------------------------ | ---------------------------------------------------------------------------------- |
| Codigo HTTP                | No verificable sin carpeta v1. | `409 Conflict`.                                                                    |
| Campo `error`              | No verificable.                | `ejemplar_no_disponible`.                                                          |
| Mensaje legible            | No verificable.                | El codigo es legible para cliente/desarrollador; no trae mensaje humano adicional. |
| Informacion adicional      | No verificable.                | `estado_actual` cuando lo lanza `PrestamoService.create`.                          |
| Expone informacion interna | No verificable.                | No expone stack traces ni detalles internos; solo codigo de dominio.               |

---

## Bloque 3 — Análisis de los tests de v2

### Ejercicio 3.1 — Lectura de un test unitario

Abre el archivo `proyecto-v2/tests/unit/CrearPrestamo.test.ts` y responde:

1. ¿Qué técnica de aislamiento se usa? (mocks, stubs, fakes, spies)

Tecnica de aislamiento: no usa mocks/stubs/fakes/spies en `prestamos.test.ts`; usa `supertest(app)` y reinicia la base en memoria en `tests/setup.ts`.

2. ¿Se levanta algún servidor HTTP para ejecutar este test? ¿Por qué importa esto?

No se levanta un servidor HTTP real con `listen`; Supertest invoca la app Express en memoria. Importa porque es mas rapido y evita depender de puertos.

3. Identifica en qué línea(s) del archivo se prueba la **RN4** (multa pendiente) y la **RN3** (préstamos vencidos pendientes).

| Regla                             | Archivo y lineas                                |
| --------------------------------- | ----------------------------------------------- |
| Ejemplar no disponible / prestado | `proyecto/tests/prestamos.test.ts` lineas 17-25 |
| Multa por devolucion tardia       | `proyecto/tests/prestamos.test.ts` lineas 40-54 |
| Renovacion                        | `proyecto/tests/prestamos.test.ts` lineas 57-66 |

4. ¿Cuánto tiempo tarda en ejecutarse este test? Corre `npm`

Tiempo de ejecucion medido con `npm test`: 7 suites, 18 tests, `Time: 2.294 s`.

---

## Bloque 4 — Escritura de tests

### Ejercicio 4.1 — Un test que v1 no puede tener con la misma velocidad

En `proyecto-v2`, escribe un test unitario para `CrearPrestamo` que verifique que un estudiante de **posgrado** puede tener hasta 5 préstamos simultáneos pero falla al intentar el sexto.

Plantilla de inicio:

```typescript
it("RN1 — posgrado falla al intentar el sexto préstamo", async () => {
  const vigentes: Prestamo[] = Array.from({ length: 5 }, (_, i) => ({
    // completa los campos necesarios
  }));
  // construye el caso de uso con los repos mockeados
  // verifica que lanza LimitePrestamosAlcanzado
});
```

Una vez terminado, reflexiona: ¿por qué sería más lento o difícil escribir este test en v1?

Como no existe `CrearPrestamo` ni repositorios mockeables en esta implementacion, agregue el equivalente directo sobre `PrestamoService.create` en:

`proyecto/tests/prestamo.service.test.ts`

El test prepara 5 prestamos activos para el estudiante `est-002` de tipo `POSGRADO`, agrega un sexto ejemplar disponible y verifica que el intento de crear el sexto prestamo falle con:

```json
{
  "error": "limite_prestamos_alcanzado",
  "limite": 5,
  "actuales": 5
}
```

Lineas clave:

| Linea | Que valida                                      |
| ----- | ----------------------------------------------- |
| 7     | Nombre del test RN1 para posgrado.              |
| 10-21 | Construccion de 5 prestamos activos.            |
| 22    | Insercion de los prestamos vigentes en memoria. |
| 41-42 | Verificacion del codigo de error y metadata.    |

Reflexion: en v1 seria mas lento o dificil porque la regla estaria mezclada con Express y estado global, sin una unidad clara para invocar. Habria que levantar servidor o simular requests completos, preparar datos por HTTP o mutar estructuras internas, y verificar respuestas manualmente. En el proyecto actual basta construir el estado minimo en memoria e invocar el servicio directamente.
