export class CompraService {
  crear = async (data, compradorId) => ({ id: 'mock-id', ...data, comprador: compradorId });
  listarMias = async (compradorId) => [];
  obtenerPorId = async (id) => ({ id });
  pagar = async (id, datosPago) => ({ id, pagado: true });
  utilizar = async (id) => ({ id, utilizada: true });
  cancelar = async (id, usuarioId) => ({ id, cancelada: true });
}
