import { authService as defaultAuthService } from "../services/AuthService.js";
import { RegisterSchema, LoginSchema } from "../schemas/AuthSchema.js";
import { BadRequestError } from "../errors/BadRequestError.js";
import { UnauthorizedError } from "../errors/UnauthorizedError.js";

export class AuthController {
  constructor(authService = defaultAuthService) {
    this.authService = authService;
  }

  register = async (req, res, next) => {
    try {
      const parsed = RegisterSchema.safeParse(req.body);
      if (!parsed.success) {
        const errorMsg = parsed.error.issues[0]?.message || "Datos inválidos";
        throw new BadRequestError(errorMsg, "DATOS_INVALIDOS");
      }
      const resultado = await this.authService.registrar(parsed.data);
      res.status(201).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  login = async (req, res, next) => {
    try {
      const parsed = LoginSchema.safeParse(req.body);
      if (!parsed.success) {
        const errorMsg = parsed.error.issues[0]?.message || "Datos inválidos";
        throw new BadRequestError(errorMsg, "DATOS_INVALIDOS");
      }
      const resultado = await this.authService.login(parsed.data);
      res.status(200).json(resultado);
    } catch (error) {
      next(error);
    }
  };

  logout = async (req, res, next) => {
    try {
      const token = req.token || (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7).trim() : null);
      if (!token) {
        throw new UnauthorizedError("Token no proporcionado", "NO_AUTENTICADO");
      }
      await this.authService.logout(token);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
}

export const authController = new AuthController();
