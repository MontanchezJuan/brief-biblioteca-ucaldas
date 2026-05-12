import { Router } from "express";
import { MultaController } from "../controllers/multa.controller";
import { validateRequest } from "../middlewares/validate-request";
import { listMultasSchema, payMultaSchema } from "../validations/multa.schemas";

const router = Router();
const controller = new MultaController();

router.get("/", validateRequest(listMultasSchema), controller.list);
router.post("/:id/pagar", validateRequest(payMultaSchema), controller.pay);

export { router as multaRoutes };
