# Bitacora

## Chatbot Ollama - Registro

### Modelo usado

- Nombre: `llama3.2:3b`
- Version de Ollama: `0.24.0`
- API objetivo: `http://localhost:3001`
- Ollama instalado: Si
- Modelo instalado: Si
- El modelo respondio en terminal: Si
- RAM consumida aproximada: pendiente de medir durante una sesion real.

### Verificacion inicial

Antes de construir el chatbot ya se habia confirmado lo siguiente:

- Comando para verificar Ollama: `ollama --version`
- Resultado: `0.24.0`
- Comando usado para probar el modelo: `ollama run llama3.2:3b`
- Resultado: el modelo permitio entablar una conversacion correctamente.

Para usar el chatbot se debe iniciar Ollama y luego ejecutar el script:

```powershell
ollama serve
cd 02-tu-trabajo/chatbot-pruebas
node chatbot.js
```

La API de Biblioteca UCaldas debe estar corriendo en:

```text
http://localhost:3001
```

### Preguntas utiles para el chatbot

#### Pregunta 1 - Datos base

**Pregunta:** crea los datos de prueba base para todas las reglas: un estudiante pregrado EST-PRE-01, uno posgrado EST-POS-01, un libro normal LIB-001 con 6 ejemplares y un libro de alta demanda LIB-002 con 1 ejemplar.

**Que se espera del chatbot:** comandos `curl.exe` para crear estudiantes, libros y ejemplares usando las rutas conocidas de la API.

**Estado:**

¡Claro! A continuación te proporciono los comandos para crear los datos de prueba base necesarios para todas las reglas:

```bash
EJECUTAR curl -X POST http://localhost:3001/api/libros -H "Content-Type: application/json" -d '{"titulo":"Libro Normal","tipo":"libro normal"}'
EJECUTAR curl -X POST http://localhost:3001/api/libros -H "Content-Type: application/json" -d '{"titulo":"Libro Alta Demanda","tipo":"libro alta demanda"}'
EJECUTAR curl -X POST http://localhost:3001/api/libros/EJEMPLES-001 -H "Content-Type: application/json" -d '{"ejemplar': 6}'
EJECUTAR curl -X POST http://localhost:3001/api/libros/LEMPLES-002 -H "Content-Type: application/json" -d '{"ejemplar': 1}'
```

Estos comandos crean los siguientes recursos en la API:

- Un libro normal llamado "Libro Normal"
- Un libro de alta demanda llamado "Libro Alta Demanda"
- Seis ejemplares de un libro normal llamados "EJEMPLES-001" (6 ejemplares)
- Un solo ejemplar de un libro de alta demanda llamados "LEMPLES-002" (1 ejemplar)

Estos recursos son necesarios para probar varias reglas, como RN5 y RN6.`

---

#### Pregunta 2 - RN1

**Pregunta:** genera la prueba RN1 completa: crear los 3 prestamos validos para pregrado y luego intentar el cuarto.

**Que se espera del chatbot:** comandos para crear tres prestamos activos validos y un cuarto prestamo que debe responder `409 Conflict`.

**Estado:**

A continuación te proporciono los comandos para probar la regla RN1:

```bash
# Crear los 3 prestamos validos para pregrado
EJECUTAR curl -X POST http://localhost:3001/api/prestamos -H "Content-Type: application/json" -d '{"estudiante":"EST-PRE-01","libro":"EJEMPLES-001","fecha_inicial": "2023-03-15", "plazo": 15}'
EJECUTAR curl -X POST http://localhost:3001/api/prestamos -H "Content-Type: application/json" -d '{"estudiante":"EST-PRE-01","libro":"EJEMPLES-002","fecha_inicial": "2023-03-16", "plazo": 15}'
EJECUTAR curl -X POST http://localhost:3001/api/prestamos -H "Content-Type: application/json" -d '{"estudiante":"EST-PRE-01","libro":"LEMPLES-002","fecha_inicial": "2023-03-17", "plazo": 15}'

# Intentar el cuarto prestamo sin limitar la cantidad de prestamos
EJECUTAR curl -X POST http://localhost:3001/api/prestamos -H "Content-Type: application/json" -d '{"estudiante":"EST-PRE-01","libro":"LIB-001", "fecha_inicial": "2023-03-18", "plazo": 15}'
```

Estos comandos crean tres prestamos validos para el estudiante pregrado EST-PRE-01, y luego intenta solicitar un cuarto prestamo sin limitar la cantidad de prestamos. La regla RN1 espera que no se pueda crear más de tres prestamos activos para este estudiante.

Si la API devuelve un código HTTP 409 Conflict, entonces la regla RN1 ha sido probada correctamente.

---

#### Pregunta 3 - RN2

**Pregunta:** ahora haz lo mismo para RN2 con el estudiante de posgrado, recuerda que su limite es 5.

**Que se espera del chatbot:** comandos para crear cinco prestamos activos validos y un sexto prestamo que debe responder `409 Conflict`.

**Estado:**

A continuación te proporciono los comandos para probar la regla RN2:

```bash
# Crear los 5 prestamos validos para posgrado
EJECUTAR curl -X POST http://localhost:3001/api/prestamos -H "Content-Type: application/json" -d '{"estudiante":"EST-POS-01","libro":"LEMPLES-002","fecha_inicial": "2023-03-15", "plazo": 15}'
EJECUTAR curl -X POST http://localhost:3001/api/prestamos -H "Content-Type: application/json" -d '{"estudiante":"EST-POS-01","libro":"EJEMPLES-001","fecha_inicial": "2023-03-16", "plazo": 15}'
EJECUTAR curl -X POST http://localhost:3001/api/prestamos -H "Content-Type: application/json" -d '{"estudiante":"EST-POS-01","libro":"LIB-001","fecha_inicial": "2023-03-17", "plazo": 15}'
EJECUTAR curl -X POST http://localhost:3001/api/prestamos -H "Content-Type: application/json" -d '{"estudiante":"EST-POS-01","libro":"LEMPLES-002","fecha_inicial": "2023-03-18", "plazo": 15}'
EJECUTAR curl -X POST http://localhost:3001/api/prestamos -H "Content-Type: application/json" -d '{"estudiante":"EST-POS-01","libro":"EJEMPLES-002","fecha_inicial": "2023-03-19", "plazo": 15}'
EJECUTAR curl -X POST http://localhost:3001/api/prestamos -H "Content-Type: application/json" -d '{"estudiante":"EST-POS-01","libro":"LIB-001","fecha_inicial": "2023-03-20", "plazo": 15}'

# Intentar el sexto prestamo
EJECUTAR curl -X POST http://localhost:3001/api/prestamos -H "Content-Type: application/json" -d '{"estudiante":"EST-POS-01","libro":"LIB-001", "fecha_inicial": "2023-03-21", "plazo": 15}'
```

Estos comandos crean cinco prestamos validos para el estudiante de posgrado EST-POS-01, y luego intenta solicitar un sexto prestamo. La regla RN2 espera que no se pueda crear más de cinco prestamos activos para este estudiante.

Si la API devuelve un código HTTP 409 Conflict, entonces la regla RN2 ha sido probada correctamente.

---

#### Pregunta 4 - RN5

**Pregunta:** prueba que un ejemplar ya prestado no se puede prestar de nuevo.

**Que se espera del chatbot:** prestar un ejemplar y luego intentar prestarlo otra vez. La segunda solicitud debe responder `409 Conflict`.

**Estado:**

A continuación te proporciono los comandos para probar el comportamiento de una regla similar a RN5, pero que requiere dos comandos:

```bash
# Prestar un libro normal
EJECUTAR curl -X POST http://localhost:3001/api/libros/EJEMPLES-001 -H "Content-Type: application/json"
EJECUTAR curl -X POST http://localhost:3001/api/prestamos -H "Content-Type: application/json" -d '{"libro":"EJEMPLES-001","estudiante":"EST-PRE-01","fecha_inicial": "2023-03-22", "plazo": 15}'

# Intentar prestar el mismo libro de nuevo sin devolverlo
EJECUTAR curl -X POST http://localhost:3001/api/libros/EJEMPLES-001 -H "Content-Type: application/json"
```

Estos comandos prestan un ejemplar del libro normal "EJEMPLES-001" y luego intenta prestarlo de nuevo sin devolverlo, pero no se puede hacer porque el libro ya está prestado.

Si la API devuelve un código HTTP 409 Conflict, entonces la regla RN5 ha sido probada correctamente.

---

#### Pregunta 5 - RN6

**Pregunta:** muestrame como verificar que el plazo del prestamo es correcto para un libro normal versus uno de alta demanda.

**Que se espera del chatbot:** comparar la fecha esperada de devolucion para libro normal, 15 dias, y alta demanda, 3 dias.

**Estado:**

A continuación te proporciono los comandos para probar el comportamiento de una regla similar a RN6, pero que requiere dos comandos:

```bash
# Prestar un libro normal
EJECUTAR curl -X POST http://localhost:3001/api/libros/EJEMPLES-001 -H "Content-Type: application/json"
EJECUTAR curl -X POST http://localhost:3001/api/prestamos -H "Content-Type: application/json" -d '{"libro":"EJEMPLES-001","estudiante":"EST-PRE-01","fecha_inicial": "2023-03-22", "plazo": 15}'

# Verificar el plazo del prestamo para un libro normal
EJECUTAR curl http://localhost:3001/api/prestamos/EJEMPLES-001 -H "Content-Type: application/json" | grep "plazo=15"

# Prestar un libro de alta demanda
EJECUTAR curl -X POST http://localhost:3001/api/libros/LEMPLES-002 -H "Content-Type: application/json"
EJECUTAR curl -X POST http://localhost:3001/api/prestamos -H "Content-Type: application/json" -d '{"libro":"LEMPLES-002","estudiante":"EST-PRE-01","fecha_inicial": "2023-03-22", "plazo": 3}'

# Verificar el plazo del prestamo para un libro de alta demanda
EJECUTAR curl http://localhost:3001/api/prestamos/LEMPLES-002 -H "Content-Type: application/json" | grep "plazo=3"
```

Estos comandos prestan un ejemplar del libro normal "EJEMPLES-001", luego verifican que el plazo del prestamo sea de 15 días, y luego prestan un ejemplar del libro de alta demanda con la misma fecha inicial, lo cual no debería ser posible porque el plazo debe ser de 3 días para libros de alta demanda.

Si la API devuelve respuestas con los plazos correctos (15 días para un libro normal y 3 días para un libro de alta demanda), entonces la regla RN6 ha sido probada correctamente.

---

#### Pregunta 6 - Entradas invalidas

**Pregunta:** genera pruebas de entradas invalidas: body vacio, estudiante inexistente y ejemplar inexistente.

**Que se espera del chatbot:** comandos `curl.exe` con casos negativos y explicacion breve de los codigos esperados, por ejemplo `400` o `404` segun la validacion de la API.

**Estado:** pendiente ejecutar contra la API.

### Resultados de pruebas relevantes

| Prueba                         | Resultado                             |
| ------------------------------ | ------------------------------------- |
| `ollama --version`             | `0.24.0`                              |
| `ollama run llama3.2:3b`       | El modelo respondio en terminal       |
| `node --check chatbot.js`      | Sintaxis valida                       |
| Inicio del chatbot con `salir` | El CLI inicia y termina correctamente |
| Pruebas reales RN1-RN8         | Pendiente                             |

### Limitaciones observadas

- Todavia falta ejecutar los comandos reales contra `http://localhost:3001`.
- El modelo `llama3.2:3b` puede generar respuestas mas simples que modelos mas grandes.
- Si no se le insiste en usar `curl.exe`, podria responder con explicaciones en vez de comandos ejecutables.
- Hay que revisar que no invente rutas fuera de los endpoints definidos en el system prompt.
- Los resultados de negocio, como `409 Conflict`, deben verificarse con la API real.

### Comparacion: chatbot local vs modelos en la nube

- El chatbot local protege mejor el contexto del proyecto porque no envia informacion a servicios externos.
- La configuracion con Ollama permite repetir pruebas sin depender de creditos ni APIs en la nube.
- Un modelo en la nube probablemente tendria respuestas mas completas y consistentes.
- Para este taller, el chatbot local es suficiente porque el objetivo es generar y ejecutar pruebas guiadas sobre una API local.

### Conclusiones

El taller queda preparado para ejecutar pruebas con Ollama local usando `llama3.2:3b`. La parte de instalacion y prueba del modelo ya esta validada. Queda pendiente completar la bitacora con resultados reales cuando la API este corriendo en `http://localhost:3001` y se ejecuten las pruebas RN1-RN8.
