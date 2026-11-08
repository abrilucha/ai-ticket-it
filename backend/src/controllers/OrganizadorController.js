import { OrganizadorService } from "../services/OrganizadorService.js";

export class OrganizadorController {
  constructor(organizadorService = new OrganizadorService()) {
    this.organizadorService = organizadorService;
  }

  obtenerPerfil = async (req, res, next) => {
    try {
      const perfil = await this.organizadorService.obtenerPerfil(req.params.id);
      res.status(200).json(perfil);
    } catch (e) {
      next(e);
    }
  };

  listarResenas = async (req, res, next) => {
    try {
      const resenas = await this.organizadorService.listarResenas(req.params.id);
      res.status(200).json(resenas);
    } catch (e) {
      next(e);
    }
  };
}
