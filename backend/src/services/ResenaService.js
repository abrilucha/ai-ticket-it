export class ResenaService {
  crear = async (compraId, data, usuarioId) => ({ id: 'mock-id', compraId, usuarioId, ...data });
  obtenerPorCompra = async (compraId) => null;
}
