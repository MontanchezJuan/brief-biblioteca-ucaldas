import { z } from "zod";

const tipoEstudiante = z.enum(["PREGRADO", "POSGRADO"]);

export const listEstudiantesSchema = z.object({
  query: z.object({
    codigo_estudiante: z.string().optional(),
    nombre: z.string().optional(),
    tipo: tipoEstudiante.optional()
  })
});

export const estudianteIdSchema = z.object({
  params: z.object({ id: z.string().min(1) })
});

export const createEstudianteSchema = z.object({
  body: z.object({
    codigo_estudiante: z.string().min(1),
    nombre: z.string().min(1),
    programa: z.string().min(1),
    semestre: z.number().int().positive(),
    tipo: tipoEstudiante
  })
});

export const updateEstudianteSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z
    .object({
      nombre: z.string().min(1).optional(),
      programa: z.string().min(1).optional(),
      semestre: z.number().int().positive().optional(),
      tipo: tipoEstudiante.optional(),
      activo: z.boolean().optional()
    })
    .refine((body) => Object.keys(body).length > 0, "Debe enviar al menos un campo.")
});
