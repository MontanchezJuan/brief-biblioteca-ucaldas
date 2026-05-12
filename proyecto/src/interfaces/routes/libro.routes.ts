import { Router } from "express";
import { LibroController } from "../controllers/libro.controller";
import { validateRequest } from "../middlewares/validate-request";
import { createLibroSchema, libroIdSchema, listLibrosSchema, updateLibroSchema } from "../validations/libro.schemas";
import { createEjemplarSchema, listEjemplaresSchema } from "../validations/ejemplar.schemas";
import { EjemplarController } from "../controllers/ejemplar.controller";

const router = Router();
const controller = new LibroController();
const ejemplares = new EjemplarController();

router.get("/", validateRequest(listLibrosSchema), controller.list);
router.get("/:id", validateRequest(libroIdSchema), controller.getById);
router.post("/", validateRequest(createLibroSchema), controller.create);
router.put("/:id", validateRequest(updateLibroSchema), controller.update);
router.delete("/:id", validateRequest(libroIdSchema), controller.delete);
router.get("/:id/ejemplares", validateRequest(listEjemplaresSchema), ejemplares.listByLibro);
router.post("/:id/ejemplares", validateRequest(createEjemplarSchema), ejemplares.create);

export { router as libroRoutes };
