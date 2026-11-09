import crypto from "crypto";

export class SesionRepository {
  constructor() {
    this.sesiones = new Map();
    this.TTL_MS = 24 * 60 * 60 * 1000; // 24 horas
  }

  async crear(usuarioId) {
    const token = crypto.randomBytes(32).toString("hex");
    const sesion = {
      usuarioId,
      creadoEn: Date.now(),
    };
    this.sesiones.set(token, sesion);
    return token;
  }

  async obtener(token) {
    if (!token || typeof token !== "string") return null;
    const sesion = this.sesiones.get(token);
    if (!sesion) return null;
    if (Date.now() - sesion.creadoEn > this.TTL_MS) {
      this.sesiones.delete(token);
      return null;
    }
    return sesion;
  }

  async eliminar(token) {
    if (!token) return false;
    return this.sesiones.delete(token);
  }

  async clear() {
    this.sesiones.clear();
  }
}

export const sesionRepository = new SesionRepository();
