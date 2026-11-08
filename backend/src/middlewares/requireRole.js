import { ForbiddenError } from "../errors/ForbiddenError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";

export const requireRole = (rolRequerido) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new UnauthorizedError("No autorizado: se requiere cabecera x-user-id")
      );
    }
    if (req.user.rol && req.user.rol !== rolRequerido) {
      return next(
        new ForbiddenError(`Acceso denegado: se requiere rol ${rolRequerido}`)
      );
    }
    next();
  };
};
