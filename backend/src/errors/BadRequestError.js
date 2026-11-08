import { AppError } from "./AppError.js";

export class BadRequestError extends AppError {
  constructor(message = "Datos inválidos", code = "DATOS_INVALIDOS") {
    super(message, code);
    this.status = 400;
    this.statusCode = 400;
    this.code = code;
  }
}
