import { Request, Response } from "express";
import { SolicitudService } from "../../application/services/solicitud.service";

const service = new SolicitudService();

export class SolicitudController {
  list(req: Request, res: Response): void {
    res.json({ data: service.list(req.query as never) });
  }

  create(req: Request, res: Response): void {
    res.status(201).json({ data: service.create(req.body) });
  }

  update(req: Request, res: Response): void {
    res.json({ data: service.update(req.params.id, req.body) });
  }
}
