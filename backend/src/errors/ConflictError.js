import { AppError } from "./AppError.js";

export class ConflictError extends AppError {
  constructor(message, code = "CONFLICTO") {
    super(message, code);
    this.status = 409;
    this.statusCode = 409;
    this.code = code;
  }
}
