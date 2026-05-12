import { z } from "zod";

const estadoSolicitud = z.enum(["PENDIENTE", "ATENDIDA", "CANCELADA"]);

export const listSolicitudesSchema = z.object({
  query: z.object({
    estado: estadoSolicitud.optional(),
    libro_id: z.string().optional(),
    estudiante_id: z.string().optional()
  })
});

export const createSolicitudSchema = z.object({
  body: z.object({
    estudiante_id: z.string().min(1),
    libro_id: z.string().min(1)
  })
});

export const updateSolicitudSchema = z.object({
  params: z.object({ id: z.string().min(1) }),
  body: z.object({ estado: estadoSolicitud })
});
