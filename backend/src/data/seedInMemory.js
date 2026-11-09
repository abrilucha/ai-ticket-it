import slugify from "slugify";
import { usuarioRepository } from "../repositories/UsuarioRepository.js";
import { sesionRepository } from "../repositories/SesionRepository.js";
import { categoriaRepository } from "../repositories/CategoriaRepository.js";
import { eventoRepository } from "../repositories/EventoRepository.js";
import { compraRepository } from "../repositories/CompraRepository.js";
import { resenaRepository } from "../repositories/ResenaRepository.js";
import { cambioEstadoCompraRepository } from "../repositories/CambioEstadoCompraRepository.js";
import { mensajeRepository } from "../repositories/MensajeRepository.js";
import { authService } from "../services/AuthService.js";

/**
 * Contraseña común para todas las cuentas del seed inicial.
 * Solo para propósitos de demostración y pruebas automáticas.
 */
export const DEMO_PASSWORD = "Demo1234";

const codigo = (titulo) => slugify(titulo, { lower: true, replacement: "_" });

export async function inicializarSeedInMemory() {
  await Promise.all([
    usuarioRepository.clear(),
    sesionRepository.clear(),
    categoriaRepository.clear(),
    eventoRepository.clear(),
    compraRepository.clear(),
    resenaRepository.clear(),
    cambioEstadoCompraRepository.clear(),
    mensajeRepository.clear(),
  ]);

  const passwordHash = await authService.hashPassword(DEMO_PASSWORD);

  // 1. Categorías canónicas (5)
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

  // 2. Usuarios: 3 Compradores y 3 Organizadores
  const comprador1 = await usuarioRepository.save({
    id: "usr_comprador_1",
    nombre: "Lucas",
    apellido: "García",
    email: "lucas.garcia@gmail.com",
    rol: "COMPRADOR",
    passwordHash,
  });

  const comprador2 = await usuarioRepository.save({
    id: "usr_comprador_2",
    nombre: "Mariana",
    apellido: "López",
    email: "mariana.lopez@hotmail.com",
    rol: "COMPRADOR",
    passwordHash,
  });

  await usuarioRepository.save({
    id: "usr_comprador_3",
    nombre: "Sofía",
    apellido: "Martínez",
    email: "sofia.martinez@yahoo.com",
    rol: "COMPRADOR",
    passwordHash,
  });

  // Organizador A: con eventos pasados y reseñas (promedio 4.0)
  const organizadorRock = await usuarioRepository.save({
    id: "usr_org_rock",
    nombre: "Productora Rock Nacional",
    apellido: "Eventos",
    email: "contacto@rocknacional.com.ar",
    rol: "ORGANIZADOR",
    passwordHash,
  });

  // Organizador B: con eventos futuros, SIN reseñas (puntaje null / 0 reseñas)
  const organizadorTeatro = await usuarioRepository.save({
    id: "usr_org_teatro",
    nombre: "Teatro Gran Rex",
    apellido: "Administración",
    email: "entradas@granrex.com.ar",
    rol: "ORGANIZADOR",
    passwordHash,
  });

  // Organizador C: con eventos futuros y compras
  const organizadorDeportes = await usuarioRepository.save({
    id: "usr_org_deportes",
    nombre: "Asociación Deportes y Espectáculos",
    apellido: "Producciones",
    email: "produccion@deportesba.com.ar",
    rol: "ORGANIZADOR",
    passwordHash,
  });

  // 3. Eventos: 6 futuros escalonados (+15d, +30d, +45d, +60d, +90d, +120d) + 1 pasado (-5d)
  const ahora = Date.now();
  const diaMs = 1000 * 60 * 60 * 24;

  const fechaFutura15d = new Date(ahora + diaMs * 15).toISOString();
  const fechaFutura30d = new Date(ahora + diaMs * 30).toISOString();
  const fechaFutura45d = new Date(ahora + diaMs * 45).toISOString();
  const fechaFutura60d = new Date(ahora + diaMs * 60).toISOString();
  const fechaFutura90d = new Date(ahora + diaMs * 90).toISOString();
  const fechaFutura120d = new Date(ahora + diaMs * 120).toISOString();
  const fechaPasada5d = new Date(ahora - diaMs * 5).toISOString();

  // 1. Recitales (futuro)
  await eventoRepository.save({
    id: "evt_recital_charly",
    nombre: "Charly García Sinfónico",
    descripcion: "Homenaje sinfónico inolvidable a la obra cumbre de Charly García en el histórico estadio Luna Park.",
    categoria: catRecitales,
    fecha: fechaFutura15d,
    organizador: organizadorDeportes,
    multimedia: [
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819",
      "https://images.unsplash.com/photo-1465847899084-d164df4dedc6",
    ],
    tiposEntrada: [
      {
        id: "tipo_charly_platea",
        nombre: "Platea Preferencial",
        precio: 35000,
        cupo: 300,
        cupoDisponible: 300,
      },
      {
        id: "tipo_charly_popular",
        nombre: "Cabecera",
        precio: 18000,
        cupo: 500,
        cupoDisponible: 500,
      },
    ],
  });

  // 2. Festivales (futuro 1)
  const eventoRock = await eventoRepository.save({
    id: "evt_cosquin",
    nombre: "Cosquín Rock 2027",
    descripcion: "El festival de rock más grande del país con más de 100 bandas en escena en el Aeródromo de Santa María de Punilla.",
    categoria: catFestivales,
    fecha: fechaFutura30d,
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

  // 3. Teatro (futuro) - Organizador B (sin reseñas)
  const eventoTeatro = await eventoRepository.save({
    id: "evt_teatro",
    nombre: "Toc Toc en Calle Corrientes",
    descripcion: "La comedia más exitosa de la cartelera teatral argentina sobre seis personajes con trastornos obsesivos compulsivos.",
    categoria: catTeatro,
    fecha: fechaFutura45d,
    organizador: organizadorTeatro,
    multimedia: [
      "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf",
      "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212",
    ],
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

  // 4. Deportes (futuro)
  await eventoRepository.save({
    id: "evt_superclasico",
    nombre: "Superclásico de Verano",
    descripcion: "El apasionante clásico del fútbol argentino en una noche única con ambas parcialidades.",
    categoria: catDeportes,
    fecha: fechaFutura60d,
    organizador: organizadorDeportes,
    multimedia: [
      "https://images.unsplash.com/photo-1508098682722-e99c43a406b2",
      "https://images.unsplash.com/photo-1522778119026-d647f0596c20",
    ],
    tiposEntrada: [
      {
        id: "tipo_dep_platea",
        nombre: "Platea Techada",
        precio: 40000,
        cupo: 400,
        cupoDisponible: 400,
      },
      {
        id: "tipo_dep_popular",
        nombre: "Tribuna Popular",
        precio: 15000,
        cupo: 800,
        cupoDisponible: 800,
      },
    ],
  });

  // 5. Conferencias (futuro)
  await eventoRepository.save({
    id: "evt_conferencia_tech",
    nombre: "Argentina Tech Summit 2027",
    descripcion: "El congreso de tecnología e inteligencia artificial más destacado de la región con speakers internacionales.",
    categoria: catConferencias,
    fecha: fechaFutura90d,
    organizador: organizadorRock,
    multimedia: [
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87",
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b",
    ],
    tiposEntrada: [
      {
        id: "tipo_conf_pase",
        nombre: "Pase Full Day",
        precio: 30000,
        cupo: 250,
        cupoDisponible: 250,
      },
      {
        id: "tipo_conf_workshop",
        nombre: "Pase + Workshops",
        precio: 55000,
        cupo: 80,
        cupoDisponible: 80,
      },
    ],
  });

  // 6. Festivales (futuro 2 - categoría con 2 eventos futuros)
  await eventoRepository.save({
    id: "evt_lollapalooza",
    nombre: "Lollapalooza Argentina 2027",
    descripcion: "Tres días de música internacional, arte y gastronomía en el Hipódromo de San Isidro.",
    categoria: catFestivales,
    fecha: fechaFutura120d,
    organizador: organizadorDeportes,
    multimedia: [
      "https://images.unsplash.com/photo-1459749411175-04bf5292ceea",
      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec",
    ],
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

  // 7. Recitales (pasado -5d) para probar cancelación bloqueada y reseñas
  const eventoPasado = await eventoRepository.save({
    id: "evt_divididos",
    nombre: "Divididos en vivo",
    descripcion: "La aplanadora del rock festejó sus 35 años de trayectoria con un show demoledor.",
    categoria: catRecitales,
    fecha: fechaPasada5d,
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

  // 4. Compras de ejemplo
  // Compra 1: CONFIRMADA (Comprador 1 en Cosquín Rock)
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

  // Chat bidireccional de prueba en la compra confirmada
  await mensajeRepository.save({
    id: "msg_seed_1",
    compraId: "cmp_confirmada_1",
    autorId: comprador1.id,
    texto: "¡Hola! ¿A qué hora abren las puertas?",
    fecha: new Date(ahora - 1000 * 60 * 60 * 2).toISOString(),
  });

  await mensajeRepository.save({
    id: "msg_seed_2",
    compraId: "cmp_confirmada_1",
    autorId: organizadorRock.id,
    texto: "Buenas tardes Lucas, abren a las 16:00 hs puntual.",
    fecha: new Date(ahora - 1000 * 60 * 45).toISOString(),
  });

  // Compra 2: PENDIENTE (Comprador 2 en Teatro)
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

  // Compra 3: UTILIZADA con reseña previa (Comprador 1 en Divididos)
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

  // Compra 4: UTILIZADA con reseña previa (Comprador 2 en Divididos)
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

  // Compra 5: UTILIZADA SIN reseña (Comprador 1 en Divididos, lista para calificar)
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

  // 5. Historial de estados
  await cambioEstadoCompraRepository.save({
    compraId: compraConfirmada.id,
    estadoAnterior: "PENDIENTE",
    estadoNuevo: "CONFIRMADA",
    fecha: new Date(ahora - 1000 * 60 * 60 * 2.5).toISOString(),
    motivo: "Pago confirmado exitosamente",
  });

  await cambioEstadoCompraRepository.save({
    compraId: compraUtilizada1.id,
    estadoAnterior: "CONFIRMADA",
    estadoNuevo: "UTILIZADA",
    fecha: fechaPasada5d,
    motivo: "Entrada utilizada en el evento",
  });

  await cambioEstadoCompraRepository.save({
    compraId: compraUtilizada2.id,
    estadoAnterior: "CONFIRMADA",
    estadoNuevo: "UTILIZADA",
    fecha: fechaPasada5d,
    motivo: "Entrada utilizada en el evento",
  });

  // 6. Reseñas iniciales
  // Reseña 1: puntaje 5 (Comprador 1)
  await resenaRepository.save({
    id: "res_1",
    compraId: "cmp_utilizada_1",
    puntaje: 5,
    comentario: "¡Increíble show y excelente organización del acceso!",
    fecha: new Date(ahora - diaMs * 4).toISOString(),
  });

  // Reseña 2: puntaje 3 (Comprador 2) -> promedio Productora Rock = (5 + 3)/2 = 4.0
  await resenaRepository.save({
    id: "res_2",
    compraId: "cmp_utilizada_2",
    puntaje: 3,
    comentario: "El sonido en el campo trasero estuvo regular, pero buena onda.",
    fecha: new Date(ahora - diaMs * 3).toISOString(),
  });

  console.log(" Seed en memoria cargado exitosamente:");
  console.log("   - 5 Categorías canónicas");
  console.log("   - 3 Compradores y 3 Organizadores");
  console.log("   - 6 Eventos futuros (en las 5 categorías, Festivales con 2) + 1 evento pasado");
  console.log("   - 5 Compras de prueba en estados PENDIENTE, CONFIRMADA y UTILIZADA");
  console.log("   - 2 Mensajes de chat en compra confirmada");
  console.log("   - 2 Reseñas (promedio 4.0 para Productora Rock, null para Gran Rex)");
}
