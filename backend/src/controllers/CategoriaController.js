import { CategoriaService } from "../services/CategoriaService.js";

export class CategoriaController {
  constructor(categoriaService = new CategoriaService()) {
    this.categoriaService = categoriaService;
  }

  listar = async (req, res, next) => {
    try {
      res.status(200).json(await this.categoriaService.listar());
    } catch (e) {
      next(e);
    }
  };

  crear = async (req, res, next) => {
    try {
      res.status(201).json(await this.categoriaService.crear(req.body));
    } catch (e) {
      next(e);
    }
  };
}
