export class UsuarioService {
  listar = async () => [];
  obtenerActual = async (id) => ({ id, nombre: 'Simulado', apellido: 'Usuario' });
  obtenerPorId = async (id) => ({ id });
}
