import request from "supertest";
import app from "../src/app.js";
import { inicializarSeedInMemory, DEMO_PASSWORD } from "../src/data/seedInMemory.js";

function containsKeyRecursive(obj, targetKey) {
  if (!obj || typeof obj !== "object") return false;
  if (Array.isArray(obj)) {
    return obj.some((item) => containsKeyRecursive(item, targetKey));
  }
  if (Object.prototype.hasOwnProperty.call(obj, targetKey)) {
    return true;
  }
  return Object.values(obj).some((val) => containsKeyRecursive(val, targetKey));
}

describe("BLOQUE A5: Pruebas de Favoritos (Back-end)", () => {
  beforeEach(async () => {
    process.env.ENABLE_SIMULATED_AUTH = "false";
    process.env.ENABLE_DEV_ENDPOINTS = "true";
    await inicializarSeedInMemory();
  });

  afterAll(async () => {
    process.env.ENABLE_SIMULATED_AUTH = "true";
  });

  const loginCompradorLucas = async () => {
    const res = await request(app).post("/auth/login").send({
      email: "lucas@test.com",
      password: DEMO_PASSWORD,
    });
    return res.body.token;
  };

  const loginCompradorMariana = async () => {
    const res = await request(app).post("/auth/login").send({
      email: "mariana@test.com",
      password: DEMO_PASSWORD,
    });
    return res.body.token;
  };

  const loginOrganizadorRock = async () => {
    const res = await request(app).post("/auth/login").send({
      email: "rock@productora.com",
      password: DEMO_PASSWORD,
    });
    return res.body.token;
  };

  // 1. Comprador agrega un favorito: 201; repite: 200 y sigue habiendo uno solo; GET /favoritos lo devuelve.
  test("1. Comprador agrega un favorito: 201; repite: 200 (idempotente) y sigue habiendo uno solo; GET /favoritos lo devuelve", async () => {
    const token = await loginCompradorMariana(); // Mariana arranca con favoritos vacíos []

    // Agregar primer favorito
    const resAdd = await request(app)
      .post("/favoritos/evt_teatro")
      .set("Authorization", `Bearer ${token}`);
    expect(resAdd.status).toBe(201);
    expect(resAdd.body).toEqual({ eventoId: "evt_teatro", esFavorito: true });

    // Repetir agregación (idempotente: 200)
    const resRepetir = await request(app)
      .post("/favoritos/evt_teatro")
      .set("Authorization", `Bearer ${token}`);
    expect(resRepetir.status).toBe(200);
    expect(resRepetir.body).toEqual({ eventoId: "evt_teatro", esFavorito: true });

    // GET /favoritos devuelve exactamente 1 elemento
    const resList = await request(app)
      .get("/favoritos")
      .set("Authorization", `Bearer ${token}`);
    expect(resList.status).toBe(200);
    expect(Array.isArray(resList.body)).toBe(true);
    expect(resList.body.length).toBe(1);
    expect(resList.body[0].id).toBe("evt_teatro");
    expect(resList.body[0].esFavorito).toBe(true);
  });

  // 2. Orden del más reciente al más antiguo con tres favoritos.
  test("2. Orden del más reciente al más antiguo con tres favoritos", async () => {
    const token = await loginCompradorMariana();

    // Agregamos en secuencia: 1. evt_teatro, 2. evt_recital_charly, 3. evt_superclasico
    await request(app)
      .post("/favoritos/evt_teatro")
      .set("Authorization", `Bearer ${token}`);
    await request(app)
      .post("/favoritos/evt_recital_charly")
      .set("Authorization", `Bearer ${token}`);
    await request(app)
      .post("/favoritos/evt_superclasico")
      .set("Authorization", `Bearer ${token}`);

    const resList = await request(app)
      .get("/favoritos")
      .set("Authorization", `Bearer ${token}`);
    expect(resList.status).toBe(200);
    expect(resList.body.length).toBe(3);

    // Debe venir en orden de más reciente a más antiguo: 3, 2, 1
    expect(resList.body[0].id).toBe("evt_superclasico");
    expect(resList.body[1].id).toBe("evt_recital_charly");
    expect(resList.body[2].id).toBe("evt_teatro");
  });

  // 3. El formato de los elementos de GET /favoritos coincide con el de GET /eventos (mismos campos) y esFavorito es true.
  test("3. El formato de los elementos de GET /favoritos coincide con el de GET /eventos y esFavorito es true", async () => {
    const token = await loginCompradorLucas();

    // Lucas tiene evt_cosquin en el seed
    const resFavoritos = await request(app)
      .get("/favoritos")
      .set("Authorization", `Bearer ${token}`);
    expect(resFavoritos.status).toBe(200);
    expect(resFavoritos.body.length).toBeGreaterThanOrEqual(1);
    const favCosquin = resFavoritos.body.find((e) => e.id === "evt_cosquin");
    expect(favCosquin).toBeDefined();

    // Comparar con GET /eventos
    const resEventos = await request(app)
      .get("/eventos")
      .set("Authorization", `Bearer ${token}`);
    expect(resEventos.status).toBe(200);
    const evtCosquin = resEventos.body.find((e) => e.id === "evt_cosquin");
    expect(evtCosquin).toBeDefined();

    // Mismos campos obligatorios
    expect(favCosquin).toHaveProperty("id");
    expect(favCosquin).toHaveProperty("nombre");
    expect(favCosquin).toHaveProperty("descripcion");
    expect(favCosquin).toHaveProperty("fecha");
    expect(favCosquin).toHaveProperty("precioMinimo");
    expect(favCosquin).toHaveProperty("realizado");
    expect(favCosquin).toHaveProperty("puntajeOrganizador");
    expect(favCosquin).toHaveProperty("cantidadResenas");
    expect(favCosquin).toHaveProperty("tiposEntrada");
    expect(favCosquin).toHaveProperty("organizador");
    expect(favCosquin.esFavorito).toBe(true);

    const keysFavorito = Object.keys(favCosquin).sort();
    const keysEvento = Object.keys(evtCosquin).sort();
    expect(keysFavorito).toEqual(keysEvento);
  });

  // 4. Quitar: 204; repetir: 204; deja de aparecer.
  test("4. Quitar: 204; repetir: 204 (idempotente); deja de aparecer", async () => {
    const token = await loginCompradorLucas();

    // Lucas arranca con evt_cosquin
    const resDelete = await request(app)
      .delete("/favoritos/evt_cosquin")
      .set("Authorization", `Bearer ${token}`);
    expect(resDelete.status).toBe(204);
    expect(resDelete.body).toEqual({});

    // Repetir el delete (idempotente: 204)
    const resDeleteRepetido = await request(app)
      .delete("/favoritos/evt_cosquin")
      .set("Authorization", `Bearer ${token}`);
    expect(resDeleteRepetido.status).toBe(204);

    // Consulta GET: ya no aparece
    const resList = await request(app)
      .get("/favoritos")
      .set("Authorization", `Bearer ${token}`);
    expect(resList.status).toBe(200);
    const encontrado = resList.body.find((e) => e.id === "evt_cosquin");
    expect(encontrado).toBeUndefined();
  });

  // 5. Evento inexistente: 404 en POST y DELETE.
  test("5. Evento inexistente: 404 en POST y DELETE con código NO_ENCONTRADO", async () => {
    const token = await loginCompradorLucas();

    const resPost = await request(app)
      .post("/favoritos/evt_inexistente_999")
      .set("Authorization", `Bearer ${token}`);
    expect(resPost.status).toBe(404);
    expect(resPost.body.error?.code).toBe("NO_ENCONTRADO");

    const resDelete = await request(app)
      .delete("/favoritos/evt_inexistente_999")
      .set("Authorization", `Bearer ${token}`);
    expect(resDelete.status).toBe(404);
    expect(resDelete.body.error?.code).toBe("NO_ENCONTRADO");
  });

  // 6. Organizador en GET, POST y DELETE: 403 FAVORITOS_SOLO_COMPRADORES. Sin token: 401.
  test("6. Organizador en GET, POST y DELETE recibe 403 FAVORITOS_SOLO_COMPRADORES; sin token recibe 401", async () => {
    const tokenOrg = await loginOrganizadorRock();

    // GET organizador -> 403
    const resGetOrg = await request(app)
      .get("/favoritos")
      .set("Authorization", `Bearer ${tokenOrg}`);
    expect(resGetOrg.status).toBe(403);
    expect(resGetOrg.body.error?.code).toBe("FAVORITOS_SOLO_COMPRADORES");
    expect(resGetOrg.body.error?.message).toBe(
      "Solo los compradores pueden guardar eventos favoritos"
    );

    // POST organizador -> 403 (incluso si el evento existe o no existe: regla en el service)
    const resPostOrg = await request(app)
      .post("/favoritos/evt_cosquin")
      .set("Authorization", `Bearer ${tokenOrg}`);
    expect(resPostOrg.status).toBe(403);
    expect(resPostOrg.body.error?.code).toBe("FAVORITOS_SOLO_COMPRADORES");

    // DELETE organizador -> 403
    const resDeleteOrg = await request(app)
      .delete("/favoritos/evt_cosquin")
      .set("Authorization", `Bearer ${tokenOrg}`);
    expect(resDeleteOrg.status).toBe(403);
    expect(resDeleteOrg.body.error?.code).toBe("FAVORITOS_SOLO_COMPRADORES");

    // Sin token -> 401 NO_AUTENTICADO
    const resSinTokenGet = await request(app).get("/favoritos");
    expect(resSinTokenGet.status).toBe(401);
    expect(resSinTokenGet.body.error?.code).toBe("NO_AUTENTICADO");

    const resSinTokenPost = await request(app).post("/favoritos/evt_cosquin");
    expect(resSinTokenPost.status).toBe(401);

    const resSinTokenDelete = await request(app).delete("/favoritos/evt_cosquin");
    expect(resSinTokenDelete.status).toBe(401);
  });

  // 7. esFavorito en GET /eventos y GET /eventos/:id: true para quien lo marcó, false para otro comprador y false para un organizador.
  test("7. esFavorito en GET /eventos y GET /eventos/:id refleja estado por usuario", async () => {
    const tokenLucas = await loginCompradorLucas(); // Lucas tiene evt_cosquin como favorito
    const tokenMariana = await loginCompradorMariana(); // Mariana no tiene favoritos
    const tokenOrg = await loginOrganizadorRock();

    // 1. Lucas: esFavorito true
    const resCatLucas = await request(app)
      .get("/eventos")
      .set("Authorization", `Bearer ${tokenLucas}`);
    const evtLucas = resCatLucas.body.find((e) => e.id === "evt_cosquin");
    expect(evtLucas.esFavorito).toBe(true);

    const resDetLucas = await request(app)
      .get("/eventos/evt_cosquin")
      .set("Authorization", `Bearer ${tokenLucas}`);
    expect(resDetLucas.body.esFavorito).toBe(true);

    // 2. Mariana: esFavorito false
    const resCatMariana = await request(app)
      .get("/eventos")
      .set("Authorization", `Bearer ${tokenMariana}`);
    const evtMariana = resCatMariana.body.find((e) => e.id === "evt_cosquin");
    expect(evtMariana.esFavorito).toBe(false);

    const resDetMariana = await request(app)
      .get("/eventos/evt_cosquin")
      .set("Authorization", `Bearer ${tokenMariana}`);
    expect(resDetMariana.body.esFavorito).toBe(false);

    // 3. Organizador: esFavorito siempre false
    const resCatOrg = await request(app)
      .get("/eventos")
      .set("Authorization", `Bearer ${tokenOrg}`);
    const evtOrg = resCatOrg.body.find((e) => e.id === "evt_cosquin");
    expect(evtOrg.esFavorito).toBe(false);

    const resDetOrg = await request(app)
      .get("/eventos/evt_cosquin")
      .set("Authorization", `Bearer ${tokenOrg}`);
    expect(resDetOrg.body.esFavorito).toBe(false);
  });

  // 8. Favoritos aislados entre dos compradores. Los favoritos no aparecen en GET /usuarios/me ni en otros payloads.
  test("8. Favoritos aislados entre dos compradores y no expuestos en /usuarios/me ni en otros payloads", async () => {
    const tokenLucas = await loginCompradorLucas();
    const tokenMariana = await loginCompradorMariana();

    // Mariana agrega evt_teatro
    await request(app)
      .post("/favoritos/evt_teatro")
      .set("Authorization", `Bearer ${tokenMariana}`);

    // Lista de Lucas solo tiene cosquin, no teatro
    const listLucas = await request(app)
      .get("/favoritos")
      .set("Authorization", `Bearer ${tokenLucas}`);
    const idsLucas = listLucas.body.map((e) => e.id);
    expect(idsLucas).toContain("evt_cosquin");
    expect(idsLucas).not.toContain("evt_teatro");

    // Lista de Mariana solo tiene teatro, no cosquin
    const listMariana = await request(app)
      .get("/favoritos")
      .set("Authorization", `Bearer ${tokenMariana}`);
    const idsMariana = listMariana.body.map((e) => e.id);
    expect(idsMariana).toContain("evt_teatro");
    expect(idsMariana).not.toContain("evt_cosquin");

    // GET /usuarios/me de Lucas NO contiene la clave 'favoritos' en ningún nivel recursivo
    const resMeLucas = await request(app)
      .get("/usuarios/me")
      .set("Authorization", `Bearer ${tokenLucas}`);
    expect(resMeLucas.status).toBe(200);
    expect(containsKeyRecursive(resMeLucas.body, "favoritos")).toBe(false);

    // Login response tampoco contiene 'favoritos'
    const resLogin = await request(app).post("/auth/login").send({
      email: "lucas@test.com",
      password: DEMO_PASSWORD,
    });
    expect(containsKeyRecursive(resLogin.body, "favoritos")).toBe(false);
  });

  // 9. Un favorito de un evento realizado aparece en GET /favoritos con realizado: true.
  test("9. Un favorito de un evento realizado aparece en GET /favoritos con realizado: true", async () => {
    const token = await loginCompradorLucas();

    // evt_divididos es el evento en el pasado en el seed
    await request(app)
      .post("/favoritos/evt_divididos")
      .set("Authorization", `Bearer ${token}`);

    const resList = await request(app)
      .get("/favoritos")
      .set("Authorization", `Bearer ${token}`);
    expect(resList.status).toBe(200);
    const favDivididos = resList.body.find((e) => e.id === "evt_divididos");
    expect(favDivididos).toBeDefined();
    expect(favDivididos.realizado).toBe(true);
    expect(favDivididos.esFavorito).toBe(true);
  });

  // 10. Un comprador recién registrado (por /auth/register) tiene la lista vacía (200 con []), nunca null.
  test("10. Comprador recién registrado tiene la lista de favoritos vacía (200 con []), nunca null", async () => {
    const resReg = await request(app).post("/auth/register").send({
      nombre: "Agustina",
      apellido: "Gómez",
      email: "agustina.nueva@test.com",
      password: "Password123",
      rol: "COMPRADOR",
    });
    expect(resReg.status).toBe(201);
    const tokenNuevo = resReg.body.token;

    const resFav = await request(app)
      .get("/favoritos")
      .set("Authorization", `Bearer ${tokenNuevo}`);
    expect(resFav.status).toBe(200);
    expect(resFav.body).toEqual([]);
    expect(resFav.body).not.toBeNull();
  });

  // 11. POST /dev/reset restaura el seed (Lucas con evt_cosquin) y borra los favoritos de cuentas registradas.
  test("11. POST /dev/reset restaura el seed (Lucas con evt_cosquin) y borra favoritos de cuentas registradas", async () => {
    const tokenLucas = await loginCompradorLucas();

    // Lucas agrega otro favorito
    await request(app)
      .post("/favoritos/evt_teatro")
      .set("Authorization", `Bearer ${tokenLucas}`);

    // Registro de cuenta nueva que agrega favorito
    const resReg = await request(app).post("/auth/register").send({
      nombre: "Ignacio",
      apellido: "Vázquez",
      email: "ignacio.temp@test.com",
      password: "Password123",
      rol: "COMPRADOR",
    });
    const tokenIgnacio = resReg.body.token;
    await request(app)
      .post("/favoritos/evt_recital_charly")
      .set("Authorization", `Bearer ${tokenIgnacio}`);

    // Ejecutar POST /dev/reset
    const resReset = await request(app).post("/dev/reset");
    expect(resReset.status).toBe(200);
    expect(resReset.body.ok).toBe(true);

    // Re-login con Lucas: debe volver a tener EXACTAMENTE un favorito (evt_cosquin)
    const tokenLucasPostReset = await loginCompradorLucas();
    const resFavLucas = await request(app)
      .get("/favoritos")
      .set("Authorization", `Bearer ${tokenLucasPostReset}`);
    expect(resFavLucas.status).toBe(200);
    expect(resFavLucas.body.length).toBe(1);
    expect(resFavLucas.body[0].id).toBe("evt_cosquin");

    // La cuenta creada (Ignacio) ya no existe
    const resLoginIgnacio = await request(app).post("/auth/login").send({
      email: "ignacio.temp@test.com",
      password: "Password123",
    });
    expect(resLoginIgnacio.status).toBe(401);
  });
});
