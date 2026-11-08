import { UsuarioModel } from "../mongoschemas/UsuarioModel.js";

export const authSimulada = async (req, res, next) => {
  const userId = req.headers["x-user-id"];
  if (userId) {
    try {
      const usuario = await UsuarioModel.findById(userId);
      if (usuario) {
        req.user = usuario;
      } else {
        req.user = { _id: userId, id: userId };
      }
    } catch {
      req.user = { _id: userId, id: userId };
    }
  }
  next();
};
