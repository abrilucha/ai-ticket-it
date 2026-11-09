import { z } from "zod";

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)/;

export const RegisterSchema = z
  .object({
    nombre: z
      .string({ required_error: "El nombre es obligatorio" })
      .trim()
      .min(1, "El nombre no puede estar vacío")
      .max(60, "El nombre no puede superar los 60 caracteres"),
    apellido: z.string().trim().optional(),
    email: z
      .string({ required_error: "El email es obligatorio" })
      .trim()
      .email("El formato de email es inválido")
      .max(254, "El email no puede superar los 254 caracteres"),
    password: z
      .string({ required_error: "La contraseña es obligatoria" })
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(128, "La contraseña no puede superar los 128 caracteres")
      .regex(
        passwordRegex,
        "La contraseña debe contener al menos una letra y un número"
      ),
    rol: z.enum(["COMPRADOR", "ORGANIZADOR"], {
      errorMap: () => ({ message: "El rol debe ser COMPRADOR u ORGANIZADOR" }),
    }),
  })
  .strip()
  .superRefine((data, ctx) => {
    if (data.rol === "COMPRADOR") {
      if (!data.apellido || data.apellido.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["apellido"],
          message: "El apellido es obligatorio para el rol COMPRADOR",
        });
      }
    }
  });

export const LoginSchema = z
  .object({
    email: z
      .string({ required_error: "El email es obligatorio" })
      .trim()
      .min(1, "El email no puede estar vacío")
      .email("El formato de email es inválido"),
    password: z
      .string({ required_error: "La contraseña es obligatoria" })
      .min(1, "La contraseña no puede estar vacía"),
  })
  .strip();
