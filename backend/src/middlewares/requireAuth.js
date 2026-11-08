import { UnauthorizedError } from "../errors/UnauthorizedError.js";

export const requireAuth = (req, res, next) => {
  const ruta = (req.originalUrl || req.url || "").split("?")[0];

  // Rutas públicas: GET /health y GET /usuarios
  if (ruta === "/health" || (ruta === "/usuarios" && req.method === "GET") || ruta === "/dev/reset") {
    return next();
  }

  if (!req.user || !req.user.id) {
    return next(
      new UnauthorizedError(
        "Autenticación requerida: falta header x-user-id o el usuario no existe"
      )
    );
  }

  next();
};
