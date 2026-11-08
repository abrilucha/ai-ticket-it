import { z } from "zod";

export const CompraSchema = z.object({
  eventoId: z.string({ required_error: "El evento es obligatorio" })
    .min(1, "El id del evento no puede estar vacío"),
  tipoEntradaId: z.string({ required_error: "El tipo de entrada es obligatorio" })
    .min(1, "El id del tipo de entrada no puede estar vacío"),
  cantidad: z.number({ required_error: "La cantidad es obligatoria" })
    .int("La cantidad debe ser un número entero")
    .min(1, "Debe comprar al menos 1 entrada"),
});
