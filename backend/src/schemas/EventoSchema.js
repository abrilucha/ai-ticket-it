import { z } from "zod";

const TipoEntradaSchema = z.object({
  nombre: z
    .string({ required_error: "El nombre del tipo de entrada es obligatorio" })
    .min(1, "El nombre del tipo de entrada no puede estar vacío"),
  descripcion: z.string().optional().default(""),
  precio: z
    .number({ required_error: "El precio es obligatorio" })
    .min(0, "El precio no puede ser negativo"),
  cupo: z
    .number({ required_error: "El cupo es obligatorio" })
    .int("El cupo debe ser un número entero")
    .min(1, "El cupo debe ser de al menos 1 entrada"),
});

export const EventoSchema = z.object({
  nombre: z
    .string({ required_error: "El nombre del evento es obligatorio" })
    .min(2, "El nombre debe tener al menos 2 caracteres"),
  descripcion: z
    .string({ required_error: "La descripción es obligatoria" })
    .min(5, "La descripción debe tener al menos 5 caracteres"),
  categoria: z.union([
    z.string({ required_error: "La categoría es obligatoria" }).min(1),
    z.object({
      nombre: z.string({ required_error: "El nombre de la categoría es obligatorio" }).min(1),
      descripcion: z.string().optional().default(""),
    }),
  ]),
  fecha: z
    .string({ required_error: "La fecha del evento es obligatoria" })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Formato de fecha inválido",
    })
    .refine((val) => new Date(val) > new Date(), {
      message: "La fecha del evento debe ser a futuro",
    }),
  tiposEntrada: z
    .array(TipoEntradaSchema)
    .min(1, "Debe incluir al menos un tipo de entrada con precio y cupo")
    .refine(
      (tipos) => {
        const nombres = tipos.map((t) => t.nombre.trim().toLowerCase());
        return new Set(nombres).size === nombres.length;
      },
      {
        message: "No puede haber tipos de entrada con nombres duplicados",
      }
    ),
  multimedia: z
    .array(z.string())
    .optional()
    .default([]),
});
