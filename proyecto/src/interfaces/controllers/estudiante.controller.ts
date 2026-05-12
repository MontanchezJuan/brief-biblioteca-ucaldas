import { Request, Response } from "express";
import { EstudianteService } from "../../application/services/estudiante.service";
import { PrestamoService } from "../../application/services/prestamo.service";

const service = new EstudianteService();
const prestamos = new PrestamoService();

export class EstudianteController {
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

  listPrestamos(req: Request, res: Response): void {
    res.json({ data: prestamos.listByStudent(req.params.id, req.query as never) });
  }
}
