# Prompt #1

**Fecha y hora:** 2026-05-12 17:00 (Zona horaria: Colombia UTC-5)

**Propósito en una línea:** Generar la estructura inicial del proyecto con endpoints REST para gestionar préstamos de libros

**Etapa del taller:** 1

**IA usada:** Codex

---

### Prompt enviado (literal)

```
Construye una API REST en Node.js para gestionar préstamos de libros en una biblioteca universitaria. Necesito endpoints para listar libros, crear préstamos, devolver libros y consultar préstamos vigentes. Usa Express, datos en memoria.
```

---

### Resumen de la respuesta de la IA

Codex creó la carpeta `proyecto/` con los archivos `app.js`, `package.json`, `README.md` y `.gitignore`.
Instaló la dependencia `express` con `npm install`, lo que también generó `package-lock.json`.
Implementó datos en memoria con arrays para libros, ejemplares, estudiantes, préstamos y multas.
Además de lo pedido, agregó validaciones de negocio como límite de préstamos, bloqueo por multas, bloqueo por ejemplar no disponible y cálculo de multa por devolución tardía.
Verificó la API ejecutando `npm run check` y probando manualmente `/health`, `/libros`, creación de préstamo, consulta de préstamos vigentes y devolución.

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

Aprendí que un prompt corto puede generar una API funcional, pero la IA también toma decisiones adicionales de negocio que debo revisar contra la especificación.

---
