# Prompt #3

**Fecha y hora:** 2026-05-19 (Zona horaria: Colombia UTC-5)

**Proposito en una linea:** Auditar la persistencia actual del proyecto y migrarla a SQLite solo despues de confirmar que no existia una base de datos real

**Etapa del taller:** 3

**IA usada:** Codex

---

### Prompt enviado (literal)

```
Necesito que revises el proyecto para verificar si actualmente usa alguna base de datos.

Objetivo:
Determinar si el sistema ya tiene persistencia en base de datos o si esta usando archivos JSON como fuente principal de datos.

Si el proyecto NO usa base de datos y actualmente depende de archivos JSON para persistencia, necesito migrar esa persistencia a SQLite para mejorar:

- consistencia de datos
- integridad referencial
- validaciones estructurales
- consultas mas seguras
- mantenimiento del sistema

Reglas obligatorias:

1. Antes de modificar codigo, revisa el proyecto completo y confirma:
   - si existe alguna base de datos configurada
   - si se usa SQLite, PostgreSQL, MySQL, MongoDB, Firebase, Prisma, TypeORM, Sequelize, Knex u otra tecnologia
   - si los datos se leen/escriben desde archivos JSON
   - que archivos JSON se usan como persistencia
   - que modulos dependen de esos JSON

2. No asumas que no hay base de datos. Verificalo con evidencia en el codigo.

3. Antes de implementar cambios, entrega un diagnostico con:
   - tecnologia de persistencia actual
   - archivos involucrados
   - flujos que leen datos
   - flujos que escriben datos
   - riesgos de migrar a SQLite
   - propuesta de diseño de base de datos

4. Si el proyecto ya usa una base de datos real, no migres a SQLite automaticamente. Primero explica que encontraste y pregunta antes de cambiar arquitectura.

5. Si el proyecto solo usa JSON como persistencia, implementa SQLite.

6. No inventes nuevas funcionalidades. La base de datos debe cubrir unicamente los datos y operaciones que ya existen en los JSON actuales.

7. Manten los endpoints y comportamiento externo lo mas compatible posible.

8. No elimines los archivos JSON inmediatamente. Dejalos como referencia historica o como fuente para migracion inicial, salvo que se indique lo contrario.

9. Crea una capa clara de acceso a datos para SQLite. Evita que controladores o rutas ejecuten SQL directamente.

10. Agrega migraciones o script de inicializacion de esquema.

11. Agrega un script para migrar los datos actuales desde JSON hacia SQLite.

12. Usa transacciones cuando se inserten datos relacionados.

13. Define constraints donde aplique:

- PRIMARY KEY
- NOT NULL
- UNIQUE
- FOREIGN KEY
- CHECK si corresponde

14. Activa soporte de foreign keys en SQLite:

```sql
PRAGMA foreign_keys = ON;
```

15. Si el proyecto usa TypeScript, todo el codigo nuevo debe estar tipado.
16. Agrega validaciones con los mecanismos existentes del proyecto. Si ya se usa Zod, mantener Zod.
17. Agrega o actualiza tests para cubrir:

- inicializacion de base de datos
- migracion desde JSON
- lectura de datos
- escritura de datos
- validaciones de integridad
- endpoints afectados

18. No implementes autenticacion ni frontend si no existen actualmente.

Proceso requerido:

Primero:

- Audita el proyecto.
- Identifica la persistencia actual.
- Entrega diagnostico.
- Propón el esquema SQLite.
- Pregunta aprobacion antes de implementar la migracion.

Segundo, solo despues de aprobacion:

- Instala/configura SQLite.
- Crea estructura de base de datos.
- Implementa repositorios/capa de acceso a datos.
- Crea script de migracion desde JSON.
- Ajusta servicios/endpoints para usar SQLite.
- Agrega pruebas.

Archivos esperados si aplica la migracion:

- configuracion de SQLite
- modulo de conexion a base de datos
- migraciones o schema SQL
- repositorios por entidad
- script de migracion JSON -> SQLite
- tests actualizados
- documentacion en README

Criterios de aceptacion:

- Se confirma con evidencia si el proyecto usa o no base de datos.
- Si solo usaba JSON, los datos pasan a SQLite.
- Los JSON dejan de ser la fuente activa de persistencia.
- Los endpoints mantienen el comportamiento esperado.
- El esquema SQLite incluye constraints adecuados.
- Las relaciones usan foreign keys cuando aplique.
- Existe script reproducible para inicializar la base de datos.
- Existe script reproducible para migrar datos desde JSON.
- Las pruebas pasan.
- No se agregan funcionalidades fuera del alcance.
```

---

### Resumen de la respuesta de la IA

Codex audito el proyecto antes de modificar codigo. Verifico `package.json`, `package-lock.json`, `README.md`, servicios, tests y la carpeta `src/infrastructure/memory`.
Confirmo que no existia SQLite, PostgreSQL, MySQL, MongoDB, Firebase, Prisma, TypeORM, Sequelize, Knex ni otra base de datos configurada.
Tambien confirmo que no habia archivos JSON de datos; solo existian archivos JSON de configuracion como `package.json`, `package-lock.json` y `tsconfig.json`.

La persistencia real era en memoria, usando arrays inicializados desde `src/infrastructure/memory/seed.ts` y expuestos por `src/infrastructure/memory/database.ts`.
Despues del diagnostico, Codex propuso un esquema SQLite con tablas para libros, ejemplares, estudiantes, prestamos, solicitudes y multas, incluyendo primary keys, uniques, foreign keys y checks.

Luego de aprobar la implementacion, Codex migro la persistencia activa a SQLite usando `node:sqlite`.
Creo una capa de infraestructura en `src/infrastructure/sqlite/`, repositorios por entidad, un esquema SQL, conexion con `PRAGMA foreign_keys = ON`, transacciones para operaciones relacionadas y scripts reproducibles:

- `npm run db:init`
- `npm run db:migrate`

Tambien actualizo los servicios para que dejaran de depender de la base en memoria, agrego pruebas de SQLite e integridad referencial, actualizo `README.md`, `.env.example`, `.gitignore` y mantuvo `seed.ts` como fuente historica para la migracion inicial.

Verifico el resultado con:

- `npm run build`
- `npm run typecheck`
- `npm test`
- `npm run db:init`
- `npm run db:migrate`

---

### Mi evaluacion

**¿La respuesta cumplio con lo que pedi?**

- [x] Completamente.
- [ ] Parcialmente. Falto: No aplica.
- [ ] No, se desvio. Hizo: No aplica.

**¿La acepte tal cual o la modifique?**

- [x] Tal cual.
- [ ] La modifique a mano. Cambios: No aplica.
- [ ] Le pedi correccion con un prompt nuevo (ver prompt #[N+1]).
- [ ] La rechace completamente. Razon: No aplica.

**¿Que aprendi de esta interaccion?**

Aprendi que antes de migrar persistencia es importante auditar con evidencia el proyecto completo. En este caso no habia base de datos ni JSON persistentes: habia datos en memoria. Tambien aprendi que una migracion ordenada debe separar conexion, esquema, repositorios, scripts de inicializacion/migracion y pruebas de integridad.

---
