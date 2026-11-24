import request from "supertest";
import app from "../src/app.js";
import { inicializarSeedInMemory } from "../src/data/seedInMemory.js";
import { compraRepository } from "../src/repositories/CompraRepository.js";
import { eventoRepository } from "../src/repositories/EventoRepository.js";
import { usuarioRepository } from "../src/repositories/UsuarioRepository.js";

describe("BLOQUE A: Regresión de Autenticación, Catálogo y Compras (Jest + Supertest)", () => {
  const COMPRADOR = "usr_comprador_1";
  const ORGANIZADOR = "usr_org_rock";

  beforeEach(async () => {
    await inicializarSeedInMemory();
  });

  test("A1. Rutas privadas sin header x-user-id deben responder 401 Unauthorized", async () => {
    const rutasSinAuth = [
      { method: "get", path: "/compras/mias" },
      { method: "post", path: "/compras", body: { eventoId: "evt_cosquin", tipoEntradaId: "tipo_rock_1", cantidad: 1 } },
      { method: "post", path: "/compras/cmp_confirmada_1/cancelaciones" },
      { method: "post", path: "/eventos", body: { nombre: "Test" } },
      { method: "get", path: "/eventos/mios" },
      { method: "get", path: "/eventos" },
      { method: "get", path: "/organizadores/usr_org_rock" },
    ];

    for (const r of rutasSinAuth) {
      const res = await request(app)[r.method](r.path).send(r.body || {});
      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("NO_AUTORIZADO");
    }

    // Rutas públicas exentas sí deben responder 200 sin x-user-id
    const resHealth = await request(app).get("/health");
    expect(resHealth.status).toBe(200);

    // GET /usuarios ya no existe (404 tanto con auth como sin ella o probado con usuario autenticado)
    const resUsuarios = await request(app).get("/usuarios").set("x-user-id", COMPRADOR);
    expect(resUsuarios.status).toBe(404);
  });

  test("A2. Los mensajes del chat NO deben filtrarse en /compras/:id, /compras/mias ni /eventos/:id/compras", async () => {
    // 1. GET /compras/:id
    const resCompra = await request(app)
      .get("/compras/cmp_confirmada_1")
      .set("x-user-id", COMPRADOR);
    expect(resCompra.status).toBe(200);
    expect(resCompra.body).not.toHaveProperty("mensajes");

    // 2. GET /compras/mias
    const resMias = await request(app)
      .get("/compras/mias")
      .set("x-user-id", COMPRADOR);
    expect(resMias.status).toBe(200);
    for (const compra of resMias.body) {
      expect(compra).not.toHaveProperty("mensajes");
    }

    // 3. GET /eventos/:id/compras
    const resEventosCompras = await request(app)
      .get("/eventos/evt_cosquin/compras")
      .set("x-user-id", ORGANIZADOR);
    expect(resEventosCompras.status).toBe(200);
    for (const compra of resEventosCompras.body.compras) {
      expect(compra).not.toHaveProperty("mensajes");
    }
  });

  test("A3. Body ausente o JSON malformado responde 400 Bad Request con formato { error: { code, message } }", async () => {
    // JSON malformado en POST /compras/:id/mensajes
    const resMalformadoMensaje = await request(app)
      .post("/compras/cmp_confirmada_1/mensajes")
      .set("x-user-id", COMPRADOR)
      .set("Content-Type", "application/json")
      .send('{"texto": "incompleto');

    expect(resMalformadoMensaje.status).toBe(400);
    expect(resMalformadoMensaje.body).toHaveProperty("error");
    expect(resMalformadoMensaje.body.error.code).toBe("JSON_MALFORMADO");

    // Body vacío en POST /eventos
    const resVacioEvento = await request(app)
      .post("/eventos")
      .set("x-user-id", ORGANIZADOR)
      .set("Content-Type", "application/json")
      .send({});

    expect(resVacioEvento.status).toBe(400);
    expect(resVacioEvento.body).toHaveProperty("error");
  });

  test("A4. Catálogo: búsqueda insensible a tildes, caracteres especiales en q, filtros y ordenamiento", async () => {
    // 1. Insensible a tildes: "cosquin" encuentra "Cosquín Rock 2027"
    const resTilde = await request(app)
      .get("/eventos?q=cosquin")
      .set("x-user-id", COMPRADOR);
    expect(resTilde.status).toBe(200);
    expect(resTilde.body.some((e) => e.nombre.includes("Cosquín"))).toBe(true);

    // 2. Caracteres especiales de regex no deben romper (nunca 500)
    const resRegex = await request(app)
      .get("/eventos?q=[(*+?^$")
      .set("x-user-id", COMPRADOR);
    expect(resRegex.status).toBe(200);

    // 3. Parámetro orden o direccion inválidos responden 400
    const resOrdenInvalido = await request(app)
      .get("/eventos?orden=invalido")
      .set("x-user-id", COMPRADOR);
    expect(resOrdenInvalido.status).toBe(400);

    const resDirInvalida = await request(app)
      .get("/eventos?direccion=diagonal")
      .set("x-user-id", COMPRADOR);
    expect(resDirInvalida.status).toBe(400);

    // 4. GET /eventos/:id con id inexistente o raro da 404 (nunca 500)
    const res404 = await request(app)
      .get("/eventos/id_totalmente_inexistente_9999")
      .set("x-user-id", COMPRADOR);
    expect(res404.status).toBe(404);
  });

  test("A5.1. POST /eventos: validaciones de fecha pasada, tipos de entrada vacíos, duplicados y rol", async () => {
    // Fecha pasada -> 400
    const resPasada = await request(app)
      .post("/eventos")
      .set("x-user-id", ORGANIZADOR)
      .send({
        nombre: "Evento Pasado Test",
        descripcion: "Descripción válida para el evento",
        categoria: "cat_recitales",
        fecha: "2020-01-01T00:00:00.000Z",
        tiposEntrada: [{ nombre: "General", precio: 1000, cupo: 100 }],
      });
    expect(resPasada.status).toBe(400);

    // Sin tipos de entrada -> 400
    const resSinTipos = await request(app)
      .post("/eventos")
      .set("x-user-id", ORGANIZADOR)
      .send({
        nombre: "Evento Sin Entradas",
        descripcion: "Descripción válida",
        categoria: "cat_recitales",
        fecha: "2028-01-01T00:00:00.000Z",
        tiposEntrada: [],
      });
    expect(resSinTipos.status).toBe(400);

    // Tipo de entrada con nombre duplicado -> 400
    const resDuplicados = await request(app)
      .post("/eventos")
      .set("x-user-id", ORGANIZADOR)
      .send({
        nombre: "Evento Con Tipos Duplicados",
        descripcion: "Descripción válida para el evento",
        categoria: "cat_recitales",
        fecha: "2028-01-01T00:00:00.000Z",
        tiposEntrada: [
          { nombre: "Campo General", precio: 1000, cupo: 100 },
          { nombre: "campo general", precio: 2000, cupo: 50 },
        ],
      });
    expect(resDuplicados.status).toBe(400);

    // Comprador intenta crear evento -> 403 Forbidden
    const resRolInvalido = await request(app)
      .post("/eventos")
      .set("x-user-id", COMPRADOR)
      .send({
        nombre: "Evento Comprador Intenta Crear",
        descripcion: "Descripción válida",
        categoria: "cat_recitales",
        fecha: "2028-01-01T00:00:00.000Z",
        tiposEntrada: [{ nombre: "General", precio: 1000, cupo: 100 }],
      });
    expect(resRolInvalido.status).toBe(403);
  });

  test("A5.4. POST /compras: cantidad mayor al cupo (409), cantidad 0 o no entera (400), evento realizado (409)", async () => {
    // Cantidad mayor al cupo -> 409 Conflict
    const resExceso = await request(app)
      .post("/compras")
      .set("x-user-id", COMPRADOR)
      .send({ eventoId: "evt_cosquin", tipoEntradaId: "tipo_rock_1", cantidad: 999999 });
    expect(resExceso.status).toBe(409);

    // Cantidad 0 -> 400
    const resCero = await request(app)
      .post("/compras")
      .set("x-user-id", COMPRADOR)
      .send({ eventoId: "evt_cosquin", tipoEntradaId: "tipo_rock_1", cantidad: 0 });
    expect(resCero.status).toBe(400);

    // Cantidad no entera -> 400
    const resDecimal = await request(app)
      .post("/compras")
      .set("x-user-id", COMPRADOR)
      .send({ eventoId: "evt_cosquin", tipoEntradaId: "tipo_rock_1", cantidad: 1.5 });
    expect(resDecimal.status).toBe(400);

    // Evento realizado -> 409 Conflict
    const resRealizado = await request(app)
      .post("/compras")
      .set("x-user-id", COMPRADOR)
      .send({ eventoId: "evt_divididos", tipoEntradaId: "tipo_divididos_1", cantidad: 1 });
    expect(resRealizado.status).toBe(409);
  });

  test("A5.5. GET /compras/mias devuelve diasRestantes solo en CONFIRMADA y null en el resto", async () => {
    const res = await request(app)
      .get("/compras/mias")
      .set("x-user-id", COMPRADOR);

    expect(res.status).toBe(200);
    for (const compra of res.body) {
      if (compra.estado === "CONFIRMADA") {
        expect(compra.diasRestantes).not.toBeNull();
        expect(typeof compra.diasRestantes).toBe("number");
      } else {
        expect(compra.diasRestantes).toBeNull();
      }
    }
  });

  test("A5.6. GET /eventos/:id/compras devuelve disponibilidadPorTipo coherente con las compras", async () => {
    const res = await request(app)
      .get("/eventos/evt_cosquin/compras")
      .set("x-user-id", ORGANIZADOR);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("disponibilidadPorTipo");
    const campo = res.body.disponibilidadPorTipo.find((t) => t.tipoEntradaId === "tipo_rock_1");
    expect(campo).toBeDefined();
    expect(campo.cupoTotal).toBe(500);
    // En el seed hay una compra de 2 entradas confirmada
    expect(campo.cupoRestante).toBe(498);
  });
});
