import { Router } from "express";
import { EstudianteController } from "../controllers/estudiante.controller";
import { validateRequest } from "../middlewares/validate-request";
import {
  createEstudianteSchema,
  estudianteIdSchema,
  listEstudiantesSchema,
  updateEstudianteSchema
} from "../validations/estudiante.schemas";
import { listPrestamosEstudianteSchema } from "../validations/prestamo.schemas";

const router = Router();
const controller = new EstudianteController();

router.get("/", validateRequest(listEstudiantesSchema), controller.list);
router.get("/:id", validateRequest(estudianteIdSchema), controller.getById);
router.post("/", validateRequest(createEstudianteSchema), controller.create);
router.put("/:id", validateRequest(updateEstudianteSchema), controller.update);
router.get("/:id/prestamos", validateRequest(listPrestamosEstudianteSchema), controller.listPrestamos);

export { router as estudianteRoutes };
