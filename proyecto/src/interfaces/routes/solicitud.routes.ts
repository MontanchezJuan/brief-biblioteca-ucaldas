import { Router } from "express";
import { SolicitudController } from "../controllers/solicitud.controller";
import { validateRequest } from "../middlewares/validate-request";
import {
  createSolicitudSchema,
  listSolicitudesSchema,
  updateSolicitudSchema
} from "../validations/solicitud.schemas";

const router = Router();
const controller = new SolicitudController();

router.get("/", validateRequest(listSolicitudesSchema), controller.list);
router.post("/", validateRequest(createSolicitudSchema), controller.create);
router.put("/:id", validateRequest(updateSolicitudSchema), controller.update);

export { router as solicitudRoutes };
