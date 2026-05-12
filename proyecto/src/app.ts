import express from "express";
import { router } from "./interfaces/routes";
import { errorHandler } from "./interfaces/middlewares/error-handler";

export const app = express();

app.use(express.json());
app.use(router);
app.use((_req, res) => res.status(404).json({ error: "ruta_no_encontrada" }));
app.use(errorHandler);
