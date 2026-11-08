import request from "supertest";
import app from "../src/app.js";
import { inicializarSeedInMemory } from "../src/data/seedInMemory.js";
import { compraRepository } from "../src/repositories/CompraRepository.js";
import { eventoRepository } from "../src/repositories/EventoRepository.js";
import { usuarioRepository } from "../src/repositories/UsuarioRepository.js";
import { EstadoCompra } from "../src/domain/EstadoCompra.js";

describe("BLOQUE B: Reseñas y Reputación de Organizadores (Jest + Supertest)", () => {
  const COMPRADOR_TITULAR = "usr_comprador_1";
  const COMPRADOR_AJENO = "usr_comprador_2";
  const ORGANIZADOR_DUEÑO = "usr_org_rock";
  const ORGANIZADOR_AJENO = "usr_org_teatro";

  beforeEach(async () => {
    await inicializarSeedInMemory();
  });

  test("1. Reseñar una compra UTILIZADA: 201 y GET /compras/:id/resena la devuelve", async () => {
    // 'cmp_utilizada_sin_resena' es del comprador 1 y está UTILIZADA
    const resPost = await request(app)
      .post("/compras/cmp_utilizada_sin_resena/resena")
      .set("x-user-id", COMPRADOR_TITULAR)
      .send({
        puntaje: 5,
        comentario: "Excelente organización y puntualidad en el acceso al recital.",
      });

    expect(resPost.status).toBe(201);
    expect(resPost.body).toHaveProperty("id");
    expect(resPost.body.compraId).toBe("cmp_utilizada_sin_resena");
    expect(resPost.body.puntaje).toBe(5);
    expect(resPost.body.comentario).toBe("Excelente organización y puntualidad en el acceso al recital.");
    expect(resPost.body.evento).toBeDefined();
    expect(resPost.body.autor.id).toBe(COMPRADOR_TITULAR);

    // GET /compras/:id/resena
    const resGet = await request(app)
      .get("/compras/cmp_utilizada_sin_resena/resena")
      .set("x-user-id", COMPRADOR_TITULAR);

    expect(resGet.status).toBe(200);
    expect(resGet.body.id).toBe(resPost.body.id);
    expect(resGet.body.puntaje).toBe(5);
  });

  test("2. Reseñar compra PENDIENTE, CONFIRMADA, CANCELADA y REEMBOLSADA: 409 Conflict en cada una", async () => {
    const comprador = await usuarioRepository.findById(COMPRADOR_TITULAR);
    const evento = await eventoRepository.findById("evt_cosquin");

    const estadosInvalidos = [
      EstadoCompra.PENDIENTE,
      EstadoCompra.CONFIRMADA,
      EstadoCompra.CANCELADA,
      EstadoCompra.REEMBOLSADA,
    ];

    for (const estado of estadosInvalidos) {
      const idCompra = `cmp_test_invalida_${estado.toLowerCase()}`;
      await compraRepository.save({
        id: idCompra,
        comprador,
        evento,
        tipoEntrada: { tipoEntradaId: "tipo_rock_1", nombre: "General", precio: 25000 },
        cantidad: 1,
        total: 25000,
        estado: estado,
      });

      const res = await request(app)
        .post(`/compras/${idCompra}/resena`)
        .set("x-user-id", COMPRADOR_TITULAR)
        .send({ puntaje: 4, comentario: "Intento calificar en estado no permitido" });

      expect(res.status).toBe(409);
      expect(res.body.message).toMatch(/utilizada/i);
    }
  });

  test("3. Segunda reseña sobre la misma compra: 409 Conflict", async () => {
    // 'cmp_utilizada_1' ya tiene la reseña 'res_1' en el seed
    const res = await request(app)
      .post("/compras/cmp_utilizada_1/resena")
      .set("x-user-id", COMPRADOR_TITULAR)
      .send({ puntaje: 4, comentario: "Intento dejar segunda reseña" });

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/ya cuenta con una reseña/i);
  });

  test("4. Comprador ajeno u organizador intentando reseñar: 403 Forbidden", async () => {
    // Comprador ajeno
    const resAjeno = await request(app)
      .post("/compras/cmp_utilizada_sin_resena/resena")
      .set("x-user-id", COMPRADOR_AJENO)
      .send({ puntaje: 5, comentario: "Comprador ajeno" });
    expect(resAjeno.status).toBe(403);

    // Organizador dueño del evento intenta reseñar su propio evento
    const resOrg = await request(app)
      .post("/compras/cmp_utilizada_sin_resena/resena")
      .set("x-user-id", ORGANIZADOR_DUEÑO)
      .send({ puntaje: 5, comentario: "Autocalificación del organizador" });
    expect(resOrg.status).toBe(403);
  });

  test("5. Compra inexistente (404) y sin x-user-id (401)", async () => {
    const res404 = await request(app)
      .post("/compras/compra_inexistente_9999/resena")
      .set("x-user-id", COMPRADOR_TITULAR)
      .send({ puntaje: 5, comentario: "Comentario válido" });
    expect(res404.status).toBe(404);

    const res401 = await request(app)
      .post("/compras/cmp_utilizada_sin_resena/resena")
      .send({ puntaje: 5, comentario: "Comentario válido" });
    expect(res401.status).toBe(401);
  });

  test("6. Validaciones de puntaje y comentario (400) y casos límite válidos", async () => {
    const endpoint = "/compras/cmp_utilizada_sin_resena/resena";

    // Puntajes inválidos: 0, 6, 3.5, string "5", vacío
    const puntajesInvalidos = [0, 6, 3.5, "5", null, undefined];
    for (const p of puntajesInvalidos) {
      const res = await request(app)
        .post(endpoint)
        .set("x-user-id", COMPRADOR_TITULAR)
        .send({ puntaje: p, comentario: "Comentario válido" });
      expect(res.status).toBe(400);
    }

    // Comentarios inválidos: vacío, solo espacios, 501 caracteres, no string
    const comentariosInvalidos = ["", "    ", "a".repeat(501), 12345];
    for (const c of comentariosInvalidos) {
      const res = await request(app)
        .post(endpoint)
        .set("x-user-id", COMPRADOR_TITULAR)
        .send({ puntaje: 5, comentario: c });
      expect(res.status).toBe(400);
    }

    // Casos límite que SÍ valen: puntaje 1 y comentario de 1 caracter
    const resLimite1 = await request(app)
      .post(endpoint)
      .set("x-user-id", COMPRADOR_TITULAR)
      .send({ puntaje: 1, comentario: "X" });
    expect(resLimite1.status).toBe(201);
  });

  test("7. puedeResenar y resenada: estados del ciclo de vida y visibilidad por rol", async () => {
    // 1. Compra confirmada (no utilizada aún): false/false
    const resConfirmada = await request(app)
      .get("/compras/cmp_confirmada_1")
      .set("x-user-id", COMPRADOR_TITULAR);
    expect(resConfirmada.body.puedeResenar).toBe(false);
    expect(resConfirmada.body.resenada).toBe(false);

    // 2. Compra utilizada sin reseña: true/false para comprador
    const resSinResena = await request(app)
      .get("/compras/cmp_utilizada_sin_resena")
      .set("x-user-id", COMPRADOR_TITULAR);
    expect(resSinResena.body.puedeResenar).toBe(true);
    expect(resSinResena.body.resenada).toBe(false);

    // Visto por el organizador: siempre false
    const resVistaOrg = await request(app)
      .get("/compras/cmp_utilizada_sin_resena")
      .set("x-user-id", ORGANIZADOR_DUEÑO);
    expect(resVistaOrg.body.puedeResenar).toBe(false);

    // 3. Compra utilizada ya reseñada: false/true
    const resConResena = await request(app)
      .get("/compras/cmp_utilizada_1")
      .set("x-user-id", COMPRADOR_TITULAR);
    expect(resConResena.body.puedeResenar).toBe(false);
    expect(resConResena.body.resenada).toBe(true);
  });

  test("8. Regla S10: promedio de organizador con varias reseñas (4.0) y null/0 sin reseñas", async () => {
    // Productora Rock Nacional tiene en el seed res_1 (5) y res_2 (3) -> promedio 4.0
    const resOrgRock = await request(app)
      .get("/organizadores/usr_org_rock")
      .set("x-user-id", COMPRADOR_TITULAR);

    expect(resOrgRock.status).toBe(200);
    expect(resOrgRock.body.puntajePromedio).toBe(4.0);
    expect(resOrgRock.body.cantidadResenas).toBe(2);

    // Teatro Gran Rex no tiene reseñas -> null y 0
    const resOrgTeatro = await request(app)
      .get("/organizadores/usr_org_teatro")
      .set("x-user-id", COMPRADOR_TITULAR);

    expect(resOrgTeatro.status).toBe(200);
    expect(resOrgTeatro.body.puntajePromedio).toBeNull();
    expect(resOrgTeatro.body.cantidadResenas).toBe(0);
  });

  test("9. Orden por puntaje desc y asc: eventos sin reseñas (null) quedan siempre al final", async () => {
    // orden=puntaje direccion=desc
    const resDesc = await request(app)
      .get("/eventos?orden=puntaje&direccion=desc&incluirRealizados=true")
      .set("x-user-id", COMPRADOR_TITULAR);

    expect(resDesc.status).toBe(200);
    const eventosDesc = resDesc.body;
    // Los primeros deben tener puntaje numérico (4.0) y los últimos null
    const ultimoDesc = eventosDesc[eventosDesc.length - 1];
    expect(ultimoDesc.puntajeOrganizador).toBeNull();

    // orden=puntaje direccion=asc
    const resAsc = await request(app)
      .get("/eventos?orden=puntaje&direccion=asc&incluirRealizados=true")
      .set("x-user-id", COMPRADOR_TITULAR);

    expect(resAsc.status).toBe(200);
    const eventosAsc = resAsc.body;
    const ultimoAsc = eventosAsc[eventosAsc.length - 1];
    expect(ultimoAsc.puntajeOrganizador).toBeNull();
  });

  test("10. GET /eventos/:id incluye organizador con promedio y reseñas de todos sus eventos", async () => {
    const res = await request(app)
      .get("/eventos/evt_cosquin")
      .set("x-user-id", COMPRADOR_TITULAR);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("organizador");
    expect(res.body.organizador.id).toBe(ORGANIZADOR_DUEÑO);
    expect(res.body.organizador.puntajePromedio).toBe(4.0);
    expect(res.body.organizador.cantidadResenas).toBe(2);
    expect(Array.isArray(res.body.organizador.resenas)).toBe(true);
    expect(res.body.organizador.resenas.length).toBe(2);
    expect(res.body.organizador.resenas[0]).toHaveProperty("evento");
    expect(res.body.organizador.resenas[0]).toHaveProperty("autor");
  });

  test("11. Endpoints de reseñas y organizador: formato correcto y 404 correspondiente", async () => {
    // GET /eventos/:id/resenas
    const resEvtResenas = await request(app)
      .get("/eventos/evt_divididos/resenas")
      .set("x-user-id", COMPRADOR_TITULAR);
    expect(resEvtResenas.status).toBe(200);
    expect(resEvtResenas.body).toHaveProperty("puntajePromedio");
    expect(resEvtResenas.body).toHaveProperty("resenas");

    const resEvt404 = await request(app)
      .get("/eventos/evt_inexistente_9999/resenas")
      .set("x-user-id", COMPRADOR_TITULAR);
    expect(resEvt404.status).toBe(404);

    // GET /organizadores/:id/resenas
    const resOrgResenas = await request(app)
      .get("/organizadores/usr_org_rock/resenas")
      .set("x-user-id", COMPRADOR_TITULAR);
    expect(resOrgResenas.status).toBe(200);
    expect(resOrgResenas.body.cantidadResenas).toBe(2);

    const resOrg404 = await request(app)
      .get("/organizadores/usr_inexistente_9999/resenas")
      .set("x-user-id", COMPRADOR_TITULAR);
    expect(resOrg404.status).toBe(404);
  });

  test("12. Una reseña nueva cambia el puntaje del organizador y su posición en el catálogo", async () => {
    // Teatro Gran Rex (usr_org_teatro) arranca con puntajePromedio: null
    const antes = await request(app)
      .get("/organizadores/usr_org_teatro")
      .set("x-user-id", COMPRADOR_TITULAR);
    expect(antes.body.puntajePromedio).toBeNull();

    // Creamos compra utilizada para el Teatro Gran Rex y la calificamos con 5
    const comprador = await usuarioRepository.findById(COMPRADOR_TITULAR);
    const eventoTeatro = await eventoRepository.findById("evt_teatro");

    const compraTeatro = await compraRepository.save({
      id: "cmp_teatro_nueva_resena",
      comprador,
      evento: eventoTeatro,
      tipoEntrada: { tipoEntradaId: "tipo_teatro_1", nombre: "Platea", precio: 18000 },
      cantidad: 1,
      total: 18000,
      estado: EstadoCompra.UTILIZADA,
    });

    const resCalif = await request(app)
      .post(`/compras/${compraTeatro.id}/resena`)
      .set("x-user-id", COMPRADOR_TITULAR)
      .send({ puntaje: 5, comentario: "¡Excelente obra y acústica!" });
    expect(resCalif.status).toBe(201);

    // Ahora Teatro Gran Rex tiene puntaje 5.0 (por encima de Productora Rock con 4.0)
    const despues = await request(app)
      .get("/organizadores/usr_org_teatro")
      .set("x-user-id", COMPRADOR_TITULAR);
    expect(despues.body.puntajePromedio).toBe(5.0);
    expect(despues.body.cantidadResenas).toBe(1);

    // En el catálogo ordenado por puntaje desc, Teatro Toc Toc debe figurar primero
    const resCatalogo = await request(app)
      .get("/eventos?orden=puntaje&direccion=desc")
      .set("x-user-id", COMPRADOR_TITULAR);
    expect(resCatalogo.status).toBe(200);
    expect(resCatalogo.body[0].organizador.id).toBe("usr_org_teatro");
    expect(resCatalogo.body[0].puntajeOrganizador).toBe(5.0);
  });
});
