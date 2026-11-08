import "dotenv/config";
import mongoose from "mongoose";
import slugify from "slugify";
import { MongoDBClient } from "./connection.js";
import { UsuarioModel } from "../mongoschemas/UsuarioModel.js";
import { CategoriaModel } from "../mongoschemas/CategoriaModel.js";
import { EventoModel } from "../mongoschemas/EventoModel.js";
import { CompraModel } from "../mongoschemas/CompraModel.js";
import { CambioEstadoCompraModel } from "../mongoschemas/CambioEstadoCompraModel.js";
import { ReseniaModel } from "../mongoschemas/ReseniaModel.js";

const codigo = (titulo) => slugify(titulo, { lower: true, replacement: "_" });

export async function seed() {
  await MongoDBClient.connect();

  // Limpiar colecciones anteriores
  await Promise.all(
    [
      UsuarioModel,
      CategoriaModel,
      EventoModel,
      CompraModel,
      CambioEstadoCompraModel,
      ReseniaModel,
    ].map((m) => m.deleteMany({}))
  );

  // 1. Categorías
  const categoriasRaw = [
    ["Recitales y Conciertos", "Música en vivo de todos los géneros"],
    ["Obras de Teatro", "Dramas, comedias y espectáculos teatrales"],
    ["Festivales", "Grandes encuentros artísticos y musicales"],
    ["Deportes", "Partidos y competencias en vivo"],
    ["Conferencias", "Charlas, tecnología y networking"],
  ];

  const categorias = await CategoriaModel.insertMany(
    categoriasRaw.map(([nombre, descripcion]) => ({
      nombre,
      codigo: codigo(nombre),
      descripcion,
    }))
  );

  const catMap = Object.fromEntries(categorias.map((c) => [c.codigo, c._id]));

  // 2. Usuarios (Compradores y Organizadores)
  const [comprador1, comprador2, comprador3, organizadorRock, organizadorTeatro] =
    await UsuarioModel.insertMany([
      {
        nombre: "Lucas",
        apellido: "García",
        email: "lucas.garcia@example.com",
        rol: "COMPRADOR",
      },
      {
        nombre: "Mariana",
        apellido: "López",
        email: "mariana.lopez@example.com",
        rol: "COMPRADOR",
      },
      {
        nombre: "Sofía",
        apellido: "Martínez",
        email: "sofia.martinez@example.com",
        rol: "COMPRADOR",
      },
      {
        nombre: "Productora",
        apellido: "Rock Nacional",
        email: "contacto@rocknacional.com",
        rol: "ORGANIZADOR",
      },
      {
        nombre: "Teatro",
        apellido: "Gran Rex Producciones",
        email: "produccion@granrex.com",
        rol: "ORGANIZADOR",
      },
    ]);

  // 3. Eventos
  const fechaFutura1 = new Date(Date.now() + 1000 * 60 * 60 * 24 * 15); // en 15 días
  const fechaFutura2 = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // en 30 días
  const fechaPasada = new Date(Date.now() - 1000 * 60 * 60 * 24 * 5); // hace 5 días

  const [eventoRock, eventoTeatro, eventoPasado] = await EventoModel.insertMany([
    {
      nombre: "Cosquín Rock 2027",
      descripcion: "El festival de rock más grande del país con bandas consagradas y nuevas tendencias.",
      categoria: catMap["festivales"],
      fecha: fechaFutura1,
      organizador: organizadorRock._id,
      multimedia: [
        "https://images.unsplash.com/photo-1470225620780-dba8ba36b745",
        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a",
      ],
      tiposEntrada: [
        {
          nombre: "Campo General",
          descripcion: "Acceso a todos los escenarios principales de pie",
          precio: 25000,
          cupo: 500,
          cupoDisponible: 498,
        },
        {
          nombre: "Fanatic VIP",
          descripcion: "Sector exclusivo con vista preferencial y barra libre",
          precio: 65000,
          cupo: 100,
          cupoDisponible: 100,
        },
      ],
    },
    {
      nombre: "Esperando la Carroza - Versión Teatral",
      descripcion: "El clásico rioplatense vuelve a los escenarios con elenco estelar.",
      categoria: catMap["obras_de_teatro"],
      fecha: fechaFutura2,
      organizador: organizadorTeatro._id,
      multimedia: ["https://images.unsplash.com/photo-1507676184212-d03ab07a01bf"],
      tiposEntrada: [
        {
          nombre: "Platea Baja",
          descripcion: "Ubicación preferencial central",
          precio: 18000,
          cupo: 150,
          cupoDisponible: 148,
        },
        {
          nombre: "Pullman",
          descripcion: "Vista panorámica superior",
          precio: 12000,
          cupo: 200,
          cupoDisponible: 200,
        },
      ],
    },
    {
      nombre: "Divididos en Vivo - Obras Sanitarias",
      descripcion: "La aplanadora del rock en el mítico estadio porteño.",
      categoria: catMap["recitales_y_conciertos"],
      fecha: fechaPasada,
      organizador: organizadorRock._id,
      multimedia: ["https://images.unsplash.com/photo-1459749411175-04bf5292ceea"],
      tiposEntrada: [
        {
          nombre: "General",
          descripcion: "Campo",
          precio: 20000,
          cupo: 300,
          cupoDisponible: 0,
        },
      ],
    },
  ]);

  // Actualizar favoritos de Lucas
  comprador1.favoritos.push(eventoRock._id);
  await comprador1.save();

  // 4. Compras de ejemplo en distintos estados
  const entradaGeneralRock = eventoRock.tiposEntrada[0];
  const entradaPlateaTeatro = eventoTeatro.tiposEntrada[0];
  const entradaPasada = eventoPasado.tiposEntrada[0];

  const [compraConfirmada, compraPendiente, compraUtilizada] = await CompraModel.insertMany([
    {
      comprador: comprador1._id,
      evento: eventoRock._id,
      tipoEntrada: {
        tipoEntradaId: entradaGeneralRock._id,
        nombre: entradaGeneralRock.nombre,
        precio: entradaGeneralRock.precio,
      },
      cantidad: 2,
      total: entradaGeneralRock.precio * 2,
      estado: "CONFIRMADA",
      mensajes: [
        {
          usuario: comprador1._id,
          mensaje: "¡Hola! ¿A qué hora abren las puertas?",
          enviado: new Date(Date.now() - 1000 * 60 * 60 * 2),
        },
        {
          usuario: organizadorRock._id,
          mensaje: "Buenas tardes Lucas, abren a las 16:00 hs.",
          enviado: new Date(Date.now() - 1000 * 60 * 45),
        },
      ],
    },
    {
      comprador: comprador2._id,
      evento: eventoTeatro._id,
      tipoEntrada: {
        tipoEntradaId: entradaPlateaTeatro._id,
        nombre: entradaPlateaTeatro.nombre,
        precio: entradaPlateaTeatro.precio,
      },
      cantidad: 2,
      total: entradaPlateaTeatro.precio * 2,
      estado: "PENDIENTE",
      mensajes: [],
    },
    {
      comprador: comprador1._id,
      evento: eventoPasado._id,
      tipoEntrada: {
        tipoEntradaId: entradaPasada._id,
        nombre: entradaPasada.nombre,
        precio: entradaPasada.precio,
      },
      cantidad: 1,
      total: entradaPasada.precio,
      estado: "UTILIZADA",
      mensajes: [],
    },
  ]);

  // 5. Historial de Cambios de Estado
  await CambioEstadoCompraModel.insertMany([
    {
      compra: compraConfirmada._id,
      estado: "PENDIENTE",
      quien: comprador1._id,
      fechaHora: new Date(Date.now() - 1000 * 60 * 60 * 3),
    },
    {
      compra: compraConfirmada._id,
      estado: "CONFIRMADA",
      quien: comprador1._id,
      fechaHora: new Date(Date.now() - 1000 * 60 * 60 * 2.5),
    },
    {
      compra: compraUtilizada._id,
      estado: "UTILIZADA",
      quien: organizadorRock._id,
      fechaHora: fechaPasada,
    },
  ]);

  // 6. Reseña de la compra utilizada
  await ReseniaModel.create({
    comprador: comprador1._id,
    evento: eventoPasado._id,
    compra: compraUtilizada._id,
    detalle: "¡Increíble show y excelente organización del acceso!",
    puntuacion: 5,
    fecha: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
  });

  console.log(" Seed de AI Ticket It completado exitosamente:");
  console.log(`  - ${categorias.length} Categorías`);
  console.log(`  - 3 Compradores y 2 Organizadores`);
  console.log(`  - 3 Eventos con tipos de entrada`);
  console.log(`  - 3 Compras (CONFIRMADA con chat, PENDIENTE, UTILIZADA)`);
  console.log(`  - 1 Reseña cargada`);
}

// Ejecutar si se llama directamente con node
if (process.argv[1]?.endsWith("seed.js")) {
  seed()
    .catch((e) => {
      console.error("Error en el seed:", e);
      process.exitCode = 1;
    })
    .finally(() => MongoDBClient.disconnect());
}
