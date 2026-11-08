import { z } from "zod";

export const MensajeSchema = z.object({
  texto: z
    .string({
      required_error: "El campo 'texto' es obligatorio",
      invalid_type_error: "El campo 'texto' debe ser un string",
    })
    .trim()
    .min(1, "El texto del mensaje no puede estar vacío")
    .max(1000, "El texto del mensaje no puede superar los 1000 caracteres"),
});
