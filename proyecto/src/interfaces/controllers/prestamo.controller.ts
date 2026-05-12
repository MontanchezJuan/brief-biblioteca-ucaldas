import { Request, Response } from "express";
import { PrestamoService } from "../../application/services/prestamo.service";

const service = new PrestamoService();

export class PrestamoController {
  list(req: Request, res: Response): void {
    res.json({ data: service.list(req.query as never) });
  }

  create(req: Request, res: Response): void {
    res.status(201).json({ data: service.create(req.body) });
  }

  returnLoan(req: Request, res: Response): void {
    const result = service.returnLoan(req.params.id, req.body ?? {});
    res.json({ data: result.prestamo, multa: result.multa ?? null });
  }

  renew(req: Request, res: Response): void {
    res.json({ data: service.renew(req.params.id) });
  }

  listOverdue(req: Request, res: Response): void {
    res.json({ data: service.listOverdue(req.query.dias_minimo as number | undefined) });
  }
}
