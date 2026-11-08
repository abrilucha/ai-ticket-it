import request from "supertest";
import app from "../src/app.js";
import { inicializarSeedInMemory } from "../src/data/seedInMemory.js";
import { compraRepository } from "../src/repositories/CompraRepository.js";
import { eventoRepository } from "../src/repositories/EventoRepository.js";
import { usuarioRepository } from "../src/repositories/UsuarioRepository.js";
import { EstadoCompra } from "../src/domain/EstadoCompra.js";

describe("ETAPA 5: Comunicación (Chat de la compra) - Tests Automatizados", () => {
  const COMPRADOR_TITULAR = "usr_comprador_1";
  const ORGANIZADOR_DUEÑO = "usr_org_rock";
  const COMPRADOR_AJENO = "usr_comprador_2";
  const ORGANIZADOR_AJENO = "usr_org_teatro";

  beforeEach(async () => {
    await inicializarSeedInMemory();
  });

  test("1. Comprador envía un mensaje en su compra: 201 y aparece en el GET", async () => {
    const postRes = await request(app)
      .post("/compras/cmp_confirmada_1/mensajes")
      .set("x-user-id", COMPRADOR_TITULAR)
      .send({ texto: "¿A qué hora recomiendan llegar?" });

    expect(postRes.status).toBe(201);
    expect(postRes.body).toHaveProperty("id");
    expect(postRes.body.compraId).toBe("cmp_confirmada_1");
    expect(postRes.body.texto).toBe("¿A qué hora recomiendan llegar?");
    expect(postRes.body.autor.id).toBe(COMPRADOR_TITULAR);
    expect(postRes.body.autor.rol).toBe("COMPRADOR");
    expect(postRes.body.esPropio).toBe(true);

    const getRes = await request(app)
      .get("/compras/cmp_confirmada_1/mensajes")
      .set("x-user-id", COMPRADOR_TITULAR);

    expect(getRes.status).toBe(200);
    const mensajeEncontrado = getRes.body.find((m) => m.id === postRes.body.id);
    expect(mensajeEncontrado).toBeDefined();
    expect(mensajeEncontrado.texto).toBe("¿A qué hora recomiendan llegar?");
    expect(mensajeEncontrado.esPropio).toBe(true);
  });

  test("2. Organizador dueño del evento responde: 201; el GET devuelve mensajes ordenados con autor.rol y esPropio según quién consulta", async () => {
    // 1. Mensaje del comprador
    const postComprador = await request(app)
      .post("/compras/cmp_confirmada_1/mensajes")
      .set("x-user-id", COMPRADOR_TITULAR)
      .send({ texto: "Hola, ¿hay estacionamiento?" });
    expect(postComprador.status).toBe(201);

    // 2. Respuesta del organizador
    const postOrg = await request(app)
      .post("/compras/cmp_confirmada_1/mensajes")
      .set("x-user-id", ORGANIZADOR_DUEÑO)
      .send({ texto: "Hola Lucas, sí, contamos con estacionamiento tarifado." });
    expect(postOrg.status).toBe(201);
    expect(postOrg.body.autor.rol).toBe("ORGANIZADOR");
    expect(postOrg.body.esPropio).toBe(true);

    // Consulta el comprador
    const getComprador = await request(app)
      .get("/compras/cmp_confirmada_1/mensajes")
      .set("x-user-id", COMPRADOR_TITULAR);

    expect(getComprador.status).toBe(200);
    const msgCompradorVistoPorComprador = getComprador.body.find((m) => m.id === postComprador.body.id);
    const msgOrgVistoPorComprador = getComprador.body.find((m) => m.id === postOrg.body.id);
    expect(msgCompradorVistoPorComprador.esPropio).toBe(true);
    expect(msgCompradorVistoPorComprador.autor.rol).toBe("COMPRADOR");
    expect(msgOrgVistoPorComprador.esPropio).toBe(false);
    expect(msgOrgVistoPorComprador.autor.rol).toBe("ORGANIZADOR");

    // Consulta el organizador
    const getOrg = await request(app)
      .get("/compras/cmp_confirmada_1/mensajes")
      .set("x-user-id", ORGANIZADOR_DUEÑO);

    expect(getOrg.status).toBe(200);
    const msgCompradorVistoPorOrg = getOrg.body.find((m) => m.id === postComprador.body.id);
    const msgOrgVistoPorOrg = getOrg.body.find((m) => m.id === postOrg.body.id);
    expect(msgCompradorVistoPorOrg.esPropio).toBe(false);
    expect(msgOrgVistoPorOrg.esPropio).toBe(true);

    // Verificación de orden cronológico ascendente (más viejo primero)
    for (let i = 0; i < getOrg.body.length - 1; i++) {
      const fechaActual = new Date(getOrg.body[i].fecha).getTime();
      const fechaSiguiente = new Date(getOrg.body[i + 1].fecha).getTime();
      expect(fechaActual).toBeLessThanOrEqual(fechaSiguiente);
    }
  });

  test("3. Chat sobre una compra en CADA estado (PENDIENTE, CONFIRMADA, UTILIZADA, CANCELADA, REEMBOLSADA): se puede enviar y leer", async () => {
    const estados = [
      EstadoCompra.PENDIENTE,
      EstadoCompra.CONFIRMADA,
      EstadoCompra.UTILIZADA,
      EstadoCompra.CANCELADA,
      EstadoCompra.REEMBOLSADA,
    ];

    const comprador = await usuarioRepository.findById(COMPRADOR_TITULAR);
    const evento = await eventoRepository.findById("evt_cosquin");

    for (const estado of estados) {
      const compraId = `cmp_test_estado_${estado.toLowerCase()}`;
      await compraRepository.save({
        id: compraId,
        comprador,
        evento,
        tipoEntrada: { tipoEntradaId: "tipo_rock_1", nombre: "Campo General", precio: 25000 },
        cantidad: 1,
        total: 25000,
        estado: estado,
        mensajes: [],
      });

      // 1. Enviar como comprador
      const resPost = await request(app)
        .post(`/compras/${compraId}/mensajes`)
        .set("x-user-id", COMPRADOR_TITULAR)
        .send({ texto: `Mensaje en estado ${estado}` });
      expect(resPost.status).toBe(201);
      expect(resPost.body.texto).toBe(`Mensaje en estado ${estado}`);

      // 2. Responder como organizador
      const resPostOrg = await request(app)
        .post(`/compras/${compraId}/mensajes`)
        .set("x-user-id", ORGANIZADOR_DUEÑO)
        .send({ texto: `Respuesta de organizador en estado ${estado}` });
      expect(resPostOrg.status).toBe(201);

      // 3. Leer mensajes
      const resGet = await request(app)
        .get(`/compras/${compraId}/mensajes`)
        .set("x-user-id", COMPRADOR_TITULAR);
      expect(resGet.status).toBe(200);
      expect(resGet.body.length).toBe(2);
    }
  });

  test("4. Comprador ajeno intenta leer y enviar: 403 Forbidden en ambos", async () => {
    const postRes = await request(app)
      .post("/compras/cmp_confirmada_1/mensajes")
      .set("x-user-id", COMPRADOR_AJENO)
      .send({ texto: "Intento escribir en compra de otro" });
    expect(postRes.status).toBe(403);

    const getRes = await request(app)
      .get("/compras/cmp_confirmada_1/mensajes")
      .set("x-user-id", COMPRADOR_AJENO);
    expect(getRes.status).toBe(403);
  });

  test("5. Organizador de OTRO evento intenta leer y enviar: 403 Forbidden en ambos", async () => {
    const postRes = await request(app)
      .post("/compras/cmp_confirmada_1/mensajes")
      .set("x-user-id", ORGANIZADOR_AJENO)
      .send({ texto: "Intento escribir siendo organizador ajeno" });
    expect(postRes.status).toBe(403);

    const getRes = await request(app)
      .get("/compras/cmp_confirmada_1/mensajes")
      .set("x-user-id", ORGANIZADOR_AJENO);
    expect(getRes.status).toBe(403);
  });

  test("6. Compra inexistente: 404 Not Found", async () => {
    const postRes = await request(app)
      .post("/compras/cmp_inexistente_9999/mensajes")
      .set("x-user-id", COMPRADOR_TITULAR)
      .send({ texto: "Mensaje a compra fantasma" });
    expect(postRes.status).toBe(404);

    const getRes = await request(app)
      .get("/compras/cmp_inexistente_9999/mensajes")
      .set("x-user-id", COMPRADOR_TITULAR);
    expect(getRes.status).toBe(404);
  });

  test("7. Texto vacío, solo espacios, no-string y de más de 1000 caracteres: 400 Bad Request", async () => {
    // Vacío
    const resVacio = await request(app)
      .post("/compras/cmp_confirmada_1/mensajes")
      .set("x-user-id", COMPRADOR_TITULAR)
      .send({ texto: "" });
    expect(resVacio.status).toBe(400);

    // Solo espacios
    const resEspacios = await request(app)
      .post("/compras/cmp_confirmada_1/mensajes")
      .set("x-user-id", COMPRADOR_TITULAR)
      .send({ texto: "      " });
    expect(resEspacios.status).toBe(400);

    // No string (número u objeto)
    const resNumero = await request(app)
      .post("/compras/cmp_confirmada_1/mensajes")
      .set("x-user-id", COMPRADOR_TITULAR)
      .send({ texto: 12345 });
    expect(resNumero.status).toBe(400);

    // Más de 1000 caracteres
    const resLargo = await request(app)
      .post("/compras/cmp_confirmada_1/mensajes")
      .set("x-user-id", COMPRADOR_TITULAR)
      .send({ texto: "a".repeat(1001) });
    expect(resLargo.status).toBe(400);
  });

  test("8. Body con autorId falso: se ignora y el autor es el usuario autenticado", async () => {
    const res = await request(app)
      .post("/compras/cmp_confirmada_1/mensajes")
      .set("x-user-id", COMPRADOR_TITULAR)
      .send({
        texto: "Mensaje genuino pero inyectando autorId malicioso",
        autorId: "usr_hacker_impostor",
        id: "msg_falso_fijo",
        fecha: "1999-01-01T00:00:00.000Z",
      });

    expect(res.status).toBe(201);
    expect(res.body.autor.id).toBe(COMPRADOR_TITULAR);
    expect(res.body.autor.rol).toBe("COMPRADOR");
    expect(res.body.id).not.toBe("msg_falso_fijo");
    expect(new Date(res.body.fecha).getFullYear()).toBeGreaterThan(2020);
  });

  test("9. 'desde' con fecha válida filtra correctamente; 'desde' inválido da 400", async () => {
    // En el seed hay dos mensajes: hace 2 horas y hace 45 minutos.
    const puntoMedio = new Date(Date.now() - 1000 * 60 * 50).toISOString();

    const resFiltro = await request(app)
      .get(`/compras/cmp_confirmada_1/mensajes?desde=${encodeURIComponent(puntoMedio)}`)
      .set("x-user-id", COMPRADOR_TITULAR);

    expect(resFiltro.status).toBe(200);
    // Solo el segundo mensaje (hace 45 min) es posterior al punto medio
    expect(resFiltro.body.length).toBe(1);
    expect(resFiltro.body[0].texto).toContain("Buenas tardes Lucas");

    // Fecha inválida
    const resInvalido = await request(app)
      .get("/compras/cmp_confirmada_1/mensajes?desde=fecha-totalmente-invalida")
      .set("x-user-id", COMPRADOR_TITULAR);

    expect(resInvalido.status).toBe(400);
  });

  test("10. Compra sin mensajes: 200 con lista vacía", async () => {
    const comprador = await usuarioRepository.findById(COMPRADOR_TITULAR);
    const evento = await eventoRepository.findById("evt_cosquin");

    await compraRepository.save({
      id: "cmp_vacia_test",
      comprador,
      evento,
      tipoEntrada: { tipoEntradaId: "tipo_rock_1", nombre: "General", precio: 25000 },
      cantidad: 1,
      total: 25000,
      estado: EstadoCompra.CONFIRMADA,
      mensajes: [],
    });

    const res = await request(app)
      .get("/compras/cmp_vacia_test/mensajes")
      .set("x-user-id", COMPRADOR_TITULAR);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  test("11. Sin x-user-id: 401 Unauthorized", async () => {
    const resGet = await request(app).get("/compras/cmp_confirmada_1/mensajes");
    expect(resGet.status).toBe(401);

    const resPost = await request(app)
      .post("/compras/cmp_confirmada_1/mensajes")
      .send({ texto: "Hola sin auth" });
    expect(resPost.status).toBe(401);

    const resUserFantasma = await request(app)
      .get("/compras/cmp_confirmada_1/mensajes")
      .set("x-user-id", "usuario_inexistente_en_memoria");
    expect(resUserFantasma.status).toBe(401);
  });
});
