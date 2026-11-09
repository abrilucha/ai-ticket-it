import { UnauthorizedError } from "../errors/UnauthorizedError.js";
import { sesionRepository } from "../repositories/SesionRepository.js";
import { usuarioRepository } from "../repositories/UsuarioRepository.js";

export const requireAuth = async (req, res, next) => {
  const ruta = (req.originalUrl || req.url || "").split("?")[0];
  const metodo = req.method;

  // Rutas públicas exentas de autenticación:
  // - GET /health
  // - POST /auth/register
  // - POST /auth/login
  // - POST /dev/reset (para entorno dev/test)
  if (
    (ruta === "/health" && metodo === "GET") ||
    (ruta === "/auth/register" && metodo === "POST") ||
    (ruta === "/auth/login" && metodo === "POST") ||
    (ruta === "/dev/reset" && metodo === "POST")
  ) {
    return next();
  }

  // Compatibilidad con tests legados: si ENABLE_SIMULATED_AUTH === "true" y vino x-user-id
  if (process.env.ENABLE_SIMULATED_AUTH === "true") {
    if (req.user && req.user.id) {
      return next();
    }
  }

  // Resolución por Authorization: Bearer <token>
  const isSimulatedMode = process.env.ENABLE_SIMULATED_AUTH === "true";
  const defaultErrorCode = isSimulatedMode ? "NO_AUTORIZADO" : "NO_AUTENTICADO";

  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== "string") {
    return next(new UnauthorizedError("Token no proporcionado", defaultErrorCode));
  }

  const parts = authHeader.trim().split(/\s+/);
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return next(new UnauthorizedError("Formato de token inválido", "NO_AUTENTICADO"));
  }

  const token = parts[1];
  const sesion = await sesionRepository.obtener(token);
  if (!sesion) {
    return next(new UnauthorizedError("Sesión inválida o expirada", "NO_AUTENTICADO"));
  }

  const usuario = await usuarioRepository.findById(sesion.usuarioId);
  if (!usuario) {
    return next(new UnauthorizedError("Usuario no encontrado", "NO_AUTENTICADO"));
  }

  req.user = usuario;
  req.token = token;
  next();
};
