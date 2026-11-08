import { AppError } from "../errors/AppError.js";

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  // JSON malformado del body-parser
  if (
    err instanceof SyntaxError &&
    (err.status === 400 || err.statusCode === 400) &&
    "body" in err
  ) {
    return res.status(400).json({
      error: {
        code: "JSON_MALFORMADO",
        message: "El cuerpo de la solicitud no es un JSON válido",
      },
      status: "fail",
      statusCode: 400,
      message: "El cuerpo de la solicitud no es un JSON válido",
      timestamp: new Date().toISOString(),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      error: {
        code: "ID_INVALIDO",
        message: `Id inválido: ${err.value}`,
      },
      status: "fail",
      statusCode: 400,
      message: `Id inválido: ${err.value}`,
      timestamp: new Date().toISOString(),
    });
  }

  if (err instanceof AppError) {
    const statusCode = err.statusCode || err.status || 500;
    const code =
      err.code ||
      (statusCode === 401
        ? "NO_AUTORIZADO"
        : statusCode === 403
        ? "ACCESO_DENEGADO"
        : statusCode === 404
        ? "NO_ENCONTRADO"
        : statusCode === 409
        ? "CONFLICTO"
        : statusCode === 400
        ? "DATOS_INVALIDOS"
        : "ERROR_SERVIDOR");

    return res.status(statusCode).json({
      error: {
        code,
        message: err.message,
      },
      status:
        err.status && typeof err.status === "string"
          ? err.status
          : statusCode >= 500
          ? "error"
          : "fail",
      statusCode: statusCode,
      message: err.message,
      timestamp: err.timestamp || new Date().toISOString(),
    });
  }

  // Errores no controlados (500)
  return res.status(500).json({
    error: {
      code: "ERROR_INTERNO",
      message: "Error interno del servidor",
    },
    status: "error",
    statusCode: 500,
    message: "Error interno del servidor",
    timestamp: new Date().toISOString(),
  });
}
