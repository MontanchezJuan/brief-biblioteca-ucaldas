import { z } from "zod";

const booleanQuery = z
  .enum(["true", "false"])
  .transform((value) => value === "true")
  .optional();

export const listMultasSchema = z.object({
  query: z.object({
    pagada: booleanQuery,
    estudiante_id: z.string().optional()
  })
});

export const payMultaSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({ fecha_pago: z.string().optional() }).optional().default({})
});
