# Bitacora

## Chatbot Ollama - Registro

### Modelo usado

- Nombre del modelo: llama3.2:3b
- Version de Ollama: 0.24.0
- API probada: http://localhost:3001
- Ollama instalado: Si
- Comando usado para verificar version: ollama --version
- Resultado: 0.24.0
- Modelo instalado: llama3.2:3b
- El modelo respondio en terminal: Si
- RAM consumida aproximada: Pendiente de medir durante ejecucion real.

### Verificacion inicial

- Ollama fue verificado localmente antes de implementar el chatbot.
- El modelo llama3.2:3b fue ejecutado con `ollama run llama3.2:3b`.
- El chatbot debe ejecutarse desde `02-tu-trabajo/chatbot-pruebas`.
- Para iniciar Ollama: `ollama serve`.
- Para iniciar el chatbot: `node chatbot.js` o `npm start`.
- La API de Biblioteca UCaldas debe estar corriendo en `http://localhost:3001`.

### Preguntas utiles que genero el chatbot

| Pregunta que hice                                               | Que genero el chatbot                     | Fue util? |
| --------------------------------------------------------------- | ----------------------------------------- | --------- |
| Pendiente de ejecutar: crea datos base para RN1-RN8             | Pendiente de registrar comandos generados | Pendiente |
| Pendiente de ejecutar: prueba RN1 para limite de pregrado       | Pendiente de registrar resultado          | Pendiente |
| Pendiente de ejecutar: prueba RN6 para plazos por tipo de libro | Pendiente de registrar resultado          | Pendiente |

### Limitaciones observadas

- Pendiente validar si llama3.2:3b genera siempre comandos `curl.exe` con el formato esperado.
- Pendiente validar si el modelo respeta todos los endpoints conocidos sin inventar rutas.
- Pendiente validar si el modelo mantiene contexto suficiente para sesiones largas de pruebas.

### Resultados de pruebas relevantes

- Instalacion de Ollama: completada previamente.
- Verificacion de version: `ollama --version` devolvio `0.24.0`.
- Instalacion y prueba del modelo: `llama3.2:3b` respondio en terminal.
- Ejecucion real de pruebas contra `http://localhost:3001`: pendiente.
- Validacion de RN1-RN8 con respuestas reales de la API: pendiente.

### Comparacion entre chatbot local y modelos en la nube

- Chatbot local con Ollama: no envia datos a servicios externos y permite trabajar sin APIs en la nube.
- Chatbot local con llama3.2:3b: puede ser suficiente para generar comandos y guiar pruebas, pero requiere validacion manual de rutas, bodies y resultados.
- Modelos en la nube: suelen tener mayor capacidad de razonamiento y consistencia, pero implican enviar contexto fuera del entorno local y dependen de conectividad externa.
