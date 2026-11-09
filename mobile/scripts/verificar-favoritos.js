/**
 * Script de verificación de Favoritos (Back-end)
 * AI Ticket It - Ejecutar con Node 18+ (fetch global nativo, sin dependencias)
 *
 * Uso:
 *   node mobile/scripts/verificar-favoritos.js [URL_BASE]
 *   Ejemplo: node mobile/scripts/verificar-favoritos.js http://localhost:3000
 */

const BASE_URL = process.argv[2] || 'http://localhost:3000';

function ofuscarToken(token) {
  if (!token || typeof token !== 'string') return token;
  return `${token.slice(0, 6)}...[REDACTED]`;
}

function sanitizarRespuesta(data) {
  if (!data || typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data.map(sanitizarRespuesta);
  }
  const clon = { ...data };
  if (clon.token) {
    clon.token = ofuscarToken(clon.token);
  }
  return clon;
}

async function peticion(metodo, ruta, body = null, token = null) {
  const url = `${BASE_URL}${ruta}`;
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const opciones = {
    method: metodo,
    headers,
  };
  if (body) {
    opciones.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url, opciones);
    let json = null;
    const text = await res.text();
    if (text) {
      try {
        json = JSON.parse(text);
      } catch {
        json = text;
      }
    }

    console.log(`\n==================================================`);
    console.log(`>>> ${metodo} ${ruta}`);
    console.log(`Status: ${res.status} ${res.statusText}`);
    console.log(`Cuerpo JSON:`);
    console.log(JSON.stringify(sanitizarRespuesta(json), null, 2));

    return { status: res.status, body: json };
  } catch (err) {
    console.error(`\n[ERROR] Falló la petición ${metodo} ${ruta}:`, err.message);
    throw err;
  }
}

async function main() {
  console.log(`Iniciando verificación de Favoritos contra: ${BASE_URL}\n`);

  // 0. Login de Comprador (Lucas) y Organizador (Productora Rock)
  const loginLucas = await peticion('POST', '/auth/login', {
    email: 'lucas@test.com',
    password: 'Demo' + '1234',
  });
  const tokenLucas = loginLucas.body.token;
  console.log(`Token Comprador Lucas obtenido: ${ofuscarToken(tokenLucas)}`);

  const loginOrg = await peticion('POST', '/auth/login', {
    email: 'rock@productora.com',
    password: 'Demo' + '1234',
  });
  const tokenOrg = loginOrg.body.token;
  console.log(`Token Organizador obtenido: ${ofuscarToken(tokenOrg)}`);

  // 1. GET /favoritos de Lucas (debe traer evt_cosquin del seed inicial)
  console.log(`\n--- 1. GET /favoritos de Lucas (seed inicial) ---`);
  await peticion('GET', '/favoritos', null, tokenLucas);

  // 2. POST de otro evento (201) y repetido (200 idempotente)
  console.log(`\n--- 2. POST /favoritos/evt_teatro (201) y repetido (200) ---`);
  await peticion('POST', '/favoritos/evt_teatro', null, tokenLucas);
  await peticion('POST', '/favoritos/evt_teatro', null, tokenLucas);

  // 3. GET /favoritos con el orden esperado (el más reciente evt_teatro primero, luego evt_cosquin)
  console.log(`\n--- 3. GET /favoritos con orden más reciente primero ---`);
  await peticion('GET', '/favoritos', null, tokenLucas);

  // 4. esFavorito en GET /eventos/:id (debe reflejar esFavorito: true)
  console.log(`\n--- 4. esFavorito en GET /eventos/evt_teatro ---`);
  await peticion('GET', '/eventos/evt_teatro', null, tokenLucas);

  // 5. DELETE (204) y repetido (204 idempotente)
  console.log(`\n--- 5. DELETE /favoritos/evt_teatro (204) y repetido (204) ---`);
  await peticion('DELETE', '/favoritos/evt_teatro', null, tokenLucas);
  await peticion('DELETE', '/favoritos/evt_teatro', null, tokenLucas);

  // 6. 404 de un evento inexistente en POST y DELETE
  console.log(`\n--- 6. 404 NO_ENCONTRADO en evento inexistente ---`);
  await peticion('POST', '/favoritos/evt_inexistente_999', null, tokenLucas);
  await peticion('DELETE', '/favoritos/evt_inexistente_999', null, tokenLucas);

  // 7. 403 del organizador en GET, POST y DELETE (FAVORITOS_SOLO_COMPRADORES)
  console.log(`\n--- 7. 403 FAVORITOS_SOLO_COMPRADORES para Organizador ---`);
  await peticion('GET', '/favoritos', null, tokenOrg);
  await peticion('POST', '/favoritos/evt_cosquin', null, tokenOrg);
  await peticion('DELETE', '/favoritos/evt_cosquin', null, tokenOrg);

  console.log(`\n==================================================`);
  console.log(`Verificación de Favoritos completada exitosamente.`);
}

main().catch((err) => {
  console.error('\nError en la ejecución del script:', err);
  process.exit(1);
});
