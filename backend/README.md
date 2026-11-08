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

---

## 👥 Usuarios del Seed (Datos de Prueba)

La persistencia en memoria se inicializa automáticamente al arrancar con un conjunto de datos coherente:

| ID de Usuario | Nombre | Rol | Propósito en Pruebas |
|---|---|---|---|
| `usr_comprador_1` | Lucas García | `COMPRADOR` | Titular de compras confirmadas, utilizadas (con y sin reseña) y chat activo. |
| `usr_comprador_2` | Mariana López | `COMPRADOR` | Titular de compra pendiente (para pagar/cancelar) y reseña previa. |
| `usr_comprador_3` | Sofía Martínez | `COMPRADOR` | Usuario comprador limpio para crear compras desde cero. |
| `usr_org_rock` | Productora Rock Nacional | `ORGANIZADOR` | Dueño de Cosquín Rock y evento pasado Divididos con 2 reseñas (promedio 4.0). |
| `usr_org_teatro` | Teatro Gran Rex | `ORGANIZADOR` | Dueño de Toc Toc en Teatro, caso borde: 0 reseñas (`puntajePromedio: null`). |
| `usr_org_deportes` | Asociación Deportes | `ORGANIZADOR` | Dueño de Superclásico, Charly Sinfónico y Lollapalooza. |

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
