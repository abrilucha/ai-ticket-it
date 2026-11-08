import slugify from "slugify";
import { usuarioRepository } from "../repositories/UsuarioRepository.js";
import { categoriaRepository } from "../repositories/CategoriaRepository.js";
import { eventoRepository } from "../repositories/EventoRepository.js";
import { compraRepository } from "../repositories/CompraRepository.js";
import { reseniaRepository } from "../repositories/ReseniaRepository.js";
import { cambioEstadoCompraRepository } from "../repositories/CambioEstadoCompraRepository.js";

const codigo = (titulo) => slugify(titulo, { lower: true, replacement: "_" });

export async function inicializarSeedInMemory() {
  await Promise.all([
    usuarioRepository.clear(),
    categoriaRepository.clear(),
    eventoRepository.clear(),
    compraRepository.clear(),
    reseniaRepository.clear(),
    cambioEstadoCompraRepository.clear(),
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
    descripcion: "Partidos y competencias en vivo",
  });

  const catConferencias = await categoriaRepository.save({
    id: "cat_conferencias",
    nombre: "Conferencias",
    codigo: codigo("Conferencias"),
    descripcion: "Charlas, tecnología y networking",
  });

  // 2. Usuarios
  const comprador1 = await usuarioRepository.save({
    id: "usr_comprador_1",
    nombre: "Lucas",
    apellido: "García",
    email: "lucas.garcia@example.com",
    rol: "COMPRADOR",
  });

  const comprador2 = await usuarioRepository.save({
    id: "usr_comprador_2",
    nombre: "Mariana",
    apellido: "López",
    email: "mariana.lopez@example.com",
    rol: "COMPRADOR",
  });

  const comprador3 = await usuarioRepository.save({
    id: "usr_comprador_3",
    nombre: "Sofía",
    apellido: "Martínez",
    email: "sofia.martinez@example.com",
    rol: "COMPRADOR",
  });

  const organizadorRock = await usuarioRepository.save({
    id: "usr_org_rock",
    nombre: "Productora",
    apellido: "Rock Nacional",
    email: "contacto@rocknacional.com",
    rol: "ORGANIZADOR",
  });

  const organizadorTeatro = await usuarioRepository.save({
    id: "usr_org_teatro",
    nombre: "Teatro",
    apellido: "Gran Rex Producciones",
    email: "produccion@granrex.com",
    rol: "ORGANIZADOR",
  });

  // 3. Eventos
  const fechaFutura1 = new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString(); // en 15 días
  const fechaFutura2 = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(); // en 30 días
  const fechaFutura3 = new Date(Date.now() + 1000 * 60 * 60 * 24 * 90).toISOString(); // en 90 días
  const fechaPasada = new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(); // hace 5 días

  const eventoRock = await eventoRepository.save({
    id: "evt_cosquin",
    nombre: "Cosquín Rock 2027",
    descripcion: "El festival de rock más grande del país con bandas consagradas y nuevas tendencias.",
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
        descripcion: "Acceso a todos los escenarios principales de pie",
        precio: 25000,
        cupo: 500,
        cupoDisponible: 498,
      },
      {
        id: "tipo_rock_2",
        nombre: "Fanatic VIP",
        descripcion: "Sector exclusivo con vista preferencial y barra libre",
        precio: 65000,
        cupo: 100,
        cupoDisponible: 100,
      },
    ],
  });

  const eventoTeatro = await eventoRepository.save({
    id: "evt_carroza",
    nombre: "Esperando la Carroza - Versión Teatral",
    descripcion: "El clásico rioplatense vuelve a los escenarios con elenco estelar.",
    categoria: catTeatro,
    fecha: fechaFutura2,
    organizador: organizadorTeatro,
    multimedia: ["https://images.unsplash.com/photo-1507676184212-d03ab07a01bf"],
    tiposEntrada: [
      {
        id: "tipo_teatro_1",
        nombre: "Platea Baja",
        descripcion: "Ubicación preferencial central",
        precio: 18000,
        cupo: 150,
        cupoDisponible: 148,
      },
      {
        id: "tipo_teatro_2",
        nombre: "Pullman",
        descripcion: "Vista panorámica superior",
        precio: 12000,
        cupo: 200,
        cupoDisponible: 200,
      },
    ],
  });

  const eventoPasado = await eventoRepository.save({
    id: "evt_divididos",
    nombre: "Divididos en Vivo - Obras Sanitarias",
    descripcion: "La aplanadora del rock en el mítico estadio porteño.",
    categoria: catRecitales,
    fecha: fechaPasada,
    organizador: organizadorRock,
    multimedia: ["https://images.unsplash.com/photo-1459749411175-04bf5292ceea"],
    tiposEntrada: [
      {
        id: "tipo_divididos_1",
        nombre: "General",
        descripcion: "Campo",
        precio: 20000,
        cupo: 300,
        cupoDisponible: 0,
      },
    ],
  });

  const eventoLolla = await eventoRepository.save({
    id: "evt_lolla",
    nombre: "Festival Lollapalooza 2027",
    descripcion: "Tres días de música internacional, gastronomía y arte al aire libre.",
    categoria: catFestivales,
    fecha: fechaFutura3,
    organizador: organizadorRock,
    multimedia: ["https://images.unsplash.com/photo-1470225620780-dba8ba36b745"],
    tiposEntrada: [
      {
        id: "tipo_lolla_1",
        nombre: "Abono General",
        precio: 80000,
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
    mensajes: [
      {
        id: "msg_seed_1",
        compraId: "cmp_confirmada_1",
        autorId: comprador1.id,
        texto: "¡Hola! ¿A qué hora abren las puertas?",
        fecha: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      },
      {
        id: "msg_seed_2",
        compraId: "cmp_confirmada_1",
        autorId: organizadorRock.id,
        texto: "Buenas tardes Lucas, abren a las 16:00 hs.",
        fecha: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
    ],
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
    mensajes: [],
  });

  const compraUtilizada = await compraRepository.save({
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
    mensajes: [],
  });

  // 5. Historial de cambios
  await cambioEstadoCompraRepository.save({
    compra: compraConfirmada,
    estado: "CONFIRMADA",
    quien: comprador1,
    fechaHora: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
  });

  await cambioEstadoCompraRepository.save({
    compra: compraUtilizada,
    estado: "UTILIZADA",
    quien: organizadorRock,
    fechaHora: new Date(fechaPasada),
  });

  // 6. Reseña
  await reseniaRepository.save({
    id: "res_1",
    comprador: comprador1,
    evento: eventoPasado,
    compra: compraUtilizada,
    detalle: "¡Increíble show y excelente organización del acceso!",
    puntuacion: 5,
    fecha: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
  });

  console.log(" Seed en memoria cargado exitosamente:");
  console.log("   - 5 Categorías");
  console.log("   - 3 Compradores y 2 Organizadores");
  console.log("   - 4 Eventos con tipos de entrada");
  console.log("   - 3 Compras con historial de estados y chat");
  console.log("   - 1 Reseña de 5 estrellas");
}
