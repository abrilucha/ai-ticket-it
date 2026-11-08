export class AppError extends Error {
  constructor(message, code = "ERROR_GENERAL") {
    super(message);
    this.status = 500;
    this.statusCode = 500;
    this.code = code;
    this.timestamp = new Date().toISOString();
  }
}
