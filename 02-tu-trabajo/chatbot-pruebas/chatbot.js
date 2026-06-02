const readline = require("readline");
const { execSync } = require("child_process");

const BASE_URL = "http://localhost:3001";
const OLLAMA_URL = "http://localhost:11434/api/chat";
const MODELO = "llama3.2:3b";
const MAX_OUTPUT_CHARS = 12000;

const SYSTEM_PROMPT = `# System Prompt Chatbot QA Biblioteca UCaldas

Modelo usado: llama3.2:3b

Eres un asistente de QA especializado en probar una API REST de la Biblioteca UCaldas. Ayudas a generar pruebas manuales y comandos para verificar reglas de negocio de prestamos, devoluciones, renovaciones, libros, ejemplares y estudiantes.

Base URL del servidor objetivo: http://localhost:3001

## Reglas de negocio

RN1. Un estudiante de pregrado no puede tener mas de 3 prestamos activos. Si lo intenta: 409 Conflict.
RN2. Un estudiante de posgrado no puede tener mas de 5 prestamos activos. Si lo intenta: 409 Conflict.
RN3. Si un estudiante tiene un prestamo vencido sin devolver, no puede solicitar nuevos prestamos: 409 Conflict.
RN4. Si un estudiante tiene multas pendientes sin pagar, no puede solicitar prestamos: 409 Conflict.
RN5. Un ejemplar que ya esta prestado no puede prestarse de nuevo hasta que sea devuelto: 409 Conflict.
RN6. El plazo de prestamo depende del tipo de libro: 15 dias para libros normales, 3 dias para libros de alta demanda.
RN7. La renovacion de un prestamo se deniega si otro estudiante esta esperando el mismo libro: 409 Conflict.
RN8. La multa por devolucion tardia es de 2000 pesos por dia de retraso por cada libro.

## Endpoints conocidos

- GET  /api/libros
- POST /api/libros
- POST /api/libros/:id/ejemplares
- GET  /api/estudiantes
- POST /api/estudiantes
- GET  /api/estudiantes/:id/historial
- POST /api/prestamos
- GET  /api/prestamos
- PUT  /api/prestamos/:id/devolucion
- PUT  /api/prestamos/:id/renovar

## Instrucciones de comportamiento

- Usa siempre la base URL http://localhost:3001.
- Usa curl.exe en vez de curl porque la usuaria trabaja en Windows.
- Usa el header Content-Type: application/json cuando envies body JSON.
- No inventes endpoints fuera de la lista conocida.
- Si falta informacion de la API, pide confirmar la ruta real o el formato exacto del body.
- Cuando la usuaria pida probar una regla, genera comandos concretos para preparar datos, ejecutar la accion y verificar el resultado.
- Explica brevemente que debe pasar y que codigo HTTP esperas.
- Si la usuaria comparte un error, analiza el codigo HTTP y el body de la respuesta.
- Si la usuaria pide ejecutar, responde cada comando en una linea que empiece exactamente con EJECUTAR:
- Despues de EJECUTAR: escribe solo un comando curl.exe por linea, sin numeracion ni viñetas.
- Para comandos con body JSON en Windows, prefiere comillas dobles escapadas dentro del argumento -d, por ejemplo: -d "{\\"campo\\":\\"valor\\"}".
- Se concisa y practica.`;

const historial = [{ role: "system", content: SYSTEM_PROMPT }];

async function getFetch() {
  if (typeof fetch === "function") {
    return fetch;
  }

  const { default: nodeFetch } = await import("node-fetch");
  return nodeFetch;
}

function limitarSalida(texto) {
  const salida = String(texto || "");
  if (salida.length <= MAX_OUTPUT_CHARS) {
    return salida;
  }

  return `${salida.slice(0, MAX_OUTPUT_CHARS)}\n[Salida truncada a ${MAX_OUTPUT_CHARS} caracteres]`;
}

function explicarErrorConexion(err) {
  const mensaje = String(err && err.message ? err.message : err);

  if (
    mensaje.includes("ECONNREFUSED") ||
    mensaje.includes("fetch failed") ||
    mensaje.includes("Failed to fetch")
  ) {
    return `No se pudo conectar con Ollama en ${OLLAMA_URL}. Verifica que este corriendo con: ollama serve`;
  }

  return mensaje;
}

function pareceErrorConexionApi(texto) {
  const salida = String(texto || "").toLowerCase();
  return (
    salida.includes("failed to connect") ||
    salida.includes("connection refused") ||
    salida.includes("could not connect") ||
    salida.includes("couldn't connect") ||
    salida.includes("econnrefused") ||
    salida.includes("no se pudo conectar")
  );
}

async function preguntarAlModelo(mensajeUsuario) {
  historial.push({ role: "user", content: mensajeUsuario });

  let respuesta;
  try {
    const fetchImpl = await getFetch();
    respuesta = await fetchImpl(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODELO,
        messages: historial,
        stream: false,
      }),
    });
  } catch (err) {
    historial.pop();
    throw new Error(explicarErrorConexion(err));
  }

  if (!respuesta.ok) {
    const detalle = await respuesta.text().catch(() => "");
    historial.pop();
    throw new Error(
      `Ollama respondio ${respuesta.status}. Verifica que el modelo ${MODELO} este instalado y que Ollama este corriendo. ${limitarSalida(detalle)}`.trim(),
    );
  }

  const datos = await respuesta.json();
  const contenido = datos && datos.message && datos.message.content;

  if (!contenido || typeof contenido !== "string") {
    historial.pop();
    throw new Error("Ollama no devolvio message.content en la respuesta.");
  }

  historial.push({ role: "assistant", content: contenido });
  return contenido;
}

function extraerComandosEjecutar(respuestaModelo) {
  return respuestaModelo
    .split(/\r?\n/)
    .map((linea) => linea.trim())
    .filter((linea) => linea.startsWith("EJECUTAR:"))
    .map((linea) => linea.replace(/^EJECUTAR:\s*/, "").trim())
    .filter(Boolean);
}

function ejecutarComandos(respuestaModelo) {
  const comandos = extraerComandosEjecutar(respuestaModelo);

  if (comandos.length === 0) {
    return false;
  }

  for (const comando of comandos) {
    if (!comando.toLowerCase().startsWith("curl.exe ")) {
      console.log(`\n[OMITIDO]: Solo se ejecutan comandos curl.exe. Recibido: ${comando}`);
      continue;
    }

    console.log(`\n[EJECUTANDO]: ${comando}\n`);

    try {
      const resultado = execSync(comando, {
        encoding: "utf8",
        timeout: 20000,
        windowsHide: true,
      });

      console.log(`[STDOUT]:\n${limitarSalida(resultado) || "(sin salida)"}`);
    } catch (err) {
      const stdout = limitarSalida(err.stdout);
      const stderr = limitarSalida(err.stderr);
      const mensaje = limitarSalida(err.message);

      console.log(`[ERROR DE EJECUCION]: codigo ${err.status ?? "desconocido"}`);
      if (stdout) {
        console.log(`[STDOUT]:\n${stdout}`);
      }
      if (stderr) {
        console.log(`[STDERR]:\n${stderr}`);
      }
      if (!stdout && !stderr) {
        console.log(`[DETALLE]:\n${mensaje}`);
      }

      if (
        pareceErrorConexionApi(stdout) ||
        pareceErrorConexionApi(stderr) ||
        pareceErrorConexionApi(mensaje)
      ) {
        console.log(`[PISTA]: Verifica que la API Biblioteca UCaldas este corriendo en ${BASE_URL}.`);
      }
    }
  }

  return true;
}

async function iniciar() {
  console.log("=== Chatbot de Pruebas - Biblioteca UCaldas ===");
  console.log(`Modelo: ${MODELO}`);
  console.log(`Ollama API: ${OLLAMA_URL}`);
  console.log(`API objetivo: ${BASE_URL}`);
  console.log('Escribe "salir" para terminar.\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const preguntar = () => {
    rl.question("Tu: ", async (entrada) => {
      const texto = entrada.trim();

      if (texto.toLowerCase() === "salir") {
        console.log("Hasta luego.");
        rl.close();
        return;
      }

      if (!texto) {
        preguntar();
        return;
      }

      try {
        const respuesta = await preguntarAlModelo(texto);
        console.log(`\nChatbot:\n${respuesta}\n`);
        ejecutarComandos(respuesta);
      } catch (err) {
        console.error(`\nError: ${err.message}\n`);
      }

      preguntar();
    });
  };

  preguntar();
}

iniciar().catch((err) => {
  console.error(`Error inesperado: ${err.message}`);
  process.exitCode = 1;
});
