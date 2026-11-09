# AI Ticket It - Back-End (Node.js + Express)

Módulo Back-End para la plataforma de compra y gestión de entradas a espectáculos deportivos, culturales, recitales y conferencias **AI Ticket It**, desarrollado con **Node.js + Express** y arquitectura en capas con persistencia **100% en memoria**.

---

## 📋 Requisitos Previos

- **Node.js**: v18.0.0 o superior (recomendado v20.x o v22.x LTS con soporte nativo de ES Modules).
- **npm**: v9.0.0 o superior.

---

## 🚀 Instalación y Arranque

### 1. Instalar dependencias
```bash
npm install
```

### 2. Modo Desarrollo (con reinicio automático)
```bash
npm run dev
```

### 3. Modo Producción
```bash
npm start
```
> Al iniciar, el servidor escucha en `0.0.0.0` e imprime en consola las direcciones IP locales para conectar directamente la aplicación móvil React Native en la misma red Wi-Fi o red local.

---

## 🧪 Pruebas Automatizadas y Cobertura

### Correr la suite de pruebas completa
```bash
npm test
```

### Correr pruebas con reporte de cobertura
```bash
npm run test:coverage
```
> El proyecto cuenta con **5 suites de pruebas** y **53 tests de integración** (100% aprobados), con más del **85% de cobertura** de código en toda la aplicación.

---

## ⚙️ Variables de Entorno

El servidor funciona de manera autónoma con valores por defecto pero permite configurar:

| Variable | Descripción | Valor por Defecto |
|---|---|---|
| `PORT` | Puerto HTTP donde escucha el servidor | `3000` |
| `ENABLE_DEV_ENDPOINTS` | Habilita rutas de desarrollo como `POST /dev/reset` | `"false"` |
| `ENABLE_SIMULATED_AUTH` | Habilita modo compatibilidad con header `x-user-id` para tests | `"false"` |

---

## 🔐 Autenticación y Registro Real

El sistema cuenta con autenticación real mediante tokens de sesión opacos y hash criptográfico nativo (`crypto.scrypt`):

- **Registro**: `POST /auth/register` con `{ email, password, rol, nombre, apellido? }`. Crea un usuario con rol `COMPRADOR` u `ORGANIZADOR` y devuelve el objeto `usuario` y su `token` de sesión.
- **Login**: `POST /auth/login` con `{ email, password }`. Valida credenciales y emite un `token` válido por 24 horas.
- **Logout**: `POST /auth/logout` con header `Authorization: Bearer <token>`. Revoca inmediatamente la sesión.
- **Peticiones autenticadas**: Se envían con cabecera `Authorization: Bearer <token>`.
- **Recuperación de sesión**: `GET /usuarios/me` devuelve los datos completos del usuario autenticado (incluyendo email).

> **Aviso de persistencia en memoria**: Todas las cuentas registradas dinámicamente y las sesiones activas residen en memoria volátil (Maps y Arrays). Al reiniciar el proceso de Node.js o invocar `POST /dev/reset`, las sesiones se vacían y los usuarios vuelven exclusivamente a las cuentas del seed inicial.

---

## 👥 Cuentas Demo del Seed (Datos de Prueba)

La persistencia en memoria se inicializa automáticamente al arrancar con las siguientes cuentas semilla. Todas comparten la contraseña demo: `Demo1234`.

| ID | Email | Nombre | Rol | Contraseña Demo |
|---|---|---|---|---|
| `usr_comprador_1` | `lucas@test.com` | Lucas García | `COMPRADOR` | `Demo1234` |
| `usr_comprador_2` | `mariana@test.com` | Mariana López | `COMPRADOR` | `Demo1234` |
| `usr_comprador_3` | `sofia@test.com` | Sofía Martínez | `COMPRADOR` | `Demo1234` |
| `usr_org_rock` | `rock@productora.com` | Productora Rock Nacional | `ORGANIZADOR` | `Demo1234` |
| `usr_org_teatro` | `info@granrex.com.ar` | Teatro Gran Rex | `ORGANIZADOR` | `Demo1234` |
| `usr_org_deportes` | `eventos@deportes.org` | Asociación Deportes | `ORGANIZADOR` | `Demo1234` |

---

## 🔄 Reset de Datos en Desarrollo

Para reiniciar el estado del servidor a los datos semilla originales sin reiniciar el proceso:
```http
POST /dev/reset
```
*(Requiere la variable `ENABLE_DEV_ENDPOINTS=true`; si no está activa, responde 404 Not Found).*

---

## 📚 Documentación Adicional

- [API Completa de Endpoints](docs/API.md)
- [Decisiones de Arquitectura y Negocio](docs/DECISIONES.md)
- [Archivo de Peticiones HTTP de Prueba](docs/requests.http)
