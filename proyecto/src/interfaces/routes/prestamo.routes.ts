import { Router } from "express";
import { PrestamoController } from "../controllers/prestamo.controller";
import { validateRequest } from "../middlewares/validate-request";
import {
  createPrestamoSchema,
  listPrestamosSchema,
  listVencidosSchema,
  prestamoIdSchema,
  returnPrestamoSchema
} from "../validations/prestamo.schemas";

const router = Router();
const controller = new PrestamoController();

router.get("/", validateRequest(listPrestamosSchema), controller.list);
router.post("/", validateRequest(createPrestamoSchema), controller.create);
router.post("/:id/devolucion", validateRequest(returnPrestamoSchema), controller.returnLoan);
router.post("/:id/renovar", validateRequest(prestamoIdSchema), controller.renew);
router.get("/vencidos", validateRequest(listVencidosSchema), controller.listOverdue);

export { router as prestamoRoutes };
