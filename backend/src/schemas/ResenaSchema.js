import { z } from "zod";

export const ResenaSchema = z.object({
  puntaje: z
    .number({
      required_error: "El puntaje es obligatorio",
      invalid_type_error: "El puntaje debe ser un número",
    })
    .int("El puntaje debe ser un número entero")
    .min(1, "El puntaje mínimo permitido es 1")
    .max(5, "El puntaje máximo permitido es 5"),
  comentario: z
    .string({
      required_error: "El comentario es obligatorio",
      invalid_type_error: "El comentario debe ser un string",
    })
    .trim()
    .min(1, "El comentario no puede estar vacío")
    .max(500, "El comentario no puede superar los 500 caracteres"),
});
