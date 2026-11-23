import request from "supertest";
import app from "../src/app.js";
import { sesionRepository } from "../src/repositories/SesionRepository.js";
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

describe("BLOQUE A7: Pruebas de Autenticación Real (Registro, Login, Sesiones)", () => {
  beforeEach(async () => {
    process.env.ENABLE_SIMULATED_AUTH = "false";
    process.env.ENABLE_DEV_ENDPOINTS = "true";
    await inicializarSeedInMemory();
  });

  afterAll(async () => {
    process.env.ENABLE_SIMULATED_AUTH = "true";
  });

  // 1. Registrar COMPRADOR y ORGANIZADOR
  test("1. Registrar COMPRADOR y ORGANIZADOR: 201, token presente, usuario sin passwordHash", async () => {
    const resComp = await request(app).post("/auth/register").send({
      nombre: "Carlos",
      apellido: "Pérez",
      email: "carlos.perez@test.com",
      password: "Password123",
      rol: "COMPRADOR",
    });
    expect(resComp.status).toBe(201);
    expect(resComp.body.token).toBeDefined();
    expect(typeof resComp.body.token).toBe("string");
    expect(resComp.body.usuario).toBeDefined();
    expect(resComp.body.usuario.nombre).toBe("Carlos");
    expect(resComp.body.usuario.apellido).toBe("Pérez");
    expect(resComp.body.usuario.email).toBe("carlos.perez@test.com");
    expect(resComp.body.usuario.rol).toBe("COMPRADOR");
    expect(resComp.body.usuario.passwordHash).toBeUndefined();
    expect(resComp.body.usuario.password).toBeUndefined();

    // Organizador sin apellido (opcional)
    const resOrg = await request(app).post("/auth/register").send({
      nombre: "Mega Shows Producciones",
      email: "info@megashows.com",
      password: "Password123",
      rol: "ORGANIZADOR",
    });
    expect(resOrg.status).toBe(201);
    expect(resOrg.body.token).toBeDefined();
    expect(resOrg.body.usuario.nombre).toBe("Mega Shows Producciones");
    expect(resOrg.body.usuario.rol).toBe("ORGANIZADOR");
    expect(resOrg.body.usuario.passwordHash).toBeUndefined();
  });

  // 2. Email duplicado (también con otras mayúsculas)
  test("2. Email duplicado (case-insensitive): 409 EMAIL_YA_REGISTRADO", async () => {
    await request(app).post("/auth/register").send({
      nombre: "Pedro",
      apellido: "Gómez",
      email: "pedro.gomez@test.com",
      password: "Password123",
      rol: "COMPRADOR",
    });

    const resDup = await request(app).post("/auth/register").send({
      nombre: "Pedro Segundo",
      apellido: "Gómez",
      email: "PEDRO.GOMEZ@TEST.COM",
      password: "Password456",
      rol: "COMPRADOR",
    });
    expect(resDup.status).toBe(409);
    expect(resDup.body.error.code).toBe("EMAIL_YA_REGISTRADO");
  });

  // 3. Rol inválido e inyección de campos propios
  test("3. Rol inválido da 400; campos extra como id y passwordHash son ignorados", async () => {
    // Rol ADMIN -> 400
    const resAdmin = await request(app).post("/auth/register").send({
      nombre: "Admin",
      apellido: "Root",
      email: "admin@test.com",
      password: "Password123",
      rol: "ADMIN",
    });
    expect(resAdmin.status).toBe(400);

    // Rol en minúsculas -> 400
    const resMin = await request(app).post("/auth/register").send({
      nombre: "Juan",
      apellido: "Test",
      email: "juan@test.com",
      password: "Password123",
      rol: "comprador",
    });
    expect(resMin.status).toBe(400);

    // Inyección de id y passwordHash propios ignorada
    const resInjected = await request(app).post("/auth/register").send({
      id: "usr_hacker_custom",
      passwordHash: "hash_inventado_falso",
      nombre: "Valeria",
      apellido: "Ríos",
      email: "valeria.rios@test.com",
      password: "Password123",
      rol: "COMPRADOR",
    });
    expect(resInjected.status).toBe(201);
    expect(resInjected.body.usuario.id).not.toBe("usr_hacker_custom");
    expect(resInjected.body.usuario.passwordHash).toBeUndefined();
  });

  // 4. Validaciones de formato
  test("4. Email inválido, contraseña débil o corta, nombre vacío y comprador sin apellido: 400", async () => {
    // Email inválido
    const r1 = await request(app).post("/auth/register").send({
      nombre: "A",
      apellido: "B",
      email: "no-es-email",
      password: "Password123",
      rol: "COMPRADOR",
    });
    expect(r1.status).toBe(400);
    expect(r1.body.error.code).toBe("DATOS_INVALIDOS");

    // Contraseña menor a 8 caracteres
    const r2 = await request(app).post("/auth/register").send({
      nombre: "A",
      apellido: "B",
      email: "valido@test.com",
      password: "Pass1",
      rol: "COMPRADOR",
    });
    expect(r2.status).toBe(400);

    // Contraseña sin números
    const r3 = await request(app).post("/auth/register").send({
      nombre: "A",
      apellido: "B",
      email: "valido2@test.com",
      password: "SoloLetrasYMasLetras",
      rol: "COMPRADOR",
    });
    expect(r3.status).toBe(400);

    // Contraseña sin letras
    const r4 = await request(app).post("/auth/register").send({
      nombre: "A",
      apellido: "B",
      email: "valido3@test.com",
      password: "1234567890123",
      rol: "COMPRADOR",
    });
    expect(r4.status).toBe(400);

    // Nombre vacío
    const r5 = await request(app).post("/auth/register").send({
      nombre: "   ",
      apellido: "B",
      email: "valido4@test.com",
      password: "Password123",
      rol: "COMPRADOR",
    });
    expect(r5.status).toBe(400);

    // Comprador sin apellido
    const r6 = await request(app).post("/auth/register").send({
      nombre: "CompradorSinApellido",
      email: "valido5@test.com",
      password: "Password123",
      rol: "COMPRADOR",
    });
    expect(r6.status).toBe(400);
  });

  // 5. Login correcto y credenciales incorrectas con mismo mensaje y código
  test("5. Login correcto 200 y uso en GET /usuarios/me; contraseña incorrecta y email inexistente devuelven 401 idéntico", async () => {
    // Login con cuenta del seed
    const resLogin = await request(app).post("/auth/login").send({
      email: "lucas@test.com",
      password: DEMO_PASSWORD,
    });
    expect(resLogin.status).toBe(200);
    expect(resLogin.body.token).toBeDefined();
    expect(resLogin.body.usuario.email).toBe("lucas@test.com");

    // Token utilizable en /usuarios/me
    const resMe = await request(app)
      .get("/usuarios/me")
      .set("Authorization", `Bearer ${resLogin.body.token}`);
    expect(resMe.status).toBe(200);
    expect(resMe.body.email).toBe("lucas@test.com");

    // Contraseña incorrecta
    const resWrongPass = await request(app).post("/auth/login").send({
      email: "lucas@test.com",
      password: "PasswordErroneo999",
    });
    expect(resWrongPass.status).toBe(401);
    expect(resWrongPass.body.error.code).toBe("CREDENCIALES_INVALIDAS");
    expect(resWrongPass.body.error.message).toBe("Email o contraseña incorrectos");

    // Email inexistente
    const resNoEmail = await request(app).post("/auth/login").send({
      email: "nadie.inexistente@noexiste.com",
      password: "PasswordErroneo999",
    });
    expect(resNoEmail.status).toBe(401);
    expect(resNoEmail.body.error.code).toBe("CREDENCIALES_INVALIDAS");
    expect(resNoEmail.body.error.message).toBe("Email o contraseña incorrectos");
  });

  // 6. Sin token, token inventado, token mal formado y token vencido
  test("6. Sin token, inventado, mal formado y vencido: 401 NO_AUTENTICADO", async () => {
    // Sin token
    const rSin = await request(app).get("/usuarios/me");
    expect(rSin.status).toBe(401);
    expect(rSin.body.error.code).toBe("NO_AUTENTICADO");

    // Token inventado
    const rInv = await request(app)
      .get("/usuarios/me")
      .set("Authorization", "Bearer 11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff");
    expect(rInv.status).toBe(401);
    expect(rInv.body.error.code).toBe("NO_AUTENTICADO");

    // Token mal formado
    const rMal = await request(app)
      .get("/usuarios/me")
      .set("Authorization", "TokenInvalidoSinBearer");
    expect(rMal.status).toBe(401);
    expect(rMal.body.error.code).toBe("NO_AUTENTICADO");

    // Token vencido
    const resLogin = await request(app).post("/auth/login").send({
      email: "lucas@test.com",
      password: DEMO_PASSWORD,
    });
    const token = resLogin.body.token;

    // Simular vencimiento retrocediendo creadoEn a hace 25 horas
    const sesion = sesionRepository.sesiones.get(token);
    sesion.creadoEn = Date.now() - 25 * 60 * 60 * 1000;

    const rVencido = await request(app)
      .get("/usuarios/me")
      .set("Authorization", `Bearer ${token}`);
    expect(rVencido.status).toBe(401);
    expect(rVencido.body.error.code).toBe("NO_AUTENTICADO");
  });

  // 7. x-user-id rechazado cuando ENABLE_SIMULATED_AUTH está apagada y aceptado cuando está encendida
  test("7. x-user-id es rechazado con ENABLE_SIMULATED_AUTH=false y aceptado con true", async () => {
    process.env.ENABLE_SIMULATED_AUTH = "false";
    const resApagada = await request(app)
      .get("/eventos/mios")
      .set("x-user-id", "usr_org_rock");
    expect(resApagada.status).toBe(401);

    process.env.ENABLE_SIMULATED_AUTH = "true";
    const resEncendida = await request(app)
      .get("/eventos/mios")
      .set("x-user-id", "usr_org_rock");
    expect(resEncendida.status).toBe(200);

    process.env.ENABLE_SIMULATED_AUTH = "false";
  });

  // 8. Logout invalida el token
  test("8. Logout: el token deja de servir inmediatamente", async () => {
    const resLogin = await request(app).post("/auth/login").send({
      email: "lucas@test.com",
      password: DEMO_PASSWORD,
    });
    const token = resLogin.body.token;

    const resLogout = await request(app)
      .post("/auth/logout")
      .set("Authorization", `Bearer ${token}`);
    expect(resLogout.status).toBe(204);

    const resDespues = await request(app)
      .get("/usuarios/me")
      .set("Authorization", `Bearer ${token}`);
    expect(resDespues.status).toBe(401);
    expect(resDespues.body.error.code).toBe("NO_AUTENTICADO");
  });

  // 9. Ausencia de passwordHash y password en todas las respuestas; email ausente fuera de /usuarios/me
  test("9. Ninguna respuesta contiene passwordHash ni password; respuestas fuera de /usuarios/me no tienen email", async () => {
    const resReg = await request(app).post("/auth/register").send({
      nombre: "Auditor",
      apellido: "Seguridad",
      email: "auditor@seguridad.com",
      password: "Password123",
      rol: "ORGANIZADOR",
    });
    const token = resReg.body.token;

    expect(containsKeyRecursive(resReg.body, "passwordHash")).toBe(false);
    expect(containsKeyRecursive(resReg.body, "password")).toBe(false);

    const resMe = await request(app)
      .get("/usuarios/me")
      .set("Authorization", `Bearer ${token}`);
    expect(containsKeyRecursive(resMe.body, "passwordHash")).toBe(false);
    expect(containsKeyRecursive(resMe.body, "password")).toBe(false);
    expect(resMe.body.email).toBeDefined();

    const resEvt = await request(app)
      .get("/eventos")
      .set("Authorization", `Bearer ${token}`);
    expect(containsKeyRecursive(resEvt.body, "passwordHash")).toBe(false);
    expect(containsKeyRecursive(resEvt.body, "password")).toBe(false);
    expect(containsKeyRecursive(resEvt.body, "email")).toBe(false);

    const resCompras = await request(app)
      .get("/compras/mias")
      .set("Authorization", `Bearer ${token}`);
    expect(containsKeyRecursive(resCompras.body, "passwordHash")).toBe(false);
    expect(containsKeyRecursive(resCompras.body, "password")).toBe(false);
    expect(containsKeyRecursive(resCompras.body, "email")).toBe(false);
  });

  // 10. Autorización por rol con tokens reales
  test("10. Autorización por rol con tokens reales: comprador no puede crear eventos, organizador sí y comprador puede comprar", async () => {
    const regComp = await request(app).post("/auth/register").send({
      nombre: "Comprador",
      apellido: "Real",
      email: "comp.real@test.com",
      password: "Password123",
      rol: "COMPRADOR",
    });
    const tokenComp = regComp.body.token;

    const regOrg = await request(app).post("/auth/register").send({
      nombre: "Productora Nueva",
      email: "prod.nueva@test.com",
      password: "Password123",
      rol: "ORGANIZADOR",
    });
    const tokenOrg = regOrg.body.token;

    // Comprador intenta crear evento -> 403
    const fechaFutura = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();
    const resCrearDenegado = await request(app)
      .post("/eventos")
      .set("Authorization", `Bearer ${tokenComp}`)
      .send({
        nombre: "Evento Prohibido",
        descripcion: "No debería poder crearse",
        fecha: fechaFutura,
        categoria: "cat_recitales",
        tiposEntrada: [{ nombre: "General", precio: 1000, cupo: 10 }],
      });
    expect(resCrearDenegado.status).toBe(403);

    // Organizador crea evento -> 201
    const resCrearOk = await request(app)
      .post("/eventos")
      .set("Authorization", `Bearer ${tokenOrg}`)
      .send({
        nombre: "Concierto Especial de Prueba",
        descripcion: "Creado por organizador con token real",
        fecha: fechaFutura,
        categoria: "cat_recitales",
        tiposEntrada: [{ nombre: "Platea", precio: 5000, cupo: 50 }],
      });
    expect(resCrearOk.status).toBe(201);
    const eventoId = resCrearOk.body.id;
    const tipoEntradaId = resCrearOk.body.tiposEntrada[0].id;

    // Organizador lo ve en /eventos/mios
    const resMios = await request(app)
      .get("/eventos/mios")
      .set("Authorization", `Bearer ${tokenOrg}`);
    expect(resMios.status).toBe(200);
    expect(resMios.body.some((e) => e.id === eventoId)).toBe(true);

    // Comprador compra entrada del evento -> 201
    const resCompra = await request(app)
      .post("/compras")
      .set("Authorization", `Bearer ${tokenComp}`)
      .send({
        eventoId,
        tipoEntradaId,
        cantidad: 2,
      });
    expect(resCompra.status).toBe(201);
    expect(resCompra.body.estado).toBe("PENDIENTE");
  });

  // 11. GET /usuarios y GET /usuarios/:id ya no existen (404)
  test("11. GET /usuarios y GET /usuarios/:id responden 404 Not Found", async () => {
    const resLogin = await request(app).post("/auth/login").send({
      email: "lucas@test.com",
      password: DEMO_PASSWORD,
    });
    const token = resLogin.body.token;

    const rList = await request(app)
      .get("/usuarios")
      .set("Authorization", `Bearer ${token}`);
    expect(rList.status).toBe(404);

    const rId = await request(app)
      .get("/usuarios/usr_comprador_1")
      .set("Authorization", `Bearer ${token}`);
    expect(rId.status).toBe(404);
  });

  // 12. POST /dev/reset elimina usuarios registrados y sesiones, restaurando el seed
  test("12. POST /dev/reset restaura el seed eliminando sesiones y cuentas creadas", async () => {
    // Registrar usuario temporal
    const resReg = await request(app).post("/auth/register").send({
      nombre: "Temporal",
      apellido: "User",
      email: "temp.user@test.com",
      password: "Password123",
      rol: "COMPRADOR",
    });
    const token = resReg.body.token;

    // Resetear
    const resReset = await request(app).post("/dev/reset");
    expect(resReset.status).toBe(200);

    // El token anterior ya no debe existir
    const resTokenMuerto = await request(app)
      .get("/usuarios/me")
      .set("Authorization", `Bearer ${token}`);
    expect(resTokenMuerto.status).toBe(401);

    // El usuario temporal ya no puede loguearse
    const resLoginTemp = await request(app).post("/auth/login").send({
      email: "temp.user@test.com",
      password: "Password123",
    });
    expect(resLoginTemp.status).toBe(401);

    // Las cuentas del seed siguen funcionando con Demo1234
    const resLoginSeed = await request(app).post("/auth/login").send({
      email: "lucas@test.com",
      password: DEMO_PASSWORD,
    });
    expect(resLoginSeed.status).toBe(200);
  });
});
