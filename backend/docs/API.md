# Contrato de API y Especificación de Endpoints - AI Ticket It

Documento de referencia para el módulo Front-End (React Native) y Back-End (Node + Express).
Persistencia 100% en memoria, autenticación simulada mediante header HTTP `x-user-id`.

---

## 1. Valores Exactos de Enumerados (Enums)

### Roles de Usuario (`RolUsuario`)
- `COMPRADOR`: Usuario cliente que busca eventos, compra entradas, paga, cancela reservas, chatea y califica eventos utilizados.
- `ORGANIZADOR`: Productora o teatro que crea y administra eventos, valida entradas (`UTILIZADA`), chatea con compradores y visualiza métricas de ventas.

### Estados de Compra (`EstadoCompra`)
- `PENDIENTE`: Compra recién creada. Reserva y descuenta cupo inmediatamente. Puede pagarse o cancelarse.
- `CONFIRMADA`: Compra pagada exitosamente. Mantiene cupo descontado y expone `diasRestantes`. Puede utilizarse al ingresar o cancelarse con reembolso.
- `UTILIZADA`: Entrada validada por el organizador en el acceso al evento. Bloquea cancelaciones y habilita calificación/reseña única.
- `CANCELADA`: Reserva en estado `PENDIENTE` cancelada antes de pagar. Libera el cupo.
- `REEMBOLSADA`: Compra `CONFIRMADA` cancelada antes del evento. Libera el cupo y registra `montoReembolsado`.

### Categorías Precargadas (`Categoria`)
- `cat_recitales`: Recitales y Conciertos (`recitales_y_conciertos`)
- `cat_teatro`: Obras de Teatro (`obras_de_teatro`)
- `cat_festivales`: Festivales (`festivales`)
- `cat_deportes`: Deportes (`deportes`)
- `cat_conferencias`: Conferencias y Charlas (`conferencias_y_charlas`)

---

## 2. Autenticación y Formato Uniforme de Errores

### Autenticación Simulada
Todas las rutas (excepto las públicas `GET /health` y `GET /usuarios`) requieren el header:
```http
x-user-id: <id_usuario>
```
Si falta el header o el usuario no existe en memoria, el servidor responde **401 Unauthorized**.

### Formato Uniforme de Respuesta de Error
```json
{
  "error": {
    "code": "CODIGO_ERROR",
    "message": "Descripción legible de la causa del error"
  },
  "status": "fail",
  "statusCode": 400,
  "message": "Descripción legible de la causa del error",
  "timestamp": "2026-11-08T04:50:00.000Z"
}
```

---

## 3. Inventario Completo de Endpoints

### 3.1. Salud y Usuarios

#### `GET /health`
- **Rol:** Público (sin autenticación).
- **Respuesta 200:** `{ "status": "ok", "uptime": 123.45 }`

#### `GET /usuarios`
- **Rol:** Público (sin autenticación). Lista los usuarios para selector de sesión en la app.
- **Respuesta 200:** `[ { "id", "nombre", "apellido", "email", "rol", "favoritos" } ]`

---

### 3.2. Categorías

#### `GET /categorias`
- **Rol:** Autenticado (`COMPRADOR` u `ORGANIZADOR`).
- **Respuesta 200:** `[ { "id", "nombre", "codigo", "descripcion" } ]`

---

### 3.3. Eventos y Catálogo

#### `GET /eventos`
- **Rol:** Autenticado (`COMPRADOR` u `ORGANIZADOR`).
- **Query params:**
  - `q` (búsqueda textual insensible a acentos/tildes y segura con caracteres especiales)
  - `categoria` (id o slug)
  - `orden` (`precio` | `fecha` | `puntaje`, default `fecha`)
  - `direccion` (`asc` | `desc`, default `asc`, excepto `puntaje` que es `desc`)
  - `incluirRealizados` (boolean, default `false`)
- **Respuesta 200:** Lista de eventos enriquecidos:
  ```json
  [
    {
      "id": "evt_cosquin",
      "nombre": "Cosquín Rock 2027",
      "descripcion": "...",
      "categoria": { "id", "nombre" },
      "fecha": "2027-02-10T20:00:00.000Z",
      "realizado": false,
      "precioMinimo": 25000,
      "puntajeOrganizador": 4.0,
      "cantidadResenas": 2,
      "organizador": { "id": "usr_org_rock", "nombre": "Productora" },
      "tiposEntrada": [ ... ]
    }
  ]
  ```
- **Errores:** 400 (orden o dirección inválidos), 401.

#### `GET /eventos/:id`
- **Rol:** Autenticado. Devuelve el evento (incluso si está realizado).
- **Respuesta 200:**
  ```json
  {
    "id": "evt_cosquin",
    "nombre": "Cosquín Rock 2027",
    "realizado": false,
    "precioMinimo": 25000,
    "tiposEntrada": [
      {
        "id": "tipo_rock_1",
        "nombre": "Campo General",
        "precio": 25000,
        "cupo": 500,
        "cupoRestante": 496
      }
    ],
    "organizador": {
      "id": "usr_org_rock",
      "nombre": "Productora Rock Nacional",
      "puntajePromedio": 4.0,
      "cantidadResenas": 2,
      "resenas": [
        {
          "id": "res_1",
          "puntaje": 5,
          "comentario": "¡Increíble!",
          "fecha": "2026-11-04T00:00:00.000Z",
          "evento": { "id", "nombre" },
          "autor": { "id", "nombre" }
        }
      ]
    }
  }
  ```
- **Errores:** 401, 404 (no encontrado).

#### `POST /eventos`
- **Rol:** Exclusivo `ORGANIZADOR`.
- **Body JSON:**
  ```json
  {
    "nombre": "Concierto Acústico",
    "descripcion": "Show íntimo acústico en vivo",
    "categoria": "cat_recitales",
    "fecha": "2027-05-20T21:00:00.000Z",
    "tiposEntrada": [
      { "nombre": "General", "precio": 15000, "cupo": 150 }
    ],
    "multimedia": ["https://..."]
  }
  ```
- **Respuesta 201:** Evento creado.
- **Errores:** 400 (fecha no futura S11, nombres de entradas duplicados, validación Zod), 401, 403 (rol no organizador).

#### `GET /eventos/mios`
- **Rol:** Exclusivo `ORGANIZADOR`. Lista eventos creados por el organizador autenticado.
- **Respuesta 200:** `[ Evento ]`
- **Errores:** 401, 403.

#### `GET /eventos/:id/compras`
- **Rol:** Exclusivo `ORGANIZADOR` dueño del evento.
- **Respuesta 200:**
  ```json
  {
    "compras": [ ...compras del evento sin mensajes... ],
    "disponibilidadPorTipo": [
      {
        "tipoEntradaId": "tipo_rock_1",
        "nombre": "Campo General",
        "precio": 25000,
        "cupoTotal": 500,
        "cupoRestante": 496
      }
    ]
  }
  ```
- **Errores:** 401, 403, 404.

#### `GET /eventos/:id/resenas`
- **Rol:** Autenticado.
- **Respuesta 200:**
  ```json
  {
    "puntajePromedio": 5.0,
    "cantidadResenas": 1,
    "resenas": [ ...reseñas exclusivas del evento, de más nueva a más vieja... ]
  }
  ```
- **Errores:** 401, 404.

---

### 3.4. Compras y Ciclo de Vida

#### `POST /compras`
- **Rol:** Exclusivo `COMPRADOR`.
- **Body JSON:** `{ "eventoId": "evt_cosquin", "tipoEntradaId": "tipo_rock_1", "cantidad": 2 }`
- **Respuesta 201:** Compra en estado `PENDIENTE` (reserva y descuenta cupo inmediatamente).
- **Errores:** 400 (cantidad <= 0 o no entera), 401, 403 (no comprador), 404, 409 (cupo insuficiente S3 o evento pasado S11).

#### `GET /compras/mias`
- **Rol:** Exclusivo `COMPRADOR`. Lista compras del comprador autenticado (sin mensajes).
- **Respuesta 200:**
  ```json
  [
    {
      "id": "cmp_123",
      "estado": "CONFIRMADA",
      "total": 50000,
      "diasRestantes": 94,
      "puedePagar": false,
      "puedeCancelar": true,
      "puedeUtilizar": false,
      "puedeResenar": false,
      "resenada": false
    }
  ]
  ```

#### `GET /compras/:id`
- **Rol:** Participantes (`COMPRADOR` titular u `ORGANIZADOR` dueño del evento).
- **Respuesta 200:** Detalle de compra con flags de acción (`puedePagar`, `puedeCancelar`, `puedeUtilizar`, `puedeResenar`, `resenada`) e `historialEstados`. No incluye mensajes.

#### `POST /compras/:id/pagar`
- **Rol:** `COMPRADOR` titular. Transiciona de `PENDIENTE` a `CONFIRMADA`.
- **Respuesta 200:** Compra actualizada en estado `CONFIRMADA`.
- **Errores:** 401, 403, 404, 409 (estado no permite pagar).

#### `POST /compras/:id/utilizar`
- **Rol:** `ORGANIZADOR` dueño del evento. Transiciona de `CONFIRMADA` a `UTILIZADA`.
- **Respuesta 200:** Compra actualizada en estado `UTILIZADA`.
- **Errores:** 401, 403 (organizador ajeno o comprador), 404, 409 (no confirmada o ya utilizada).

#### `POST /compras/:id/cancelar`
- **Rol:** `COMPRADOR` titular. Si era `PENDIENTE` pasa a `CANCELADA`. Si era `CONFIRMADA` pasa a `REEMBOLSADA`.
- **Respuesta 200:** Compra actualizada con `fechaCancelacion` y `montoReembolsado`. Libera el cupo.
- **Errores:** 401, 403 (ajeno u organizador), 404, 409 (evento ya realizado S8/S11, o entrada ya utilizada S8).

---

### 3.5. Chat de la Compra

#### `GET /compras/:id/mensajes`
- **Rol:** `COMPRADOR` titular u `ORGANIZADOR` dueño del evento.
- **Query param opcional:** `desde` (ISO 8601).
- **Respuesta 200:** Mensajes ordenados cronológicamente:
  ```json
  [
    {
      "id": "msg_001",
      "compraId": "cmp_123",
      "texto": "¿A qué hora abren las puertas?",
      "fecha": "2026-11-08T04:20:00.000Z",
      "autor": { "id": "usr_comprador_1", "nombre": "Lucas", "rol": "COMPRADOR" },
      "esPropio": true
    }
  ]
  ```
- **Errores:** 400 (`desde` inválido), 401, 403 (usuario ajeno), 404.

#### `POST /compras/:id/mensajes`
- **Rol:** `COMPRADOR` titular u `ORGANIZADOR` dueño del evento.
- **Body JSON:** `{ "texto": "Respuesta o consulta" }`
- **Respuesta 201:** Mensaje creado con `esPropio: true`. Funciona en cualquier estado de la compra.
- **Errores:** 400 (texto vacío o > 1000 chars), 401, 403, 404.

---

### 3.6. Reseñas y Organizadores

#### `POST /compras/:id/resena`
- **Rol:** Exclusivo `COMPRADOR` titular de una compra en estado `UTILIZADA`.
- **Body JSON:**
  ```json
  {
    "puntaje": 5,
    "comentario": "Excelente recital y organización impecable."
  }
  ```
- **Respuesta 201:**
  ```json
  {
    "id": "res_001",
    "compraId": "cmp_123",
    "puntaje": 5,
    "comentario": "Excelente recital y organización impecable.",
    "fecha": "2026-11-08T04:51:00.000Z",
    "evento": { "id": "evt_teatro", "nombre": "Toc Toc" },
    "autor": { "id": "usr_comprador_1", "nombre": "Lucas" }
  }
  ```
- **Errores:** 400 (puntaje fuera de 1..5, comentario vacío o > 500), 401, 403 (ajeno u organizador), 404, 409 (compra no `UTILIZADA` o compra ya calificada S9).

#### `GET /compras/:id/resena`
- **Rol:** `COMPRADOR` titular u `ORGANIZADOR` del evento.
- **Respuesta 200:** Reseña de la compra.
- **Errores:** 401, 403, 404 (`code: RESENA_NO_ENCONTRADA` si aún no fue calificada).

#### `GET /organizadores/:id`
- **Rol:** Autenticado.
- **Respuesta 200:**
  ```json
  {
    "id": "usr_org_rock",
    "nombre": "Productora Rock Nacional",
    "puntajePromedio": 4.0,
    "cantidadResenas": 2
  }
  ```
- **Errores:** 401, 404 (si no existe o rol != `ORGANIZADOR`).

#### `GET /organizadores/:id/resenas`
- **Rol:** Autenticado.
- **Respuesta 200:**
  ```json
  {
    "puntajePromedio": 4.0,
    "cantidadResenas": 2,
    "resenas": [ ...reseñas de todos sus eventos, de más nueva a más vieja... ]
  }
  ```
- **Errores:** 401, 404.
