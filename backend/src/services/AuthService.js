import crypto from "crypto";
import { promisify } from "util";
import { usuarioRepository } from "../repositories/UsuarioRepository.js";
import { sesionRepository } from "../repositories/SesionRepository.js";
import { Usuario } from "../domain/Usuario.js";
import { ConflictError } from "../errors/ConflictError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";

const scryptAsync = promisify(crypto.scrypt);
const KEY_LEN = 64;

// Sal fija de 16 bytes y hash previo de relleno para mitigación de timing attack en emails inexistentes
const DUMMY_SALT = crypto.randomBytes(16);
const DUMMY_HASH_KEY = await scryptAsync("dummy-timing-password", DUMMY_SALT, KEY_LEN);

export class AuthService {
  constructor(userRepo = usuarioRepository, sesRepo = sesionRepository) {
    this.usuarioRepository = userRepo;
    this.sesionRepository = sesRepo;
  }

  async hashPassword(password) {
    const salt = crypto.randomBytes(16);
    const derivedKey = await scryptAsync(password, salt, KEY_LEN);
    return `${salt.toString("hex")}:${derivedKey.toString("hex")}`;
  }

  async verifyPassword(password, storedHash) {
    if (!storedHash || typeof storedHash !== "string" || !storedHash.includes(":")) {
      return false;
    }
    const [saltHex, keyHex] = storedHash.split(":");
    const salt = Buffer.from(saltHex, "hex");
    const key = Buffer.from(keyHex, "hex");

    const derivedKey = await scryptAsync(password, salt, key.length);
    if (derivedKey.length !== key.length) {
      return false;
    }
    return crypto.timingSafeEqual(derivedKey, key);
  }

  async dummyVerify(password) {
    try {
      const derivedKey = await scryptAsync(password || "dummy", DUMMY_SALT, KEY_LEN);
      crypto.timingSafeEqual(derivedKey, DUMMY_HASH_KEY);
    } catch {
      // Ignorar
    }
  }

  registrar = async ({ nombre, apellido, email, password, rol }) => {
    const emailNormalizado = email.trim().toLowerCase();
    const existente = await this.usuarioRepository.findByEmail(emailNormalizado);
    if (existente) {
      throw new ConflictError(
        "Ese email ya está registrado",
        "EMAIL_YA_REGISTRADO"
      );
    }

    const passwordHash = await this.hashPassword(password);
    const usuarioDominio = new Usuario({
      nombre: nombre.trim(),
      apellido: apellido ? apellido.trim() : undefined,
      email: emailNormalizado,
      rol,
      passwordHash,
    });

    const guardado = await this.usuarioRepository.save(usuarioDominio);
    const token = await this.sesionRepository.crear(guardado.id);

    return {
      token,
      usuario: {
        id: guardado.id,
        nombre: guardado.nombre,
        apellido: guardado.apellido,
        email: guardado.email,
        rol: guardado.rol,
      },
    };
  };

  login = async ({ email, password }) => {
    const emailNormalizado = email.trim().toLowerCase();
    const usuario = await this.usuarioRepository.findByEmail(emailNormalizado);

    if (!usuario || !usuario.passwordHash) {
      await this.dummyVerify(password);
      throw new UnauthorizedError(
        "Email o contraseña incorrectos",
        "CREDENCIALES_INVALIDAS"
      );
    }

    const valida = await this.verifyPassword(password, usuario.passwordHash);
    if (!valida) {
      throw new UnauthorizedError(
        "Email o contraseña incorrectos",
        "CREDENCIALES_INVALIDAS"
      );
    }

    const token = await this.sesionRepository.crear(usuario.id);

    return {
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
      },
    };
  };

  logout = async (token) => {
    if (!token) {
      throw new UnauthorizedError("Token no proporcionado", "NO_AUTENTICADO");
    }
    const eliminada = await this.sesionRepository.eliminar(token);
    return eliminada;
  };
}

export const authService = new AuthService();
