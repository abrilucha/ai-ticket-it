import { usuarioRepository } from "../repositories/UsuarioRepository.js";

export const authSimulada = async (req, res, next) => {
  const userId = req.headers["x-user-id"];
  if (userId) {
    try {
      const usuario = await usuarioRepository.findById(userId);
      if (usuario) {
        req.user = usuario;
      } else {
        req.user = { id: userId, _id: userId };
      }
    } catch {
      req.user = { id: userId, _id: userId };
    }
  }
  next();
};
