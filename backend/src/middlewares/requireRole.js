import { AppError } from "../errors/AppError.js";

export const requireRole = (rolRequerido) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = new AppError("No autorizado: se requiere cabecera x-user-id");
      error.status = 401;
      return next(error);
    }
    if (req.user.rol && req.user.rol !== rolRequerido) {
      const error = new AppError(`Acceso denegado: se requiere rol ${rolRequerido}`);
      error.status = 403;
      return next(error);
    }
    next();
  };
};
