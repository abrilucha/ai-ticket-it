import { categoriaRepository } from "../repositories/CategoriaRepository.js";

export class CategoriaService {
  constructor(catRepo = categoriaRepository) {
    this.categoriaRepository = catRepo;
  }

  listar = async () => {
    return await this.categoriaRepository.getAll();
  };
}

export const categoriaService = new CategoriaService();
