/**
 * Script de verificación de contratos reales de AI Ticket It.
 * Ejecuta contra http://localhost:3000 usando fetch global de Node.js.
 * Imprime exactamente Método, Ruta, Status HTTP y Cuerpo JSON crudo recibido.
 */

const BASE_URL = process.env.API_URL || 'http://localhost:3000';

async function login(email, password = 'Demo1234') {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Login fallido para ${email}: ${res.status} ${errText}`);
  }
  const data = await res.json();
  return data.token;
}

async function call(method, path, headers = {}, body = null) {
  const url = `${BASE_URL}${path}`;
  const reqHeaders = { ...headers };
  const opts = {
    method,
    headers: reqHeaders,
  };

  if (body !== null) {
    reqHeaders['Content-Type'] = 'application/json';
    opts.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  console.log(`\n======================================================`);
  console.log(`[${method}] ${path}`);
  if (headers['Authorization']) {
    console.log(`Authorization: Bearer ${headers['Authorization'].slice(7, 13)}...[REDACTED]`);
  }
  if (body !== null) {
    console.log(`Payload enviado: ${typeof body === 'string' ? body : JSON.stringify(body)}`);
  }

  try {
    const res = await fetch(url, opts);
    console.log(`Status HTTP: ${res.status} ${res.statusText}`);
    const rawText = await res.text();
    console.log(`Cuerpo JSON recibido:\n${rawText}`);
    return { status: res.status, text: rawText };
  } catch (err) {
    console.error(`Error al conectar con ${url}:`, err.message);
    throw err;
  }
}

async function main() {
  console.log('Iniciando verificación de contratos contra:', BASE_URL);

  // Iniciar sesión con las cuentas del seed
  const tokenLucas = await login('lucas.garcia@gmail.com');
  const tokenOrgRock = await login('contacto@rocknacional.com.ar');
  const tokenOrgTeatro = await login('entradas@granrex.com.ar');

  const authLucas = { Authorization: `Bearer ${tokenLucas}` };
  const authOrgRock = { Authorization: `Bearer ${tokenOrgRock}` };
  const authOrgTeatro = { Authorization: `Bearer ${tokenOrgTeatro}` };

  // 1. GET /eventos/evt_cosquin (Lucas) y GET /organizadores/usr_org_rock
  await call('GET', '/eventos/evt_cosquin', authLucas);
  await call('GET', '/organizadores/usr_org_rock', authLucas);

  // 2. GET /eventos/evt_cosquin/compras (usr_org_rock)
  await call('GET', '/eventos/evt_cosquin/compras', authOrgRock);

  // 3. GET y POST /compras/cmp_confirmada_1/mensajes (Lucas y usr_org_rock)
  await call('GET', '/compras/cmp_confirmada_1/mensajes', authLucas);
  await call('POST', '/compras/cmp_confirmada_1/mensajes', authLucas, {
    texto: 'Hola, ¿a qué hora abren las puertas?',
  });
  await call('POST', '/compras/cmp_confirmada_1/mensajes', authOrgRock, {
    texto: 'Hola Lucas, las puertas abren a las 16:00 hs puntual.',
  });
  await call('GET', '/compras/cmp_confirmada_1/mensajes', authOrgRock);

  // 4. GET /compras/cmp_utilizada_sin_resena (Lucas)
  await call('GET', '/compras/cmp_utilizada_sin_resena', authLucas);

  // 5. Errores de reseña 400 (se prueban antes de crear la reseña en cmp_utilizada_sin_resena)
  // 400: Puntaje fuera de rango (6)
  await call('POST', '/compras/cmp_utilizada_sin_resena/resena', authLucas, {
    puntaje: 6,
    comentario: 'Puntaje inválido',
  });
  // 400: Comentario vacío
  await call('POST', '/compras/cmp_utilizada_sin_resena/resena', authLucas, {
    puntaje: 5,
    comentario: '',
  });

  // 6. POST /compras/cmp_utilizada_sin_resena/resena (Lucas con el contrato real { puntaje, comentario }) y GET
  await call('POST', '/compras/cmp_utilizada_sin_resena/resena', authLucas, {
    puntaje: 5,
    comentario: 'Una noche inolvidable, sonido impecable e ingreso muy ágil.',
  });
  await call('GET', '/compras/cmp_utilizada_sin_resena/resena', authLucas);

  // 7. Errores de Chat (400, 403, 404)
  // 400: Texto vacío
  await call('POST', '/compras/cmp_confirmada_1/mensajes', authLucas, {
    texto: '',
  });
  // 400: Texto > 1000 caracteres
  await call('POST', '/compras/cmp_confirmada_1/mensajes', authLucas, {
    texto: 'a'.repeat(1001),
  });
  // 403: Tercero ajeno (usr_org_teatro no participa en la compra)
  await call('POST', '/compras/cmp_confirmada_1/mensajes', authOrgTeatro, {
    texto: 'Intruso intentando comentar',
  });
  // 404: Compra inexistente
  await call('POST', '/compras/cmp_inexistente/mensajes', authLucas, {
    texto: 'Hola',
  });

  // 8. Errores de Reseña (403, 404, 409)
  // 409: Reseña duplicada (cmp_utilizada_sin_resena ya fue calificada en el paso 6)
  await call('POST', '/compras/cmp_utilizada_sin_resena/resena', authLucas, {
    puntaje: 4,
    comentario: 'Intento de calificar por segunda vez',
  });
  // 409: Compra no utilizada (cmp_confirmada_1 está en estado CONFIRMADA)
  await call('POST', '/compras/cmp_confirmada_1/resena', authLucas, {
    puntaje: 5,
    comentario: 'Intento calificar sin haber utilizado la entrada',
  });
  // 403: Organizador intentando reseñar (solo el comprador titular puede)
  await call('POST', '/compras/cmp_utilizada_sin_resena/resena', authOrgRock, {
    puntaje: 5,
    comentario: 'Organizador intentando auto-calificarse',
  });
  // 404: Compra sin reseña asociada
  await call('GET', '/compras/cmp_confirmada_1/resena', authLucas);

  console.log(`\n======================================================`);
  console.log('Verificación completa finalizada con éxito.');
}

main();
