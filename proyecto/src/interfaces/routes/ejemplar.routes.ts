import { Router } from "express";
import { EjemplarController } from "../controllers/ejemplar.controller";
import { validateRequest } from "../middlewares/validate-request";
import { updateEjemplarSchema } from "../validations/ejemplar.schemas";

const router = Router();
const controller = new EjemplarController();

router.put("/:id", validateRequest(updateEjemplarSchema), controller.update);

export { router as ejemplarRoutes };
