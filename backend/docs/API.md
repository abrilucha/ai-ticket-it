# Documentación de la API HTTP - AI Ticket It

## Autenticación Simulada

La plataforma utiliza un esquema de autenticación simulada mediante cabeceras HTTP:
- **Header**: `x-user-id: <id_usuario>`
- **Rutas Públicas**: únicamente `GET /health` y `GET /usuarios` (además de `POST /dev/reset` cuando se encuentre activo en desarrollo).
- Cualquier otra petición sin cabecera o con usuario inexistente recibe `401 Unauthorized` `{ error: { code: "NO_AUTORIZADO", message: "..." } }`.
- Para endpoints con control de acceso por rol (`ORGANIZADOR` o `COMPRADOR`), si el usuario autenticado tiene un rol distinto, recibe `403 Forbidden` `{ error: { code: "ACCESO_DENEGADO", message: "..." } }`.

---

## Formato Uniforme de Respuestas de Error

Todos los errores del sistema responden de manera uniforme con el siguiente esquema JSON:

```json
{
  "error": {
    "code": "CODIGO_DE_ERROR",
    "message": "Descripción clara del error en español"
  },
  "status": "fail",
  "statusCode": 400,
  "message": "Descripción clara del error en español",
  "timestamp": "2026-11-08T05:00:00.000Z"
}
```

En errores internos no controlados (`500 Internal Server Error`), se responde un mensaje genérico protegiendo la seguridad sin filtrar el stack trace hacia el cliente:
```json
{
  "error": {
    "code": "ERROR_INTERNO",
    "message": "Error interno del servidor"
  },
  "status": "error",
  "statusCode": 500,
  "message": "Error interno del servidor",
  "timestamp": "2026-11-08T05:00:00.000Z"
}
```

---

## Estados de la Compra y Máquina de Estados

Los strings exactos que definen el ciclo de vida de una compra (`compra.estado`) en el sistema son:

| String del Estado | Descripción | Transición Permitida |
|---|---|---|
| `"PENDIENTE"` | Estado inicial al reservar entradas. Descuenta cupo. | Puede transicionar a `"CONFIRMADA"` (mediante pago) o a `"CANCELADA"`. |
| `"CONFIRMADA"` | Compra pagada. Descuenta cupo y calcula `diasRestantes`. | Puede transicionar a `"UTILIZADA"` (en evento) o a `"REEMBOLSADA"`. |
| `"UTILIZADA"` | Entrada validada y consumida en el evento. Descuenta cupo. | Estado final. **No permite cancelación ni reembolso**. Habilita calificar (`puedeResenar`). |
| `"CANCELADA"` | Compra cancelada desde estado pendiente. **Libera cupo**. | Estado terminal. No admite transiciones adicionales. |
| `"REEMBOLSADA"` | Compra cancelada desde estado confirmada. **Libera cupo y registra `montoReembolsado = total`**. | Estado terminal. No admite transiciones adicionales. |

---

## Campo `historialEstados`

En la consulta detallada de una compra (`GET /compras/:id`), se incluye el campo `historialEstados`: un arreglo cronológico de los cambios de estado registrados para esa compra.

Cada elemento del historial posee la siguiente estructura:
```json
{
  "id": "cam_a1b2c3d4",
  "compraId": "cmp_confirmada_1",
  "estadoAnterior": "PENDIENTE",
  "estadoNuevo": "CONFIRMADA",
  "fecha": "2026-11-08T03:00:00.000Z",
  "motivo": "Pago confirmado exitosamente"
}
```

---

## Respuesta del Endpoint de Reseñas de Organizador (`GET /organizadores/:id/resenas`)

El contrato original de la Etapa 6 devuelve una estructura plana con el puntaje promedio, cantidad total de reseñas y el arreglo detallado:

```json
{
  "puntajePromedio": 4.0,
  "cantidadResenas": 2,
  "resenas": [
    {
      "id": "res_2",
      "puntaje": 3,
      "comentario": "El sonido en el campo trasero estuvo regular, pero buena onda.",
      "fecha": "2026-11-05T05:00:00.000Z",
      "evento": {
        "id": "evt_divididos",
        "nombre": "Divididos en vivo"
      },
      "autor": {
        "id": "usr_comprador_2",
        "nombre": "Mariana"
      }
    }
  ]
}
```

---

## Tabla Exhaustiva de Rutas Montadas (Total: 25 rutas verificadas en código)

A continuación se lista la totalidad de las 25 rutas registradas en el router de Express mediante introspección dinámica en tiempo de ejecución:

| # | Método | Ruta | Auth Requerida | Rol Permitido | Descripción | Códigos HTTP |
|---|---|---|---|---|---|---|
| 1 | `GET` | `/health` | No | Público | Estado de disponibilidad del servicio | 200 |
| 2 | `GET` | `/usuarios` | No | Público | Lista todos los usuarios cargados en el seed | 200 |
| 3 | `GET` | `/usuarios/me` | Sí | Cualquier rol | Datos del usuario actualmente autenticado | 200, 401 |
| 4 | `GET` | `/usuarios/:id` | Sí | Cualquier rol | Consulta de usuario por su identificador | 200, 401, 404 |
| 5 | `GET` | `/categorias` | Sí | Cualquier rol | Listado de las 5 categorías canónicas fijas | 200, 401 |
| 6 | `GET` | `/eventos/mios` | Sí | `ORGANIZADOR` | Lista los eventos del organizador autenticado | 200, 401, 403 |
| 7 | `GET` | `/eventos` | Sí | Cualquier rol | Exploración, búsqueda (`q`), filtro (`categoria`), orden (`precio`, `fecha`, `puntaje`) e histórico (`incluirRealizados`) | 200, 400, 401 |
| 8 | `POST` | `/eventos` | Sí | `ORGANIZADOR` | Creación de nuevo evento con múltiples tipos de entrada | 201, 400, 401, 403 |
| 9 | `GET` | `/eventos/:id` | Sí | Cualquier rol | Detalle de evento con datos del organizador, cupo restante y reseñas | 200, 401, 404 |
| 10 | `GET` | `/eventos/:id/compras` | Sí | `ORGANIZADOR` | Compras del evento y disponibilidad por tipo de entrada | 200, 401, 403, 404 |
| 11 | `GET` | `/eventos/:id/resenas` | Sí | Cualquier rol | Reseñas asociadas a un evento específico | 200, 401, 404 |
| 12 | `GET` | `/compras/mias` | Sí | `COMPRADOR` | Listado de compras del comprador con badges calculados | 200, 401, 403 |
| 13 | `POST` | `/compras` | Sí | `COMPRADOR` | Creación de compra (`PENDIENTE`) y descuento de cupo | 201, 400, 401, 403, 404, 409 |
| 14 | `GET` | `/compras/:id` | Sí | Participante | Detalle de compra e `historialEstados` | 200, 401, 403, 404 |
| 15 | `POST` | `/compras/:id/pagar` | Sí | `COMPRADOR` | Pasa de `PENDIENTE` a `CONFIRMADA` | 200, 401, 403, 404, 409 |
| 16 | `POST` | `/compras/:id/utilizar` | Sí | `ORGANIZADOR` | Pasa de `CONFIRMADA` a `UTILIZADA` | 200, 401, 403, 404, 409 |
| 17 | `POST` | `/compras/:id/cancelar` | Sí | `COMPRADOR` | Cancela (`CANCELADA` o `REEMBOLSADA`) y libera cupo | 200, 401, 403, 404, 409 |
| 18 | `GET` | `/compras/:id/mensajes` | Sí | Participante | Historial de chat de la compra | 200, 401, 403, 404 |
| 19 | `POST` | `/compras/:id/mensajes` | Sí | Participante | Envía mensaje en el chat de la compra | 201, 400, 401, 403, 404 |
| 20 | `GET` | `/compras/:id/resena` | Sí | Participante | Consulta la reseña de una compra | 200, 401, 403, 404 |
| 21 | `POST` | `/compras/:id/resena` | Sí | `COMPRADOR` | Crea reseña en compra `UTILIZADA` (puntaje 1 a 5 y comentario) | 201, 400, 401, 403, 404, 409 |
| 22 | `GET` | `/organizadores/:id` | Sí | Cualquier rol | **Contrato original Etapa 6**: Perfil del organizador (`id`, `nombre`, `puntajePromedio`, `cantidadResenas`) | 200, 401, 404 |
| 23 | `GET` | `/organizadores/:id/reputacion` | Sí | Cualquier rol | *Alias de `/organizadores/:id`* mantenido para retrocompatibilidad | 200, 401, 404 |
| 24 | `GET` | `/organizadores/:id/resenas` | Sí | Cualquier rol | **Contrato original Etapa 6**: Reseñas acumuladas de los eventos del organizador | 200, 401, 404 |
| 25 | `POST` | `/dev/reset` | No | Entorno Dev | Restaura la persistencia en memoria al seed original (`ENABLE_DEV_ENDPOINTS=true`) | 200, 404 |

---

## Actualizaciones de Contrato (Ajustes Fase 4 / 4b)

1. **Identificadores aleatorios de Tipos de Entrada (`POST /eventos`)**:
   - Al crear un nuevo evento, los tipos de entrada que no especifiquen un identificador propio reciben un id único no predecible generado con formato `tipo_<8_hex>` (mediante `crypto.randomUUID().slice(0, 8)`), garantizando unicidad global entre eventos sin colisiones. Los identificadores del seed original (`tipo_quilmes_campo`, etc.) se preservan intactos.

2. **Alineación de Cupo (`cupoDisponible` y `cupoRestante`)**:
   - En todas las consultas de eventos (`GET /eventos`, `GET /eventos/mios`, `GET /eventos/:id`) y en el desglose de tipos de entrada en compras (`compra.evento.tiposEntrada`), `cupoDisponible` y `cupoRestante` se calculan a través de una única función de dominio compartida (`calcularDisponibilidadTipos`), actuando como sinónimos exactos. Las compras canceladas o reembolsadas liberan el cupo inmediatamente.

3. **Protección de Privacidad de Correo Electrónico**:
   - El atributo `email` no se expone en ninguna respuesta pública o autenticada (`GET /usuarios`, `GET /usuarios/:id`, `GET /eventos`, `GET /eventos/:id`, `GET /eventos/:id/compras`, `GET /compras/:id`, etc.). Únicamente el usuario autenticado puede consultar su propio correo mediante `GET /usuarios/me`.

4. **Banderas de Permisos en Ventas del Organizador (`GET /eventos/:id/compras`)**:
   - Cada objeto compra dentro del arreglo devuelto por `GET /eventos/:id/compras` incluye las banderas de permisos calculadas con la misma lógica de dominio que `GET /compras/:id` (`puedePagar`, `puedeCancelar`, `puedeUtilizar`, `puedeResenar`, `resenada`, `diasRestantes`), permitiendo al cliente móvil decidir acciones directamente a partir de las banderas sin reglas locales de fallback.
