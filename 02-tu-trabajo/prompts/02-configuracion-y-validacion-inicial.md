# Prompt #2

**Fecha y hora:** 2026-05-12 17:45 (Zona horaria: Colombia UTC-5)

**Propósito en una línea:** Reestructurar el proyecto inicial para alinearlo con la especificación formal, TypeScript, validaciones y pruebas automatizadas

**Etapa del taller:** 2

**IA usada:** Codex

---

### Prompt enviado (literal)

```
Antes de escribir cualquier código, lee completamente el archivo:

02-tu-trabajo/plantilla-especificacion.md

Usa ese archivo como fuente principal de verdad para definir el alcance del proyecto.

Necesito que crees el proyecto completo con este stack:

- Node.js
- Express
- TypeScript
- Testing con Jest y Supertest
- Validaciones con Zod
- Sin frontend en esta versión
- Sin autenticación para la consulta de endpoints

Reglas obligatorias:

1. No implementes nada antes de leer y analizar `02-tu-trabajo/plantilla-especificacion.md`.

2. Respeta exactamente la estructura de carpetas si la especificación define una.

3. Si la especificación no define estructura de carpetas, propone una distribución basada en arquitectura limpia, separando al menos:
   - configuración
   - dominio
   - casos de uso / servicios
   - infraestructura
   - controladores
   - rutas
   - validaciones
   - tests

4. No inventes funcionalidades que no estén descritas en la especificación.

5. Si encuentras ambigüedades, contradicciones o requisitos incompletos, detente y pregunta antes de implementar.

6. Antes de implementar lógica de negocio, genera primero los archivos iniciales de configuración:
   - README.md
   - .gitignore
   - .env.example
   - package.json
   - tsconfig.json
   - jest.config.ts o configuración equivalente de Jest
   - configuración necesaria para ejecutar TypeScript en desarrollo
   - configuración básica para testing con Jest y Supertest

7. Los endpoints no deben requerir autenticación.

8. No implementes frontend.

9. Usa Zod para validar inputs de endpoints cuando aplique.

10. Usa Jest y Supertest para probar endpoints y lógica relevante según la especificación.

11. Mantén el proyecto simple, limpio y alineado con lo pedido. No agregues capas, servicios externos, bases de datos, colas, autenticación, roles, permisos ni funcionalidades no descritas.

Flujo de trabajo obligatorio:

Primero:
- Lee `02-tu-trabajo/plantilla-especificacion.md`.
- Resume brevemente qué funcionalidades sí están especificadas.
- Lista cualquier ambigüedad o supuesto detectado.

Segundo:
- Propón un árbol de archivos completo para el proyecto.
- No escribas código todavía.
- Pregunta explícitamente mi aprobación antes de continuar con la implementación.

Tercero:
- Solo después de mi aprobación, genera los archivos de configuración inicial.

Cuarto:
- Después de los archivos de configuración, implementa la lógica de negocio respetando estrictamente la especificación.

Formato esperado de tu primera respuesta:

1. Resumen de la especificación leída.
2. Ambigüedades o preguntas, si existen.
3. Árbol de archivos propuesto.
4. Confirmación solicitando aprobación antes de implementar.

No continúes con la implementación hasta que yo apruebe el árbol de archivos.
```

---

### Resumen de la respuesta de la IA

Codex leyó la especificación y detectó una contradicción entre el alcance inicial y los endpoints completos de préstamos, devoluciones, solicitudes y multas.
Antes de implementar, preguntó si debía construir solo el alcance reducido o toda la especificación completa.
Después de aprobar la opción completa, creó una estructura TypeScript con carpetas para configuración, dominio, servicios, infraestructura en memoria, controladores, rutas, validaciones y tests.
Instaló dependencias para Express, TypeScript, Zod, Jest y Supertest, y reemplazó la versión inicial en JavaScript por una versión más alineada con la especificación.
Verificó el proyecto con `npm run typecheck`, `npm run build`, `npm test` y pruebas manuales contra `/health` y `/libros`.

---

### Mi evaluación

**¿La respuesta cumplió con lo que pedí?**

- [x] Completamente.
- [ ] Parcialmente. Faltó: No aplica.
- [ ] No, se desvió. Hizo: No aplica.

**¿La acepté tal cual o la modifiqué?**

- [x] Tal cual.
- [ ] La modifiqué a mano. Cambios: No aplica.
- [ ] Le pedí corrección con un prompt nuevo (ver prompt #[N+1]).
- [ ] La rechacé completamente. Razón: No aplica.

**¿Qué aprendí de esta interacción?**

La AI completó la tarea correctamente :D, además generó dos opciones y una propuesta de árbol de archivos que me parecio muy cool, anexo árbol:

```
proyecto/
├── README.md
├── .gitignore
├── .env.example
├── package.json
├── tsconfig.json
├── jest.config.ts
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── config/
│   │   └── env.ts
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── libro.ts
│   │   │   ├── ejemplar.ts
│   │   │   ├── estudiante.ts
│   │   │   ├── prestamo.ts
│   │   │   ├── solicitud-reserva.ts
│   │   │   └── multa.ts
│   │   └── errors/
│   │       └── app-error.ts
│   ├── application/
│   │   └── services/
│   │       ├── libro.service.ts
│   │       ├── ejemplar.service.ts
│   │       ├── estudiante.service.ts
│   │       ├── prestamo.service.ts
│   │       ├── solicitud.service.ts
│   │       └── multa.service.ts
│   ├── infrastructure/
│   │   └── memory/
│   │       ├── database.ts
│   │       └── seed.ts
│   ├── interfaces/
│   │   ├── controllers/
│   │   │   ├── libro.controller.ts
│   │   │   ├── ejemplar.controller.ts
│   │   │   ├── estudiante.controller.ts
│   │   │   ├── prestamo.controller.ts
│   │   │   ├── solicitud.controller.ts
│   │   │   └── multa.controller.ts
│   │   ├── routes/
│   │   │   ├── index.ts
│   │   │   ├── libro.routes.ts
│   │   │   ├── ejemplar.routes.ts
│   │   │   ├── estudiante.routes.ts
│   │   │   ├── prestamo.routes.ts
│   │   │   ├── solicitud.routes.ts
│   │   │   └── multa.routes.ts
│   │   ├── validations/
│   │   │   ├── libro.schemas.ts
│   │   │   ├── ejemplar.schemas.ts
│   │   │   ├── estudiante.schemas.ts
│   │   │   ├── prestamo.schemas.ts
│   │   │   ├── solicitud.schemas.ts
│   │   │   └── multa.schemas.ts
│   │   └── middlewares/
│   │       ├── error-handler.ts
│   │       └── validate-request.ts
│   └── shared/
│       ├── date.ts
│       └── id.ts
└── tests/
    ├── setup.ts
    ├── libros.test.ts
    ├── ejemplares.test.ts
    ├── estudiantes.test.ts
    ├── prestamos.test.ts
    ├── solicitudes.test.ts
    └── multas.test.ts
```

---
