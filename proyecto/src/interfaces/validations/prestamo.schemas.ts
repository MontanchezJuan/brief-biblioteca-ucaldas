import { z } from "zod";

const estadoPrestamo = z.enum(["ACTIVO", "DEVUELTO", "VENCIDO"]);
const booleanQuery = z
  .enum(["true", "false"])
  .transform((value) => value === "true")
  .optional();

export const listPrestamosSchema = z.object({
  query: z.object({
    estado: estadoPrestamo.optional(),
    estudiante_id: z.string().optional(),
    vencidos: booleanQuery
  })
});

export const listPrestamosEstudianteSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  query: z.object({
    estado: estadoPrestamo.optional(),
    desde: z.string().optional(),
    hasta: z.string().optional()
  })
});

export const createPrestamoSchema = z.object({
  body: z.object({
    estudiante_id: z.string().min(1),
    ejemplar_id: z.string().min(1)
  })
});

export const prestamoIdSchema = z.object({
  params: z.object({ id: z.string().min(1) })
});

export const returnPrestamoSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({ fecha_devolucion_real: z.string().optional() }).optional().default({})
});

export const listVencidosSchema = z.object({
  query: z.object({
    dias_minimo: z.coerce.number().int().nonnegative().optional()
  })
});
