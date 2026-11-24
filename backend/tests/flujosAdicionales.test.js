import request from "supertest";
import app from "../src/app.js";
import { inicializarSeedInMemory } from "../src/data/seedInMemory.js";

const COMPRADOR_1 = "usr_comprador_1";
const COMPRADOR_2 = "usr_comprador_2";

describe("Flujos Adicionales y Robustez Técnica - AI Ticket It", () => {
  beforeEach(async () => {
    delete process.env.ENABLE_DEV_ENDPOINTS;
    await inicializarSeedInMemory();
  });

  test("Pagar compra: pasa de PENDIENTE a CONFIRMADA y activa diasRestantes", async () => {
    const resPagar = await request(app)
      .post("/compras/cmp_pendiente_1/pagos")
      .set("x-user-id", COMPRADOR_2);

    expect(resPagar.status).toBe(200);
    expect(resPagar.body.estado).toBe("CONFIRMADA");
    expect(resPagar.body.puedePagar).toBe(false);
    expect(resPagar.body.puedeCancelar).toBe(true);
    expect(resPagar.body.diasRestantes).toBeGreaterThan(0);
  });

  test("Detalle de compra con historial de estados ordenado", async () => {
    const res = await request(app)
      .get("/compras/cmp_confirmada_1")
      .set("x-user-id", COMPRADOR_1);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe("cmp_confirmada_1");
    expect(res.body.estado).toBe("CONFIRMADA");
    expect(Array.isArray(res.body.historialEstados)).toBe(true);
    expect(res.body.historialEstados.length).toBeGreaterThanOrEqual(1);
  });

  test("Cancelar compra pendiente: transiciona a CANCELADA y libera cupo", async () => {
    const evTeatroAntes = await request(app)
      .get("/eventos/evt_teatro")
      .set("x-user-id", COMPRADOR_2);
    const cupoAntes = evTeatroAntes.body.tiposEntrada.find((t) => t.id === "tipo_teatro_1").cupoRestante;

    const res = await request(app)
      .post("/compras/cmp_pendiente_1/cancelaciones")
      .set("x-user-id", COMPRADOR_2);

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe("CANCELADA");

    const evTeatroDespues = await request(app)
      .get("/eventos/evt_teatro")
      .set("x-user-id", COMPRADOR_2);
    const cupoDespues = evTeatroDespues.body.tiposEntrada.find((t) => t.id === "tipo_teatro_1").cupoRestante;
    expect(cupoDespues).toBe(cupoAntes + 2);
  });

  test("Reseñas inválidas: duplicada en la misma compra (409) o compra no utilizada (409)", async () => {
    // 1. Reseña en compra confirmada no utilizada -> 409
    const resNoUtilizada = await request(app)
      .post("/compras/cmp_confirmada_1/resena")
      .set("x-user-id", COMPRADOR_1)
      .send({ puntaje: 5, comentario: "Quiero calificar antes" });

    expect(resNoUtilizada.status).toBe(409);
    expect(resNoUtilizada.body.error.code).toBe("COMPRA_NO_UTILIZADA");

    // 2. Reseña duplicada en compra ya calificada en el seed (cmp_utilizada_1) -> 409
    const resDuplicada = await request(app)
      .post("/compras/cmp_utilizada_1/resena")
      .set("x-user-id", COMPRADOR_1)
      .send({ puntaje: 4, comentario: "Segunda reseña" });

    expect(resDuplicada.status).toBe(409);
    expect(resDuplicada.body.error.code).toBe("RESENA_YA_EXISTE");
  });

  test("POST /dev/reset: activo solo con ENABLE_DEV_ENDPOINTS=true (200), sino 404", async () => {
    delete process.env.ENABLE_DEV_ENDPOINTS;
    const res404 = await request(app).post("/dev/reset");
    expect(res404.status).toBe(404);

    process.env.ENABLE_DEV_ENDPOINTS = "true";
    const res200 = await request(app).post("/dev/reset");
    expect(res200.status).toBe(200);
    expect(res200.body.ok).toBe(true);
  });

  test("Queries inválidas y detalle de evento inexistente", async () => {
    const resOrdenInvalido = await request(app)
      .get("/eventos?orden=invalido")
      .set("x-user-id", COMPRADOR_1);
    expect(resOrdenInvalido.status).toBe(400);

    const resDirInvalida = await request(app)
      .get("/eventos?direccion=invalida")
      .set("x-user-id", COMPRADOR_1);
    expect(resDirInvalida.status).toBe(400);

    const resNoExiste = await request(app)
      .get("/eventos/evt_no_existe_9999")
      .set("x-user-id", COMPRADOR_1);
    expect(resNoExiste.status).toBe(404);
  });
});
