import { z } from "zod";

export const CategoriaSchema = z.object({
  nombre: z.string({ required_error: "El nombre es obligatorio" })
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  descripcion: z.string().optional().default(""),
});
