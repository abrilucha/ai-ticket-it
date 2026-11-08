export class FavoritoService {
  listar = async (usuarioId) => [];
  agregar = async (usuarioId, eventoId) => ({ usuarioId, eventoId, agregado: true });
  quitar = async (usuarioId, eventoId) => ({ usuarioId, eventoId, quitado: true });
}
