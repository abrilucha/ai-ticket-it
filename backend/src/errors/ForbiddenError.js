import { AppError } from "./AppError.js";

export class ForbiddenError extends AppError {
  constructor(message = "Acceso denegado: no tiene permisos para realizar esta acción") {
    super(message);
    this.status = 403;
    this.statusCode = 403;
  }
}
