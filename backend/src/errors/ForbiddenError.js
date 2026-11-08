import { AppError } from "./AppError.js";

export class ForbiddenError extends AppError {
  constructor(
    message = "Acceso denegado: no tiene permisos para realizar esta acción",
    code = "ACCESO_DENEGADO"
  ) {
    super(message, code);
    this.status = 403;
    this.statusCode = 403;
    this.code = code;
  }
}
