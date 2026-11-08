import { CategoriaModel } from "../mongoschemas/CategoriaModel.js";

export class CategoriaRepository {
  async getAll() {
    return await CategoriaModel.find().lean();
  }

  async findById(id) {
    return await CategoriaModel.findById(id);
  }

  async findByCodigo(codigo) {
    return await CategoriaModel.findOne({ codigo });
  }

  async save(categoria) {
    if (categoria.id || categoria._id) {
      return await CategoriaModel.findByIdAndUpdate(categoria.id || categoria._id, categoria, { new: true });
    }
    return await CategoriaModel.create(categoria);
  }
}

export const categoriaRepository = new CategoriaRepository();
