import { app } from "./app";
import { env } from "./config/env";

app.listen(env.port, () => {
  console.log(`API Biblioteca UCaldas escuchando en http://localhost:${env.port}`);
});
