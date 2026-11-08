import { categoriaRepository } from "../repositories/CategoriaRepository.js";

export class CategoriaService {
  constructor(catRepo = categoriaRepository) {
    this.categoriaRepository = catRepo;
  }

  listar = async () => {
    return await this.categoriaRepository.getAll();
  };

  crear = async (data) => {
    return await this.categoriaRepository.save(data);
  };
}

export const categoriaService = new CategoriaService();
