import { NextFunction, Request, Response } from "express";
import { AppError } from "../../domain/errors/app-error";

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: error.code,
      ...(error.detail ? { detalle: error.detail } : {}),
      ...(error.meta ?? {})
    });
    return;
  }

  res.status(500).json({ error: "error_interno" });
}
