import { CompraService } from "../src/services/CompraService.js";
import { EstadoCompra } from "../src/domain/EstadoCompra.js";
import { ConflictError } from "../src/errors/ConflictError.js";
import { errorHandler } from "../src/middlewares/errorHandler.js";

describe("Ramas de transiciones de CompraService y Manejador de Errores 500", () => {
  describe("CompraService - Transiciones inválidas y casos borde", () => {
    test("Transiciones inválidas para acción PAGAR", () => {
      // Desde CONFIRMADA
      expect(() => CompraService.transicionarEstado(EstadoCompra.CONFIRMADA, "PAGAR"))
        .toThrow(ConflictError);
      // Desde UTILIZADA
      expect(() => CompraService.transicionarEstado(EstadoCompra.UTILIZADA, "PAGAR"))
        .toThrow(ConflictError);
      // Desde CANCELADA
      expect(() => CompraService.transicionarEstado(EstadoCompra.CANCELADA, "PAGAR"))
        .toThrow(ConflictError);
      // Desde REEMBOLSADA
      expect(() => CompraService.transicionarEstado(EstadoCompra.REEMBOLSADA, "PAGAR"))
        .toThrow(ConflictError);
      // Desde estado desconocido
      expect(() => CompraService.transicionarEstado("ESTADO_INEXISTENTE", "PAGAR"))
        .toThrow(ConflictError);
    });

    test("Transiciones inválidas para acción UTILIZAR", () => {
      // Desde UTILIZADA (doble uso)
      expect(() => CompraService.transicionarEstado(EstadoCompra.UTILIZADA, "UTILIZAR"))
        .toThrow(ConflictError);
      // Desde PENDIENTE
      expect(() => CompraService.transicionarEstado(EstadoCompra.PENDIENTE, "UTILIZAR"))
        .toThrow(ConflictError);
      // Desde CANCELADA
      expect(() => CompraService.transicionarEstado(EstadoCompra.CANCELADA, "UTILIZAR"))
        .toThrow(ConflictError);
      // Desde REEMBOLSADA
      expect(() => CompraService.transicionarEstado(EstadoCompra.REEMBOLSADA, "UTILIZAR"))
        .toThrow(ConflictError);
      // Desde estado desconocido
      expect(() => CompraService.transicionarEstado("ESTADO_INEXISTENTE", "UTILIZAR"))
        .toThrow(ConflictError);
    });

    test("Transiciones inválidas para acción CANCELAR", () => {
      // Desde UTILIZADA
      expect(() => CompraService.transicionarEstado(EstadoCompra.UTILIZADA, "CANCELAR"))
        .toThrow(ConflictError);
      // Desde CANCELADA
      expect(() => CompraService.transicionarEstado(EstadoCompra.CANCELADA, "CANCELAR"))
        .toThrow(ConflictError);
      // Desde REEMBOLSADA
      expect(() => CompraService.transicionarEstado(EstadoCompra.REEMBOLSADA, "CANCELAR"))
        .toThrow(ConflictError);
      // Desde estado desconocido
      expect(() => CompraService.transicionarEstado("ESTADO_INEXISTENTE", "CANCELAR"))
        .toThrow(ConflictError);
    });

    test("Acción desconocida en la máquina de estados", () => {
      expect(() => CompraService.transicionarEstado(EstadoCompra.PENDIENTE, "ACCION_INEXISTENTE"))
        .toThrow(ConflictError);
    });
  });

  describe("errorHandler - Camino de error 500 no controlado y headersSent", () => {
    test("Error no controlado devuelve 500 uniforme sin exponer stack al cliente", () => {
      const err = new Error("Fallo inesperado no contemplado");
      let statusCode = null;
      let jsonPayload = null;

      const req = {};
      const res = {
        headersSent: false,
        status(code) {
          statusCode = code;
          return this;
        },
        json(data) {
          jsonPayload = data;
          return this;
        },
      };
      let nextCalledWith = null;
      const next = (e) => { nextCalledWith = e; };

      errorHandler(err, req, res, next);

      expect(statusCode).toBe(500);
      expect(jsonPayload).toBeDefined();
      expect(jsonPayload.error).toEqual({
        code: "ERROR_INTERNO",
        message: "Error interno del servidor",
      });
      expect(jsonPayload.statusCode).toBe(500);
      expect(jsonPayload.stack).toBeUndefined();
      expect(jsonPayload.error.stack).toBeUndefined();
      expect(nextCalledWith).toBeNull();
    });

    test("Si headersSent es true, delega en next(err)", () => {
      const err = new Error("Error después de headers enviados");
      const req = {};
      const res = {
        headersSent: true,
      };
      let nextCalledWith = null;
      const next = (e) => { nextCalledWith = e; };

      errorHandler(err, req, res, next);

      expect(nextCalledWith).toBe(err);
    });
  });
});
