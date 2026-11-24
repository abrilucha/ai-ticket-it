import request from "supertest";
import app from "../src/app.js";
import { inicializarSeedInMemory } from "../src/data/seedInMemory.js";
import { eventoRepository } from "../src/repositories/EventoRepository.js";
import { compraRepository } from "../src/repositories/CompraRepository.js";

describe("Ciclo de Vida de la Compra y Máquina de Estados (Jest + Supertest)", () => {
  beforeEach(async () => {
    // Reiniciar seed antes de cada test para asegurar determinismo
    await inicializarSeedInMemory();
  });

  test("1. Demostración con números: Cupo baja en PENDIENTE, se mantiene en CONFIRMADA y sube al CANCELAR/REEMBOLSAR", async () => {
    // Paso 1: Consultar cupo inicial de 'Campo General' en Cosquín Rock
    const resInicial = await request(app).get("/eventos/evt_cosquin").set("x-user-id", "usr_comprador_1");
    expect(resInicial.status).toBe(200);
    const tipoInicial = resInicial.body.tiposEntrada.find((t) => t.id === "tipo_rock_1");
    const cupoInicial = tipoInicial.cupoRestante;
    expect(cupoInicial).toBe(498); // 500 iniciales - 2 de la compra confirmada en el seed

    // Paso 2: Crear compra de 2 entradas (queda PENDIENTE) -> Debe descontar cupo a 496
    const resCrear = await request(app)
      .post("/compras")
      .set("x-user-id", "usr_comprador_1")
      .send({
        eventoId: "evt_cosquin",
        tipoEntradaId: "tipo_rock_1",
        cantidad: 2,
      });
    expect(resCrear.status).toBe(201);
    expect(resCrear.body.estado).toBe("PENDIENTE");
    expect(resCrear.body.puedePagar).toBe(true);
    expect(resCrear.body.puedeCancelar).toBe(true);

    const resDespuesCrear = await request(app).get("/eventos/evt_cosquin").set("x-user-id", "usr_comprador_1");
    const tipoDespuesCrear = resDespuesCrear.body.tiposEntrada.find((t) => t.id === "tipo_rock_1");
    expect(tipoDespuesCrear.cupoRestante).toBe(496); // 498 - 2 = 496

    // Paso 3: Pagar la compra -> Pasa a CONFIRMADA -> Cupo se mantiene en 496
    const resPagar = await request(app)
      .post(`/compras/${resCrear.body.id}/pagos`)
      .set("x-user-id", "usr_comprador_1");
    expect(resPagar.status).toBe(200);
    expect(resPagar.body.estado).toBe("CONFIRMADA");
    expect(resPagar.body.puedeCancelar).toBe(true);
    expect(resPagar.body.diasRestantes).toBeGreaterThan(0);

    const resDespuesPagar = await request(app).get("/eventos/evt_cosquin").set("x-user-id", "usr_comprador_1");
    const tipoDespuesPagar = resDespuesPagar.body.tiposEntrada.find((t) => t.id === "tipo_rock_1");
    expect(tipoDespuesPagar.cupoRestante).toBe(496); // Sigue en 496

    // Paso 4: Cancelar la compra -> Pasa a REEMBOLSADA -> Cupo vuelve a subir a 498
    const resCancelar = await request(app)
      .post(`/compras/${resCrear.body.id}/cancelaciones`)
      .set("x-user-id", "usr_comprador_1");
    expect(resCancelar.status).toBe(200);
    expect(resCancelar.body.estado).toBe("REEMBOLSADA");
    expect(resCancelar.body.montoReembolsado).toBe(50000);
    expect(resCancelar.body.fechaCancelacion).toBeDefined();

    const resDespuesCancelar = await request(app).get("/eventos/evt_cosquin").set("x-user-id", "usr_comprador_1");
    const tipoDespuesCancelar = resDespuesCancelar.body.tiposEntrada.find((t) => t.id === "tipo_rock_1");
    expect(tipoDespuesCancelar.cupoRestante).toBe(498); // Liberado nuevamente a 498
  });

  test("2. Bloqueo por evento realizado: cancelar compra de evento pasado debe responder 409 Conflict", async () => {
    // La compra 'cmp_utilizada_1' del seed es del evento 'evt_divididos' (fecha pasada hace 5 días)
    // Para probar la regla de evento realizado pura, creemos una compra en estado CONFIRMADA sobre ese evento pasado
    const compraPasada = await compraRepository.save({
      id: "cmp_pasada_test",
      comprador: { id: "usr_comprador_1" },
      evento: {
        id: "evt_divididos",
        fecha: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      },
      tipoEntrada: { tipoEntradaId: "tipo_divididos_1", precio: 20000 },
      cantidad: 1,
      total: 20000,
      estado: "CONFIRMADA",
    });

    const res = await request(app)
      .post(`/compras/${compraPasada.id}/cancelaciones`)
      .set("x-user-id", "usr_comprador_1");

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/evento que ya se realizó/i);
  });

  test("3. Permiso por propiedad (Organizador): utilizar por un organizador ajeno debe dar 403 Forbidden", async () => {
    // Evento Cosquín Rock pertenece a 'usr_org_rock'
    // 'usr_org_teatro' es otro organizador ajeno al evento
    const res = await request(app)
      .post("/compras/cmp_confirmada_1/usos")
      .set("x-user-id", "usr_org_teatro"); // Organizador ajeno

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/solo el organizador dueño del evento/i);
  });

  test("4. Permiso por propiedad (Comprador): cancelar por un comprador ajeno debe dar 403 Forbidden", async () => {
    // La compra 'cmp_confirmada_1' pertenece a 'usr_comprador_1' (Lucas)
    // 'usr_comprador_2' (Mariana) intenta cancelarla
    const res = await request(app)
      .post("/compras/cmp_confirmada_1/cancelaciones")
      .set("x-user-id", "usr_comprador_2"); // Comprador ajeno

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/solo el comprador titular/i);
  });

  test("5. Permiso de cancelación: un organizador intenta cancelar una compra y debe dar 403 Forbidden", async () => {
    // Los organizadores no pueden cancelar compras de los usuarios (caso de uso C10)
    const res = await request(app)
      .post("/compras/cmp_confirmada_1/cancelaciones")
      .set("x-user-id", "usr_org_rock");

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/organizadores no pueden cancelar/i);
  });

  test("6. Transición inválida: pagar sobre una compra cancelada debe dar 409 Conflict", async () => {
    // Cancelar la compra pendiente del seed 'cmp_pendiente_1'
    await request(app)
      .post("/compras/cmp_pendiente_1/cancelaciones")
      .set("x-user-id", "usr_comprador_2");

    // Intentar pagar sobre la compra ya CANCELADA
    const res = await request(app)
      .post("/compras/cmp_pendiente_1/pagos")
      .set("x-user-id", "usr_comprador_2");

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/no se puede pagar una compra en estado/i);
  });

  test("7. Transición inválida: utilizar dos veces debe dar 409 Conflict", async () => {
    // 1er uso: exitoso
    const res1 = await request(app)
      .post("/compras/cmp_confirmada_1/usos")
      .set("x-user-id", "usr_org_rock");
    expect(res1.status).toBe(200);
    expect(res1.body.estado).toBe("UTILIZADA");

    // 2do uso: falla con 409
    const res2 = await request(app)
      .post("/compras/cmp_confirmada_1/usos")
      .set("x-user-id", "usr_org_rock");
    expect(res2.status).toBe(409);
    expect(res2.body.message).toMatch(/ya ha sido utilizada previamente/i);
  });

  test("8. Bloqueo S8: cancelar sobre una entrada ya utilizada debe dar 409 Conflict", async () => {
    // 'cmp_utilizada_1' está en estado UTILIZADA
    const res = await request(app)
      .post("/compras/cmp_utilizada_1/cancelaciones")
      .set("x-user-id", "usr_comprador_1");

    expect(res.status).toBe(409);
    expect(res.body.message).toMatch(/ya fue utilizada/i);
  });
});
