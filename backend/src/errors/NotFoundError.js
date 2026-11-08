import { AppError } from "./AppError.js";

export class NotFoundError extends AppError {
  constructor(message = "Recurso no encontrado", code = "NO_ENCONTRADO") {
    super(message);
    this.status = 404;
    this.statusCode = 404;
    this.code = code;
  }
}
