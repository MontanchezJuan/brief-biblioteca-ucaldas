import { Request, Response } from "express";
import { LibroService } from "../../application/services/libro.service";

const service = new LibroService();

export class LibroController {
  list(req: Request, res: Response): void {
    res.json({ data: service.list(req.query as never) });
  }

  getById(req: Request, res: Response): void {
    res.json({ data: service.getById(req.params.id) });
  }

  create(req: Request, res: Response): void {
    res.status(201).json({ data: service.create(req.body) });
  }

  update(req: Request, res: Response): void {
    res.json({ data: service.update(req.params.id, req.body) });
  }

  delete(req: Request, res: Response): void {
    service.delete(req.params.id);
    res.status(204).send();
  }
}
