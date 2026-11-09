import { usuarioRepository } from "../repositories/UsuarioRepository.js";

export const authSimulada = async (req, res, next) => {
  // Solo se acepta si ENABLE_SIMULATED_AUTH vale exactamente "true" (leído dinámicamente por request)
  if (process.env.ENABLE_SIMULATED_AUTH === "true") {
    const userId = req.headers["x-user-id"];
    if (userId) {
      try {
        const usuario = await usuarioRepository.findById(userId);
        if (usuario) {
          req.user = usuario;
        }
      } catch {
        // ignorar
      }
    }
  }
  next();
};
