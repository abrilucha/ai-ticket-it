import request from "supertest";
import app from "../src/app.js";
import { inicializarSeedInMemory } from "../src/data/seedInMemory.js";

async function runCheckpoint() {
  await inicializarSeedInMemory();
  console.log("================================================================================");
  console.log("               CHECKPOINT ETAPA 5: CHAT DE LA COMPRA (END-TO-END)               ");
  console.log("================================================================================\n");

  const comprador = "usr_comprador_1"; // Lucas García
  const organizador = "usr_org_rock";  // Productora Rock Nacional
  const tercero = "usr_comprador_2";    // Mariana López

  // 1. Crear compra, pagar y conversación de 4 mensajes alternados
  console.log("--- PASO 1: Crear compra, pagar y conversación de 4 mensajes alternando roles ---");
  const compraRes = await request(app)
    .post("/compras")
    .set("x-user-id", comprador)
    .send({ eventoId: "evt_cosquin", tipoEntradaId: "tipo_rock_1", cantidad: 2 });
  const compraId = compraRes.body.id;
  console.log(`[COMPRADOR] Compra creada: ${compraId} | Estado: ${compraRes.body.estado}`);

  const pagarRes = await request(app)
    .post(`/compras/${compraId}/pagar`)
    .set("x-user-id", comprador);
  console.log(`[COMPRADOR] Compra pagada | Estado actual: ${pagarRes.body.estado}`);

  // Conversación de 4 mensajes:
  console.log("\n-> Iniciando conversación de 4 mensajes alternados:");
  const m1 = await request(app)
    .post(`/compras/${compraId}/mensajes`)
    .set("x-user-id", comprador)
    .send({ texto: "Hola, ¿el ingreso es con DNI físico o digital?" });
  console.log(`  1. [${m1.body.autor.rol} - ${m1.body.autor.nombre}]: "${m1.body.texto}" (esPropio: ${m1.body.esPropio})`);

  const m2 = await request(app)
    .post(`/compras/${compraId}/mensajes`)
    .set("x-user-id", organizador)
    .send({ texto: "Hola Lucas, podés presentar cualquiera de los dos, con el código QR de la app." });
  console.log(`  2. [${m2.body.autor.rol} - ${m2.body.autor.nombre}]: "${m2.body.texto}" (esPropio: ${m2.body.esPropio})`);

  const m3 = await request(app)
    .post(`/compras/${compraId}/mensajes`)
    .set("x-user-id", comprador)
    .send({ texto: "¡Excelente! ¿Habrá guardarropas en el predio?" });
  console.log(`  3. [${m3.body.autor.rol} - ${m3.body.autor.nombre}]: "${m3.body.texto}" (esPropio: ${m3.body.esPropio})`);

  const m4 = await request(app)
    .post(`/compras/${compraId}/mensajes`)
    .set("x-user-id", organizador)
    .send({ texto: "Sí, habrá servicio de guardarropas en el ingreso 2." });
  console.log(`  4. [${m4.body.autor.rol} - ${m4.body.autor.nombre}]: "${m4.body.texto}" (esPropio: ${m4.body.esPropio})`);

  const getChat = await request(app)
    .get(`/compras/${compraId}/mensajes`)
    .set("x-user-id", comprador);
  console.log(`\nGET /compras/${compraId}/mensajes (visto por Comprador - total ${getChat.body.length} mensajes ordenados cronológicamente):`);
  console.log(JSON.stringify(getChat.body, null, 2));

  // 2. Cancelar la compra (queda REEMBOLSADA) y seguir enviando y leyendo
  console.log("\n--- PASO 2: Cancelar compra (pasa a REEMBOLSADA) y seguir usando el chat ---");
  const cancelRes = await request(app)
    .post(`/compras/${compraId}/cancelar`)
    .set("x-user-id", comprador);
  console.log(`[COMPRADOR] Cancelación solicitada | Nuevo estado: ${cancelRes.body.estado} | Monto reembolsado: $${cancelRes.body.montoReembolsado}`);

  const mReembolso = await request(app)
    .post(`/compras/${compraId}/mensajes`)
    .set("x-user-id", comprador)
    .send({ texto: "¿En cuántos días hábiles veo reflejado el reembolso en mi tarjeta?" });
  console.log(`[COMPRADOR sobre compra ${cancelRes.body.estado}] Mensaje enviado (Status: ${mReembolso.status}): "${mReembolso.body.texto}"`);

  const mRespReembolso = await request(app)
    .post(`/compras/${compraId}/mensajes`)
    .set("x-user-id", organizador)
    .send({ texto: "Hola, el reintegro demora entre 48 y 72 hs hábiles según tu banco." });
  console.log(`[ORGANIZADOR sobre compra ${cancelRes.body.estado}] Respuesta enviada (Status: ${mRespReembolso.status}): "${mRespReembolso.body.texto}"`);

  // 3. Envío sobre una compra CANCELADA (desde pendiente) y una UTILIZADA
  console.log("\n--- PASO 3: Chat sobre compras CANCELADA (desde pendiente) y UTILIZADA ---");
  // Compra cancelada desde pendiente
  const cPendiente = await request(app)
    .post("/compras")
    .set("x-user-id", comprador)
    .send({ eventoId: "evt_cosquin", tipoEntradaId: "tipo_rock_1", cantidad: 1 });
  await request(app).post(`/compras/${cPendiente.body.id}/cancelar`).set("x-user-id", comprador);
  const mCancelada = await request(app)
    .post(`/compras/${cPendiente.body.id}/mensajes`)
    .set("x-user-id", comprador)
    .send({ texto: "Consulta sobre compra cancelada antes de pagar" });
  console.log(`[COMPRA CANCELADA] Status POST: ${mCancelada.status} | Texto: "${mCancelada.body.texto}"`);

  // Compra utilizada
  const mUtilizada = await request(app)
    .post("/compras/cmp_utilizada_1/mensajes")
    .set("x-user-id", comprador)
    .send({ texto: "¡Muchas gracias por todo! El recital estuvo increíble." });
  console.log(`[COMPRA UTILIZADA] Status POST: ${mUtilizada.status} | Texto: "${mUtilizada.body.texto}"`);

  // 4. Mostrar 403 de un tercero y 404 de compra inexistente
  console.log("\n--- PASO 4: Pruebas de seguridad (403 Tercero y 404 Compra Inexistente) ---");
  const res403 = await request(app)
    .post(`/compras/${compraId}/mensajes`)
    .set("x-user-id", tercero)
    .send({ texto: "Intento espiar esta compra ajena" });
  console.log(`[403 FORBIDDEN] Tercero intenta POST: Status ${res403.status} | Detalle: ${res403.body.message}`);

  const res404 = await request(app)
    .get("/compras/compra_inexistente_9999/mensajes")
    .set("x-user-id", comprador);
  console.log(`[404 NOT FOUND] GET a compra inexistente: Status ${res404.status} | Detalle: ${res404.body.message}`);

  console.log("\n================================================================================");
  console.log("                    CHECKPOINT FINALIZADO CON ÉXITO                             ");
  console.log("================================================================================");
}

runCheckpoint().catch(console.error);
