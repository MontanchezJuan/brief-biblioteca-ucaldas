import { z } from "zod";

const estadoEjemplar = z.enum(["DISPONIBLE", "PRESTADO", "MANTENIMIENTO", "PERDIDO"]);

export const listEjemplaresSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  query: z.object({ estado: estadoEjemplar.optional() })
});

export const createEjemplarSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    codigo_ejemplar: z.string().min(1),
    estado: estadoEjemplar.optional()
  })
});

export const updateEjemplarSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({
    estado: estadoEjemplar,
    observaciones: z.string().optional()
  })
});
