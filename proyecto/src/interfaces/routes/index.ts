import { Router } from "express";
import { ejemplarRoutes } from "./ejemplar.routes";
import { estudianteRoutes } from "./estudiante.routes";
import { libroRoutes } from "./libro.routes";
import { multaRoutes } from "./multa.routes";
import { prestamoRoutes } from "./prestamo.routes";
import { solicitudRoutes } from "./solicitud.routes";

const router = Router();

router.get("/health", (_req, res) => res.json({ status: "ok" }));
router.use("/libros", libroRoutes);
router.use("/ejemplares", ejemplarRoutes);
router.use("/estudiantes", estudianteRoutes);
router.use("/prestamos", prestamoRoutes);
router.use("/solicitudes", solicitudRoutes);
router.use("/multas", multaRoutes);

export { router };
