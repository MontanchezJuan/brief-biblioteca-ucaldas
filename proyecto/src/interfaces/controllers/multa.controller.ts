import { Request, Response } from "express";
import { MultaService } from "../../application/services/multa.service";

const service = new MultaService();

export class MultaController {
  list(req: Request, res: Response): void {
    res.json({ data: service.list(req.query as never) });
  }

  pay(req: Request, res: Response): void {
    res.json({ data: service.pay(req.params.id, req.body ?? {}) });
  }
}
