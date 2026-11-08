export class MensajeService {
  listarPorCompra = async (compraId) => [];
  enviar = async (compraId, data, usuarioId) => ({ id: 'mock-id', compraId, usuarioId, ...data });
}
