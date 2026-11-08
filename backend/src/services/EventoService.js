export class EventoService {
  buscar = async (filtros) => [];
  obtenerPorId = async (id) => ({ id });
  crear = async (data, organizadorId) => ({ id: 'mock-id', ...data, organizador: organizadorId });
  actualizar = async (id, data) => ({ id, ...data });
  eliminar = async (id) => true;
  listarMios = async (organizadorId) => [];
  listarCompras = async (eventoId) => ({ compras: [], disponibilidadPorTipo: [] });
  listarResenas = async (eventoId) => [];
}
