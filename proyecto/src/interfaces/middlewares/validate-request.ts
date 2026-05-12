import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const parsed = schema.safeParse({
      body: req.body,
      params: req.params,
      query: req.query
    });

    if (!parsed.success) {
      res.status(400).json({
        error: "validacion_fallida",
        detalle: parsed.error.issues.map((issue) => issue.message).join("; ")
      });
      return;
    }

    req.body = parsed.data.body ?? req.body;
    req.params = parsed.data.params ?? req.params;
    req.query = parsed.data.query ?? req.query;
    next();
  };
}
