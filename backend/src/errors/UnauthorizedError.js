import { AppError } from "./AppError.js";

export class UnauthorizedError extends AppError {
  constructor(message = "Autenticación requerida: falta header x-user-id o el usuario no existe") {
    super(message);
    this.status = 401;
    this.statusCode = 401;
  }
}
