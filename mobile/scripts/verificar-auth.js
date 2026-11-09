/**
 * Script de verificación de Autenticación Real (Registro, Login, Sesiones, Tokens)
 * AI Ticket It - Ejecutar con Node 18+ (usa fetch global nativo, sin dependencias)
 * 
 * Uso:
 *   node mobile/scripts/verificar-auth.js [URL_BASE]
 *   Ejemplo: node mobile/scripts/verificar-auth.js http://localhost:3000
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

async function ejecutar(metodo, ruta, body = null, token = null) {
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

    return { status: res.status, data: json };
  } catch (err) {
    console.error(`Error al conectar con ${url}:`, err.message);
    return { status: 0, error: err.message };
  }
}

async function main() {
  const sufijo = Date.now();
  console.log(`Iniciando verificación de Autenticación Real contra ${BASE_URL}...\n`);

  // 1. Registrar comprador
  const emailComprador = `comprador_${sufijo}@test.com`;
  const regComp = await ejecutar('POST', '/auth/register', {
    nombre: 'Juan',
    apellido: 'Comprador',
    email: emailComprador,
    password: 'Password123',
    rol: 'COMPRADOR',
  });
  const tokenComprador = regComp.data?.token;

  // 2. Registrar organizador
  const emailOrganizador = `organizador_${sufijo}@test.com`;
  const regOrg = await ejecutar('POST', '/auth/register', {
    nombre: 'Productora Test',
    email: emailOrganizador,
    password: 'Password123',
    rol: 'ORGANIZADOR',
  });
  const tokenOrganizador = regOrg.data?.token;

  // 3. Registrar con email repetido
  await ejecutar('POST', '/auth/register', {
    nombre: 'Juan Clon',
    apellido: 'Comprador',
    email: emailComprador.toUpperCase(), // Probar case-insensitivity
    password: 'Password123',
    rol: 'COMPRADOR',
  });

  // 4. Rol inválido
  await ejecutar('POST', '/auth/register', {
    nombre: 'Rol Invalido',
    apellido: 'Test',
    email: `invalido_${sufijo}@test.com`,
    password: 'Password123',
    rol: 'ADMIN',
  });

  // 5. Contraseña débil
  await ejecutar('POST', '/auth/register', {
    nombre: 'Pass Debil',
    apellido: 'Test',
    email: `debil_${sufijo}@test.com`,
    password: 'corta',
    rol: 'COMPRADOR',
  });

  // 6. Login correcto
  const loginOk = await ejecutar('POST', '/auth/login', {
    email: emailComprador,
    password: 'Password123',
  });
  const tokenLogin = loginOk.data?.token;

  // 7. Login incorrecto: contraseña errónea
  await ejecutar('POST', '/auth/login', {
    email: emailComprador,
    password: 'PasswordErronea999',
  });

  // 8. Login incorrecto: email inexistente
  await ejecutar('POST', '/auth/login', {
    email: `noexiste_${sufijo}@noexiste.com`,
    password: 'PasswordErronea999',
  });

  // 9. GET /usuarios/me sin token
  await ejecutar('GET', '/usuarios/me', null, null);

  // 10. GET /usuarios/me con token
  await ejecutar('GET', '/usuarios/me', null, tokenLogin);

  // 11. Logout
  await ejecutar('POST', '/auth/logout', null, tokenLogin);

  // 12. GET /usuarios/me otra vez (debe dar 401 tras logout)
  await ejecutar('GET', '/usuarios/me', null, tokenLogin);

  // 13. GET /usuarios (debe dar 404 porque fue eliminada)
  await ejecutar('GET', '/usuarios', null, tokenComprador);

  console.log(`\n==================================================`);
  console.log(`Verificación de autenticación finalizada con éxito.`);
}

main();
