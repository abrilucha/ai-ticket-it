import { CategoriaService, categoriaService as defaultCatService } from "../services/CategoriaService.js";

export class CategoriaController {
  constructor(categoriaService = defaultCatService || new CategoriaService()) {
    this.categoriaService = categoriaService;
  }

  listar = async (req, res, next) => {
    try {
      res.status(200).json(await this.categoriaService.listar());
    } catch (e) {
      next(e);
    }
  };
}
