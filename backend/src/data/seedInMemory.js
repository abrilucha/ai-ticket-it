import slugify from "slugify";
import { usuarioRepository } from "../repositories/UsuarioRepository.js";
import { categoriaRepository } from "../repositories/CategoriaRepository.js";
import { eventoRepository } from "../repositories/EventoRepository.js";
import { compraRepository } from "../repositories/CompraRepository.js";
import { reseniaRepository } from "../repositories/ReseniaRepository.js";
import { cambioEstadoCompraRepository } from "../repositories/CambioEstadoCompraRepository.js";
import { mensajeRepository } from "../repositories/MensajeRepository.js";

const codigo = (titulo) => slugify(titulo, { lower: true, replacement: "_" });

export async function inicializarSeedInMemory() {
  await Promise.all([
    usuarioRepository.clear(),
    categoriaRepository.clear(),
    eventoRepository.clear(),
    compraRepository.clear(),
    reseniaRepository.clear(),
    cambioEstadoCompraRepository.clear(),
    mensajeRepository.clear(),
  ]);

  // 1. Categorías
  const catRecitales = await categoriaRepository.save({
    id: "cat_recitales",
    nombre: "Recitales y Conciertos",
    codigo: codigo("Recitales y Conciertos"),
    descripcion: "Música en vivo de todos los géneros",
  });

  const catTeatro = await categoriaRepository.save({
    id: "cat_teatro",
    nombre: "Obras de Teatro",
    codigo: codigo("Obras de Teatro"),
    descripcion: "Dramas, comedias y espectáculos teatrales",
  });

  const catFestivales = await categoriaRepository.save({
    id: "cat_festivales",
    nombre: "Festivales",
    codigo: codigo("Festivales"),
    descripcion: "Grandes encuentros artísticos y musicales",
  });

  const catDeportes = await categoriaRepository.save({
    id: "cat_deportes",
    nombre: "Deportes",
    codigo: codigo("Deportes"),
    descripcion: "Partidos, torneos y competencias deportivas",
  });

  const catConferencias = await categoriaRepository.save({
    id: "cat_conferencias",
    nombre: "Conferencias y Charlas",
    codigo: codigo("Conferencias y Charlas"),
    descripcion: "Congresos, charlas y workshops presenciales",
  });

  // 2. Usuarios
  const comprador1 = await usuarioRepository.save({
    id: "usr_comprador_1",
    nombre: "Lucas",
    apellido: "García",
    email: "lucas.garcia@gmail.com",
    rol: "COMPRADOR",
    favoritos: [],
  });

  const comprador2 = await usuarioRepository.save({
    id: "usr_comprador_2",
    nombre: "Mariana",
    apellido: "López",
    email: "mariana.lopez@hotmail.com",
    rol: "COMPRADOR",
    favoritos: [],
  });

  await usuarioRepository.save({
    id: "usr_comprador_3",
    nombre: "Sofía",
    apellido: "Martínez",
    email: "sofia.martinez@yahoo.com",
    rol: "COMPRADOR",
    favoritos: [],
  });

  const organizadorRock = await usuarioRepository.save({
    id: "usr_org_rock",
    nombre: "Productora",
    apellido: "Rock Nacional",
    email: "contacto@rocknacional.com.ar",
    rol: "ORGANIZADOR",
    favoritos: [],
  });

  const organizadorTeatro = await usuarioRepository.save({
    id: "usr_org_teatro",
    nombre: "Teatro",
    apellido: "Gran Rex",
    email: "entradas@granrex.com.ar",
    rol: "ORGANIZADOR",
    favoritos: [],
  });

  // 3. Eventos
  const fechaFutura1 = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
  const fechaFutura2 = new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString();
  const fechaFutura3 = new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString();
  const fechaPasada = new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString();

  const eventoRock = await eventoRepository.save({
    id: "evt_cosquin",
    nombre: "Cosquín Rock 2027",
    descripcion: "El festival de rock más grande del país con más de 100 bandas en escena.",
    categoria: catFestivales,
    fecha: fechaFutura1,
    organizador: organizadorRock,
    multimedia: [
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745",
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a",
    ],
    tiposEntrada: [
      {
        id: "tipo_rock_1",
        nombre: "Campo General",
        precio: 25000,
        cupo: 500,
        cupoDisponible: 500,
      },
      {
        id: "tipo_rock_2",
        nombre: "Espacio VIP",
        precio: 60000,
        cupo: 100,
        cupoDisponible: 100,
      },
    ],
  });

  const eventoTeatro = await eventoRepository.save({
    id: "evt_teatro",
    nombre: "Toc Toc",
    descripcion: "La comedia más exitosa de la calle Corrientes sobre seis personajes con TOC.",
    categoria: catTeatro,
    fecha: fechaFutura2,
    organizador: organizadorTeatro,
    multimedia: ["https://images.unsplash.com/photo-1507676184212-d03ab07a01bf"],
    tiposEntrada: [
      {
        id: "tipo_teatro_1",
        nombre: "Platea Baja",
        precio: 18000,
        cupo: 200,
        cupoDisponible: 200,
      },
      {
        id: "tipo_teatro_2",
        nombre: "Pullman",
        precio: 12000,
        cupo: 150,
        cupoDisponible: 150,
      },
    ],
  });

  const eventoPasado = await eventoRepository.save({
    id: "evt_divididos",
    nombre: "Divididos en vivo",
    descripcion: "La aplanadora del rock festejó sus 35 años de trayectoria con un show demoledor.",
    categoria: catRecitales,
    fecha: fechaPasada,
    organizador: organizadorRock,
    multimedia: ["https://images.unsplash.com/photo-1465847899084-d164df4dedc6"],
    tiposEntrada: [
      {
        id: "tipo_divididos_1",
        nombre: "General",
        precio: 20000,
        cupo: 300,
        cupoDisponible: 0,
      },
    ],
  });

  await eventoRepository.save({
    id: "evt_lollapalooza",
    nombre: "Lollapalooza Argentina",
    descripcion: "Tres días de música internacional, arte y gastronomía en el Hipódromo de San Isidro.",
    categoria: catFestivales,
    fecha: fechaFutura3,
    organizador: organizadorRock,
    multimedia: ["https://images.unsplash.com/photo-1459749411175-04bf5292ceea"],
    tiposEntrada: [
      {
        id: "tipo_lolla_1",
        nombre: "Abono General 3 Días",
        precio: 95000,
        cupo: 1000,
        cupoDisponible: 1000,
      },
      {
        id: "tipo_lolla_2",
        nombre: "Abono VIP",
        precio: 180000,
        cupo: 200,
        cupoDisponible: 200,
      },
    ],
  });

  // Favorito
  comprador1.favoritos.push(eventoRock.id);
  await usuarioRepository.save(comprador1);

  // 4. Compras de ejemplo
  const compraConfirmada = await compraRepository.save({
    id: "cmp_confirmada_1",
    comprador: comprador1,
    evento: eventoRock,
    tipoEntrada: {
      tipoEntradaId: "tipo_rock_1",
      nombre: "Campo General",
      precio: 25000,
    },
    cantidad: 2,
    total: 50000,
    estado: "CONFIRMADA",
  });

  // Mensajes de chat en el MensajeRepository propio
  await mensajeRepository.save({
    id: "msg_seed_1",
    compraId: "cmp_confirmada_1",
    autorId: comprador1.id,
    texto: "¡Hola! ¿A qué hora abren las puertas?",
    fecha: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  });

  await mensajeRepository.save({
    id: "msg_seed_2",
    compraId: "cmp_confirmada_1",
    autorId: organizadorRock.id,
    texto: "Buenas tardes Lucas, abren a las 16:00 hs.",
    fecha: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  });

  await compraRepository.save({
    id: "cmp_pendiente_1",
    comprador: comprador2,
    evento: eventoTeatro,
    tipoEntrada: {
      tipoEntradaId: "tipo_teatro_1",
      nombre: "Platea Baja",
      precio: 18000,
    },
    cantidad: 2,
    total: 36000,
    estado: "PENDIENTE",
  });

  const compraUtilizada1 = await compraRepository.save({
    id: "cmp_utilizada_1",
    comprador: comprador1,
    evento: eventoPasado,
    tipoEntrada: {
      tipoEntradaId: "tipo_divididos_1",
      nombre: "General",
      precio: 20000,
    },
    cantidad: 1,
    total: 20000,
    estado: "UTILIZADA",
  });

  const compraUtilizada2 = await compraRepository.save({
    id: "cmp_utilizada_2",
    comprador: comprador2,
    evento: eventoPasado,
    tipoEntrada: {
      tipoEntradaId: "tipo_divididos_1",
      nombre: "General",
      precio: 20000,
    },
    cantidad: 1,
    total: 20000,
    estado: "UTILIZADA",
  });

  await compraRepository.save({
    id: "cmp_utilizada_sin_resena",
    comprador: comprador1,
    evento: eventoPasado,
    tipoEntrada: {
      tipoEntradaId: "tipo_divididos_1",
      nombre: "General",
      precio: 20000,
    },
    cantidad: 1,
    total: 20000,
    estado: "UTILIZADA",
  });

  // 5. Historial de cambios
  await cambioEstadoCompraRepository.save({
    compra: compraConfirmada,
    estado: "CONFIRMADA",
    quien: comprador1,
    fechaHora: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
  });

  await cambioEstadoCompraRepository.save({
    compra: compraUtilizada1,
    estado: "UTILIZADA",
    quien: organizadorRock,
    fechaHora: new Date(fechaPasada),
  });

  await cambioEstadoCompraRepository.save({
    compra: compraUtilizada2,
    estado: "UTILIZADA",
    quien: organizadorRock,
    fechaHora: new Date(fechaPasada),
  });

  // 6. Reseñas iniciales
  // Reseña 1: puntaje 5 (Comprador 1)
  await reseniaRepository.save({
    id: "res_1",
    compraId: "cmp_utilizada_1",
    puntaje: 5,
    comentario: "¡Increíble show y excelente organización del acceso!",
    fecha: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
  });

  // Reseña 2: puntaje 3 (Comprador 2) -> promedio de Productora Rock Nacional = (5 + 3)/2 = 4.0
  await reseniaRepository.save({
    id: "res_2",
    compraId: "cmp_utilizada_2",
    puntaje: 3,
    comentario: "El sonido en el campo trasero estuvo regular, pero buena onda.",
    fecha: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
  });

  console.log(" Seed en memoria cargado exitosamente:");
  console.log("   - 5 Categorías");
  console.log("   - 3 Compradores y 2 Organizadores");
  console.log("   - 4 Eventos con tipos de entrada");
  console.log("   - 4 Compras con historial de estados");
  console.log("   - 2 Reseñas (promedio 4.0 para Productora Rock, 0 para Teatro Rex)");
}
