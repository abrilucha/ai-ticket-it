export class CategoriaRepository {
  constructor() {
    this.categorias = [];
  }

  async getAll() {
    return [...this.categorias];
  }

  async findById(id) {
    return this.categorias.find((c) => c.id === id) || null;
  }

  async findByCodigo(codigo) {
    return this.categorias.find((c) => c.codigo === codigo) || null;
  }

  async save(categoria) {
    const id = categoria.id;
    if (id) {
      const idx = this.categorias.findIndex((c) => c.id === id);
      if (idx !== -1) {
        this.categorias[idx] = { ...this.categorias[idx], ...categoria, id };
        return this.categorias[idx];
      }
    }
    const nuevoId = id || `cat_${crypto.randomUUID().slice(0, 8)}`;
    const nuevo = {
      ...categoria,
      id: nuevoId,
    };
    this.categorias.push(nuevo);
    return nuevo;
  }

  async clear() {
    this.categorias = [];
  }
}

export const categoriaRepository = new CategoriaRepository();
