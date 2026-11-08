import request from "supertest";
import app from "../src/app.js";
import { inicializarSeedInMemory } from "../src/data/seedInMemory.js";

const COMPRADOR_1 = "usr_comprador_1";
const COMPRADOR_2 = "usr_comprador_2";
const ORG_ROCK = "usr_org_rock";

describe("Casos de Uso del TP (CU1 a CU12) - AI Ticket It", () => {
  beforeEach(async () => {
    await inicializarSeedInMemory();
  });

  // CU1: comprador ve sus compras con estado y días restantes (solo si CONFIRMADA)
  test("CU1: comprador ve sus compras con estado y días restantes (solo si CONFIRMADA)", async () => {
    const res = await request(app)
      .get("/compras/mias")
      .set("x-user-id", COMPRADOR_1);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);

    res.body.forEach((c) => {
      expect(c.id).toBeDefined();
      expect(c.estado).toBeDefined();
      if (c.estado === "CONFIRMADA") {
        expect(typeof c.diasRestantes).toBe("number");
        expect(c.diasRestantes).toBeGreaterThanOrEqual(0);
      } else {
        expect(c.diasRestantes).toBeNull();
      }
    });
  });

  // CU2: organizador ve las compras de un evento con estado y entradas restantes por tipo
  test("CU2: organizador ve las compras de un evento con estado y entradas restantes por tipo", async () => {
    const res = await request(app)
      .get("/eventos/evt_cosquin/compras")
      .set("x-user-id", ORG_ROCK);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.compras)).toBe(true);
    expect(Array.isArray(res.body.disponibilidadPorTipo)).toBe(true);

    res.body.compras.forEach((c) => {
      expect(c.id).toBeDefined();
      expect(c.estado).toBeDefined();
      expect(c.cantidad).toBeGreaterThan(0);
    });

    res.body.disponibilidadPorTipo.forEach((tipo) => {
      expect(tipo.tipoEntradaId).toBeDefined();
      expect(tipo.nombre).toBeDefined();
      expect(tipo.cupoTotal).toBeGreaterThan(0);
      expect(typeof tipo.cupoRestante).toBe("number");
      expect(tipo.cupoRestante).toBeLessThanOrEqual(tipo.cupoTotal);
    });
  });

  // CU3: comprador busca por texto y explora por categorías
  test("CU3: comprador busca por texto y explora por categorías", async () => {
    // 1. Explora categorías
    const resCat = await request(app)
      .get("/categorias")
      .set("x-user-id", COMPRADOR_1);

    expect(resCat.status).toBe(200);
    expect(resCat.body.length).toBe(5);

    // 2. Busca por texto
    const resTexto = await request(app)
      .get("/eventos?q=cosquin")
      .set("x-user-id", COMPRADOR_1);

    expect(resTexto.status).toBe(200);
    expect(resTexto.body.length).toBeGreaterThanOrEqual(1);
    expect(resTexto.body[0].nombre).toContain("Cosquín Rock");

    // 3. Filtra por categoría
    const resFiltro = await request(app)
      .get("/eventos?categoria=cat_festivales")
      .set("x-user-id", COMPRADOR_1);

    expect(resFiltro.status).toBe(200);
    expect(resFiltro.body.length).toBeGreaterThanOrEqual(1);
    resFiltro.body.forEach((ev) => {
      expect(ev.categoria.id || ev.categoria).toBe("cat_festivales");
    });
  });

  // CU4: organizador crea un evento con varios tipos de entrada
  test("CU4: organizador crea un evento con varios tipos de entrada", async () => {
    const nuevoEvento = {
      nombre: "Quilmes Rock 2027",
      descripcion: "El histórico festival de rock argentino regresa con tres jornadas épicas.",
      categoria: "cat_festivales",
      fecha: new Date(Date.now() + 1000 * 60 * 60 * 24 * 75).toISOString(),
      multimedia: ["https://images.unsplash.com/photo-1470225620780-dba8ba36b745"],
      tiposEntrada: [
        { nombre: "Campo General", precio: 22000, cupo: 800 },
        { nombre: "Platea Preferencial", precio: 45000, cupo: 200 },
      ],
    };

    const res = await request(app)
      .post("/eventos")
      .set("x-user-id", ORG_ROCK)
      .send(nuevoEvento);

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.nombre).toBe("Quilmes Rock 2027");
    expect(res.body.tiposEntrada).toHaveLength(2);

    res.body.tiposEntrada.forEach((tipo) => {
      expect(tipo.id).toBeDefined();
      expect(tipo.nombre).toBeDefined();
      expect(tipo.precio).toBeGreaterThan(0);
      expect(tipo.cupo).toBeGreaterThan(0);
    });
  });

  // CU5: comprador envía mensajes en una compra
  test("CU5: comprador envía mensajes en una compra", async () => {
    const res = await request(app)
      .post("/compras/cmp_confirmada_1/mensajes")
      .set("x-user-id", COMPRADOR_1)
      .send({ texto: "Hola, ¿hay estacionamiento habilitado en el predio?" });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.texto).toBe("Hola, ¿hay estacionamiento habilitado en el predio?");
    expect(res.body.autor.id).toBe(COMPRADOR_1);
    expect(res.body.autor.rol).toBe("COMPRADOR");
    expect(res.body.esPropio).toBe(true);
  });

  // CU6: organizador responde mensajes
  test("CU6: organizador responde mensajes", async () => {
    const res = await request(app)
      .post("/compras/cmp_confirmada_1/mensajes")
      .set("x-user-id", ORG_ROCK)
      .send({ texto: "Hola Lucas, sí, contamos con estacionamiento privado en el acceso norte." });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.texto).toBe("Hola Lucas, sí, contamos con estacionamiento privado en el acceso norte.");
    expect(res.body.autor.id).toBe(ORG_ROCK);
    expect(res.body.autor.rol).toBe("ORGANIZADOR");
    expect(res.body.esPropio).toBe(true);

    // Verificación de lectura para el organizador
    const resListado = await request(app)
      .get("/compras/cmp_confirmada_1/mensajes")
      .set("x-user-id", ORG_ROCK);

    expect(resListado.status).toBe(200);
    const msgOrg = resListado.body.find((m) => m.id === res.body.id);
    expect(msgOrg.esPropio).toBe(true);
  });

  // CU7: comprador cancela una compra y se registra el reembolso
  test("CU7: comprador cancela una compra y se registra el reembolso", async () => {
    const evAntes = await request(app)
      .get("/eventos/evt_cosquin")
      .set("x-user-id", COMPRADOR_1);
    const cupoAntes = evAntes.body.tiposEntrada.find((t) => t.id === "tipo_rock_1").cupoRestante;

    const res = await request(app)
      .post("/compras/cmp_confirmada_1/cancelar")
      .set("x-user-id", COMPRADOR_1);

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe("REEMBOLSADA");
    expect(res.body.montoReembolsado).toBe(50000);
    expect(res.body.fechaCancelacion).toBeDefined();

    // El cupo debe haberse liberado
    const evDespues = await request(app)
      .get("/eventos/evt_cosquin")
      .set("x-user-id", COMPRADOR_1);
    const cupoDespues = evDespues.body.tiposEntrada.find((t) => t.id === "tipo_rock_1").cupoRestante;
    expect(cupoDespues).toBe(cupoAntes + 2);
  });

  // CU8: cancelación permitida solo si la compra no está UTILIZADA y el evento no se realizó
  test("CU8: cancelación permitida solo si la compra no está UTILIZADA y el evento no se realizó", async () => {
    // Bloqueo 1: compra ya UTILIZADA
    const resUtilizada = await request(app)
      .post("/compras/cmp_utilizada_1/cancelar")
      .set("x-user-id", COMPRADOR_1);

    expect(resUtilizada.status).toBe(409);
    expect(resUtilizada.body.error).toBeDefined();
    expect(resUtilizada.body.error.code).toBe("ENTRADA_YA_UTILIZADA");

    // Bloqueo 2: evento ya realizado
    // cmp_utilizada_sin_resena es de evt_divididos (fecha pasada)
    const resEventoRealizado = await request(app)
      .post("/compras/cmp_utilizada_sin_resena/cancelar")
      .set("x-user-id", COMPRADOR_1);

    expect(resEventoRealizado.status).toBe(409);
    expect(resEventoRealizado.body.error).toBeDefined();
  });

  // CU9: comprador puntúa y comenta una vez utilizada la entrada
  test("CU9: comprador puntúa y comenta una vez utilizada la entrada", async () => {
    const res = await request(app)
      .post("/compras/cmp_utilizada_sin_resena/resena")
      .set("x-user-id", COMPRADOR_1)
      .send({
        puntaje: 5,
        comentario: "Una noche inolvidable, sonido impecable e ingreso muy ágil.",
      });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.puntaje).toBe(5);
    expect(res.body.comentario).toBe("Una noche inolvidable, sonido impecable e ingreso muy ágil.");
    expect(res.body.autor.id).toBe(COMPRADOR_1);
    expect(res.body.fecha).toBeDefined();
  });

  // CU10: las reseñas de eventos anteriores se ven en los eventos de cada organizador
  test("CU10: las reseñas de eventos anteriores se ven en los eventos de cada organizador", async () => {
    // evt_cosquin es futuro y de usr_org_rock, quien organizó el recital pasado Divididos con 2 reseñas
    const res = await request(app)
      .get("/eventos/evt_cosquin")
      .set("x-user-id", COMPRADOR_1);

    expect(res.status).toBe(200);
    expect(res.body.organizador).toBeDefined();
    expect(res.body.organizador.puntajePromedio).toBe(4.0);
    expect(res.body.organizador.cantidadResenas).toBe(2);
    expect(Array.isArray(res.body.organizador.resenas)).toBe(true);
    expect(res.body.organizador.resenas.length).toBe(2);

    // También verificable en el endpoint de perfil del organizador
    const resOrg = await request(app)
      .get("/organizadores/usr_org_rock")
      .set("x-user-id", COMPRADOR_1);

    expect(resOrg.status).toBe(200);
    expect(resOrg.body.puntajePromedio).toBe(4.0);
    expect(resOrg.body.cantidadResenas).toBe(2);

    // Y en el endpoint de reseñas acumuladas del organizador
    const resOrgResenas = await request(app)
      .get("/organizadores/usr_org_rock/resenas")
      .set("x-user-id", COMPRADOR_1);

    expect(resOrgResenas.status).toBe(200);
    expect(resOrgResenas.body.puntajePromedio).toBe(4.0);
    expect(resOrgResenas.body.cantidadResenas).toBe(2);
    expect(Array.isArray(resOrgResenas.body.resenas)).toBe(true);
    expect(resOrgResenas.body.resenas[0].evento.id).toBe("evt_divididos");
    expect(resOrgResenas.body.resenas[0].autor.id).toBeDefined();
  });

  // CU11: comprador ordena por precio, fecha y puntaje del organizador
  test("CU11: comprador ordena por precio, fecha y puntaje del organizador", async () => {
    // 1. Orden por precio asc
    const resPrecio = await request(app)
      .get("/eventos?orden=precio&direccion=asc")
      .set("x-user-id", COMPRADOR_1);
    expect(resPrecio.status).toBe(200);
    const precios = resPrecio.body.map((e) => e.precioMinimo);
    for (let i = 0; i < precios.length - 1; i++) {
      expect(precios[i]).toBeLessThanOrEqual(precios[i + 1]);
    }

    // 2. Orden por fecha asc
    const resFecha = await request(app)
      .get("/eventos?orden=fecha&direccion=asc")
      .set("x-user-id", COMPRADOR_1);
    expect(resFecha.status).toBe(200);
    const fechas = resFecha.body.map((e) => new Date(e.fecha).getTime());
    for (let i = 0; i < fechas.length - 1; i++) {
      expect(fechas[i]).toBeLessThanOrEqual(fechas[i + 1]);
    }

    // 3. Orden por puntaje desc (los de puntaje null van al final)
    const resPuntaje = await request(app)
      .get("/eventos?orden=puntaje&direccion=desc")
      .set("x-user-id", COMPRADOR_1);
    expect(resPuntaje.status).toBe(200);
    const puntajes = resPuntaje.body.map((e) => e.puntajeOrganizador);
    let encontroNull = false;
    for (const p of puntajes) {
      if (p === null) {
        encontroNull = true;
      } else if (encontroNull) {
        fail("Un evento con puntaje apareció después de un null");
      }
    }
  });

  // CU12: comprador compra eligiendo tipo y cantidad sin superar el cupo
  test("CU12: comprador compra eligiendo tipo y cantidad sin superar el cupo", async () => {
    // 1. Cupo inicial
    const evInicial = await request(app)
      .get("/eventos/evt_cosquin")
      .set("x-user-id", COMPRADOR_1);
    const tipo = evInicial.body.tiposEntrada.find((t) => t.id === "tipo_rock_1");
    const cupoDisponible = tipo.cupoRestante;

    // 2. Compra válida
    const resCompraValida = await request(app)
      .post("/compras")
      .set("x-user-id", COMPRADOR_1)
      .send({
        eventoId: "evt_cosquin",
        tipoEntradaId: "tipo_rock_1",
        cantidad: 2,
      });

    expect(resCompraValida.status).toBe(201);
    expect(resCompraValida.body.estado).toBe("PENDIENTE");
    expect(resCompraValida.body.cantidad).toBe(2);

    // 3. Compra que supera el cupo -> 409 Conflict
    const resExceso = await request(app)
      .post("/compras")
      .set("x-user-id", COMPRADOR_2)
      .send({
        eventoId: "evt_cosquin",
        tipoEntradaId: "tipo_rock_1",
        cantidad: cupoDisponible + 10,
      });

    expect(resExceso.status).toBe(409);
    expect(resExceso.body.error).toBeDefined();
    expect(resExceso.body.error.code).toBe("CUPO_INSUFICIENTE");
  });
});
