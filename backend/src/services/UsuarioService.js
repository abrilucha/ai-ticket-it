import { usuarioRepository } from "../repositories/UsuarioRepository.js";
import { authService } from "./AuthService.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { ConflictError } from "../errors/ConflictError.js";

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)/;

export class UsuarioService {
  constructor(userRepo = usuarioRepository) {
    this.usuarioRepository = userRepo;
  }

  obtenerActual = async (id) => {
    if (!id) return null;
    const u = await this.usuarioRepository.findById(id);
    if (!u) return null;
    return {
      id: u.id,
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      rol: u.rol,
      fotoPerfil: u.fotoPerfil || null,
    };
  };

  actualizarPerfil = async (id, datos = {}) => {
    if (!id) throw new UnauthorizedError("Usuario no autenticado", "NO_AUTENTICADO");
    const u = await this.usuarioRepository.findById(id);
    if (!u) throw new BadRequestError("Usuario no encontrado", "NO_ENCONTRADO");

    const { nombre, apellido, email, fotoPerfil, passwordActual, passwordNueva } = datos;

    if (nombre !== undefined) {
      if (!nombre || nombre.trim().length === 0) {
        throw new BadRequestError("El nombre no puede estar vacío", "DATOS_INVALIDOS");
      }
      u.nombre = nombre.trim();
    }

    if (apellido !== undefined) {
      if (u.rol === "COMPRADOR" && (!apellido || apellido.trim().length === 0)) {
        throw new BadRequestError("El apellido es obligatorio para compradores", "DATOS_INVALIDOS");
      }
      u.apellido = apellido ? apellido.trim() : null;
    }

    if (email !== undefined) {
      const emailNormalizado = email.trim().toLowerCase();
      if (!emailNormalizado || !emailNormalizado.includes("@")) {
        throw new BadRequestError("Formato de email inválido", "DATOS_INVALIDOS");
      }
      if (emailNormalizado !== u.email) {
        if (!passwordActual) {
          throw new BadRequestError("Debes ingresar tu contraseña actual para confirmar el cambio de email", "PASSWORD_ACTUAL_REQUERIDA");
        }
        const validaEmailPass = await authService.verifyPassword(passwordActual, u.passwordHash);
        if (!validaEmailPass) {
          throw new UnauthorizedError("La contraseña actual es incorrecta", "PASSWORD_ACTUAL_INCORRECTA");
        }

        const existente = await this.usuarioRepository.findByEmail(emailNormalizado);
        if (existente && existente.id !== u.id) {
          throw new ConflictError("Ese email ya está registrado", "EMAIL_YA_REGISTRADO");
        }
        u.email = emailNormalizado;
      }
    }

    if (fotoPerfil !== undefined) {
      u.fotoPerfil = fotoPerfil || null;
    }

    if (passwordNueva) {
      if (!passwordActual) {
        throw new BadRequestError("Debes ingresar tu contraseña actual para cambiarla", "PASSWORD_ACTUAL_REQUERIDA");
      }
      const valida = await authService.verifyPassword(passwordActual, u.passwordHash);
      if (!valida) {
        throw new UnauthorizedError("La contraseña actual es incorrecta", "PASSWORD_ACTUAL_INCORRECTA");
      }
      if (passwordNueva.length < 8 || passwordNueva.length > 128 || !passwordRegex.test(passwordNueva)) {
        throw new BadRequestError("La nueva contraseña debe tener entre 8 y 128 caracteres, y al menos una letra y un número", "DATOS_INVALIDOS");
      }
      u.passwordHash = await authService.hashPassword(passwordNueva);
    }

    await this.usuarioRepository.save(u);

    return {
      id: u.id,
      nombre: u.nombre,
      apellido: u.apellido,
      email: u.email,
      rol: u.rol,
      fotoPerfil: u.fotoPerfil || null,
    };
  };
}

export const usuarioService = new UsuarioService();
