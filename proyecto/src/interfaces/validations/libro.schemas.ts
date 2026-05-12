import { z } from "zod";

const booleanQuery = z
  .enum(["true", "false"])
  .transform((value) => value === "true")
  .optional();

export const listLibrosSchema = z.object({
  query: z.object({
    titulo: z.string().optional(),
    autor: z.string().optional(),
    sala: z.string().optional(),
    alta_demanda: booleanQuery,
    disponible: booleanQuery
  })
});

export const libroIdSchema = z.object({
  params: z.object({ id: z.string().min(1) })
});

export const createLibroSchema = z.object({
  body: z.object({
    codigo_inventario: z.string().min(1),
    titulo: z.string().min(1),
    autor: z.string().min(1),
    sala: z.string().min(1),
    alta_demanda: z.boolean()
  })
});

export const updateLibroSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z
    .object({
      titulo: z.string().min(1).optional(),
      autor: z.string().min(1).optional(),
      sala: z.string().min(1).optional(),
      alta_demanda: z.boolean().optional()
    })
    .refine((body) => Object.keys(body).length > 0, "Debe enviar al menos un campo.")
});
