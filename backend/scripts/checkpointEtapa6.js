import request from "supertest";
import app from "../src/app.js";
import { inicializarSeedInMemory } from "../src/data/seedInMemory.js";

async function runCheckpointEtapa6() {
  await inicializarSeedInMemory();

  console.log("================================================================================");
  console.log("       CHECKPOINT ETAPA 6: REPUTACIÓN Y RESEÑAS DE ORGANIZADORES (E2E)          ");
  console.log("================================================================================\n");

  const compradorTitular = "usr_comprador_1"; // Lucas
  const compradorAjeno = "usr_comprador_2";   // Mariana
  const orgA = "usr_org_teatro";              // Teatro Gran Rex (arranca sin reseñas)
  const orgB = "usr_org_rock";                // Productora Rock Nacional (arranca con promedio 4.0)

  // 1. Mostrar catálogo orden=puntaje&direccion=desc ANTES
  console.log("--- 1. GET /eventos?orden=puntaje&direccion=desc (ESTADO INICIAL) ---");
  const resAntes = await request(app)
    .get("/eventos?orden=puntaje&direccion=desc&incluirRealizados=true")
    .set("x-user-id", compradorTitular);

  console.log(`Total eventos devueltos: ${resAntes.body.length}`);
  resAntes.body.forEach((ev) => {
    console.log(
      `  - [${ev.id}] "${ev.nombre}" | Organizador: ${ev.organizador.nombre} (${ev.organizador.id}) | puntajeOrganizador: ${ev.puntajeOrganizador} | cantidadResenas: ${ev.cantidadResenas}`
    );
  });

  // 2. Crear compra para evento del Organizador A, pagar, verificar puedeResenar=false y 409 al reseñar
  console.log("\n--- 2. Crear compra para Organizador A, pagar y verificar rechazo de reseña ---");
  const resCompra = await request(app)
    .post("/compras")
    .set("x-user-id", compradorTitular)
    .send({ eventoId: "evt_teatro", tipoEntradaId: "tipo_teatro_1", cantidad: 1 });
  const compraId = resCompra.body.id;
  console.log(`[COMPRADOR] Compra creada: ${compraId} | Estado: ${resCompra.body.estado}`);

  const resPagar = await request(app)
    .post(`/compras/${compraId}/pagar`)
    .set("x-user-id", compradorTitular);
  console.log(`[COMPRADOR] Compra pagada | Estado: ${resPagar.body.estado} | puedeResenar: ${resPagar.body.puedeResenar}`);

  const intentoResenaPrematura = await request(app)
    .post(`/compras/${compraId}/resena`)
    .set("x-user-id", compradorTitular)
    .send({ puntaje: 5, comentario: "Excelente show" });
  console.log(
    `[409 CONFLICT] Intento reseñar compra no utilizada: Status ${intentoResenaPrematura.status} | Mensaje: "${intentoResenaPrematura.body.message}"`
  );

  // 3. Organizador A marca la entrada como utilizada; verificar puedeResenar=true
  console.log("\n--- 3. Organizador A valida y utiliza la entrada ---");
  const resUtilizar = await request(app)
    .post(`/compras/${compraId}/utilizar`)
    .set("x-user-id", orgA);
  console.log(`[ORGANIZADOR A] Entrada utilizada | Estado: ${resUtilizar.body.estado}`);

  const resVerificarComprador = await request(app)
    .get(`/compras/${compraId}`)
    .set("x-user-id", compradorTitular);
  console.log(`[COMPRADOR] Consulta su compra utilizada | puedeResenar: ${resVerificarComprador.body.puedeResenar} | resenada: ${resVerificarComprador.body.resenada}`);

  // 4. Probar rechazos: Organizador (403), Comprador ajeno (403), Puntaje inválido (400)
  console.log("\n--- 4. Validaciones de seguridad y datos ---");
  const resOrgResena = await request(app)
    .post(`/compras/${compraId}/resena`)
    .set("x-user-id", orgA)
    .send({ puntaje: 5, comentario: "Auto-calificación" });
  console.log(`[403 FORBIDDEN] Organizador intenta reseñar: Status ${resOrgResena.status} | Mensaje: "${resOrgResena.body.message}"`);

  const resAjenoResena = await request(app)
    .post(`/compras/${compraId}/resena`)
    .set("x-user-id", compradorAjeno)
    .send({ puntaje: 5, comentario: "Comprador ajeno" });
  console.log(`[403 FORBIDDEN] Comprador ajeno intenta reseñar: Status ${resAjenoResena.status} | Mensaje: "${resAjenoResena.body.message}"`);

  const resPuntajeInvalido = await request(app)
    .post(`/compras/${compraId}/resena`)
    .set("x-user-id", compradorTitular)
    .send({ puntaje: 10, comentario: "Puntaje fuera de escala" });
  console.log(`[400 BAD REQUEST] Puntaje inválido (10): Status ${resPuntajeInvalido.status} | Mensaje: "${resPuntajeInvalido.body.message}"`);

  // 5. El comprador reseña con puntaje 5 (201); probar segundo intento (409)
  console.log("\n--- 5. Calificación exitosa (201) y bloqueo de duplicado (409) ---");
  const resCalifOk = await request(app)
    .post(`/compras/${compraId}/resena`)
    .set("x-user-id", compradorTitular)
    .send({ puntaje: 5, comentario: "¡La comedia fue brillante, nos reímos sin parar!" });
  console.log(`[201 CREATED] Reseña registrada exitosamente:`);
  console.log(JSON.stringify(resCalifOk.body, null, 2));

  const resDuplicada = await request(app)
    .post(`/compras/${compraId}/resena`)
    .set("x-user-id", compradorTitular)
    .send({ puntaje: 5, comentario: "Segundo intento duplicado" });
  console.log(`[409 CONFLICT] Segundo intento sobre la misma compra: Status ${resDuplicada.status} | Mensaje: "${resDuplicada.body.message}"`);

  const resVerificarPost = await request(app)
    .get(`/compras/${compraId}`)
    .set("x-user-id", compradorTitular);
  console.log(`[COMPRADOR] Consulta compra luego de reseñar | puedeResenar: ${resVerificarPost.body.puedeResenar} | resenada: ${resVerificarPost.body.resenada}`);

  // 6. Consultar endpoints del Organizador A y detalle del evento
  console.log("\n--- 6. Consulta de perfil de Organizador A y reseñas acumuladas ---");
  const perfilOrgA = await request(app)
    .get(`/organizadores/${orgA}`)
    .set("x-user-id", compradorTitular);
  console.log(`GET /organizadores/${orgA}:`, JSON.stringify(perfilOrgA.body, null, 2));

  const resenasOrgA = await request(app)
    .get(`/organizadores/${orgA}/resenas`)
    .set("x-user-id", compradorTitular);
  console.log(`GET /organizadores/${orgA}/resenas (total ${resenasOrgA.body.cantidadResenas}):`, JSON.stringify(resenasOrgA.body.resenas, null, 2));

  const detalleEvt = await request(app)
    .get("/eventos/evt_teatro")
    .set("x-user-id", compradorTitular);
  console.log(`GET /eventos/evt_teatro (organizador en detalle):`, JSON.stringify(detalleEvt.body.organizador, null, 2));

  // 7. Mostrar orden por puntaje DESPUÉS: Organizador A (5.0) supera a B (4.0)
  console.log("\n--- 7. GET /eventos?orden=puntaje&direccion=desc (DESPUÉS DE LA RESEÑA) ---");
  const resDespues = await request(app)
    .get("/eventos?orden=puntaje&direccion=desc&incluirRealizados=true")
    .set("x-user-id", compradorTitular);

  resDespues.body.forEach((ev, idx) => {
    console.log(
      `  Posición ${idx + 1}: [${ev.id}] "${ev.nombre}" | Organizador: ${ev.organizador.nombre} (${ev.organizador.id}) | puntajeOrganizador: ${ev.puntajeOrganizador}`
    );
  });

  // 8. Agregar segunda reseña menor con otra compra y mostrar recálculo del promedio
  console.log("\n--- 8. Segunda reseña con puntaje 3 y recálculo automático del promedio de A ---");
  const resCompra2 = await request(app)
    .post("/compras")
    .set("x-user-id", compradorAjeno)
    .send({ eventoId: "evt_teatro", tipoEntradaId: "tipo_teatro_2", cantidad: 1 });
  await request(app).post(`/compras/${resCompra2.body.id}/pagar`).set("x-user-id", compradorAjeno);
  await request(app).post(`/compras/${resCompra2.body.id}/utilizar`).set("x-user-id", orgA);

  const resCalif2 = await request(app)
    .post(`/compras/${resCompra2.body.id}/resena`)
    .set("x-user-id", compradorAjeno)
    .send({ puntaje: 3, comentario: "Buena obra pero asientos un poco apretados en pullman." });
  console.log(`[201 CREATED] Segunda reseña con puntaje 3 registrada para Organizador A`);

  const perfilOrgARecalculado = await request(app)
    .get(`/organizadores/${orgA}`)
    .set("x-user-id", compradorTitular);
  console.log(
    `Nuevo puntaje promedio de Organizador A (esperado: (5 + 3)/2 = 4.0): ${perfilOrgARecalculado.body.puntajePromedio} | Total reseñas: ${perfilOrgARecalculado.body.cantidadResenas}`
  );

  console.log("\n================================================================================");
  console.log("                    CHECKPOINT ETAPA 6 FINALIZADO CON ÉXITO                     ");
  console.log("================================================================================\n");
}

runCheckpointEtapa6().catch(console.error);
