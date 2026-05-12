import { Request, Response } from "express";
import { EjemplarService } from "../../application/services/ejemplar.service";
import { EstadoEjemplar } from "../../domain/entities/ejemplar";

const service = new EjemplarService();

export class EjemplarController {
  listByLibro(req: Request, res: Response): void {
    res.json({ data: service.listByLibro(req.params.id, req.query.estado as EstadoEjemplar | undefined) });
  }

  create(req: Request, res: Response): void {
    res.status(201).json({ data: service.create(req.params.id, req.body) });
  }

  update(req: Request, res: Response): void {
    res.json({ data: service.update(req.params.id, req.body) });
  }
}
