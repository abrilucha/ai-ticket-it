# Guion Técnico para la Demostración en Video: AI Ticket It

Este documento constituye el mapa técnico y la guía de referencia paso a paso para la grabación del video demostrativo del proyecto AI Ticket It. Contiene las cadenas de llamadas, componentes, reglas de negocio visibles y archivos clave a presentar.

---

## 1. Flujo Principal: Comprar Entradas y Seguimiento de la Compra

El recorrido demostrativo principal modela el ciclo de vida completo de una entrada desde su selección hasta su canje y reseña post-evento:

```
[Login como Comprador: Lucas García]
                 ↓
[Catálogo de Eventos / Búsqueda] ──> Filtrar por categoría / Ordenar por fecha o precio
                 ↓
[Detalle de Evento: Cosquín Rock 2027] ──> Seleccionar tipo 'Campo General' (2 entradas)
                 ↓
[Confirmar Compra (Modal Pop Art)] ──> PENDIENTE (cupo reservado en back)
                 ↓
[Detalle de Compra] ──> Pagar ──> CONFIRMADA (QR dinámico habilitado, contador "Faltan X días")
                 ↓
[Chat de la Compra] ──> Enviar consulta al organizador sobre el acceso
                 ↓
[Cambiar usuario: Productora Rock Nacional (Organizador)]
                 ↓
[Chat de la Compra (Organizador)] ──> Responder mensaje al comprador
                 ↓
[Ventas del Evento / Control de Acceso] ──> Validar Entrada por QR o Ingreso Manual
                 ↓
[Marcar como Utilizada] ──> UTILIZADA (QR consumido, entrada canjeada)
                 ↓
[Volver como Comprador: Lucas García]
                 ↓
[Detalle de Compra / Calificar Evento] ──> Puntaje (1-5 estrellas) + Comentario ──> RESEÑADA
                 ↓
[Perfil del Organizador] ──> Reputación actualizada y reseña listada en el historial
```

---

## 2. Cadena Back-End (Llamadas HTTP en Orden de Ejecución)

| Paso | Método | Ruta HTTP | `x-user-id` | Acción del Back | Respuesta Típica (JSON) |
|---|---|---|---|---|---|
| 1 | `GET` | `/usuarios` | Ninguno | Lista usuarios activos para la pantalla de inicio | `[{ id: 'usr_comprador_1', nombre: 'Lucas', rol: 'COMPRADOR' }, ...]` |
| 2 | `GET` | `/eventos?categoria=rock&orden=fecha&direccion=asc` | `usr_comprador_1` | Filtra catálogo de eventos activos | `[{ id: 'evt_cosquin', nombre: 'Cosquín Rock 2027', ... }]` |
| 3 | `GET` | `/eventos/evt_cosquin` | `usr_comprador_1` | Retorna detalle del evento con tipos y cupos disponibles | `{ id: 'evt_cosquin', tiposEntrada: [{ id: 'tipo_cosquin_general', precio: 25000, cupoRestante: 498, cupo: 500 }], organizador: { puntajePromedio: 4.8, cantidadResenas: 12 } }` |
| 4 | `POST` | `/compras` | `usr_comprador_1` | Reserva cupo atómicamente; crea compra en `PENDIENTE` | `{ id: 'cmp_...', estado: 'PENDIENTE', total: 50000, puedePagar: true, puedeCancelar: true }` |
| 5 | `POST` | `/compras/:id/pagar` | `usr_comprador_1` | Transiciona estado a `CONFIRMADA`; calcula `diasRestantes` | `{ id: 'cmp_...', estado: 'CONFIRMADA', diasRestantes: 30, puedeCancelar: true, puedeUtilizar: false }` |
| 6 | `GET` | `/compras/:id/mensajes` | `usr_comprador_1` | Lista historial cronológico de mensajes del chat | `[{ id: 'msg_1', emisorId: '...', texto: 'Hola...', fecha: '...' }]` |
| 7 | `POST` | `/compras/:id/mensajes` | `usr_comprador_1` | Agrega mensaje del comprador en el hilo de la compra | `{ id: 'msg_2', emisorId: 'usr_comprador_1', texto: '¿A qué hora abren puertas?', fecha: '...' }` |
| 8 | `POST` | `/compras/:id/mensajes` | `usr_org_rock` | Agrega respuesta del organizador | `{ id: 'msg_3', emisorId: 'usr_org_rock', texto: 'Apertura 17:00 hs.', fecha: '...' }` |
| 9 | `GET` | `/eventos/evt_cosquin/compras` | `usr_org_rock` | Lista ventas del evento con disponibilidad por tipo | `{ compras: [...], disponibilidadPorTipo: [{ tipoEntradaId: 'tipo_cosquin_general', vendidas: 4, cupoTotal: 500 }] }` |
| 10 | `POST` | `/compras/:id/utilizar` | `usr_org_rock` | Canjea entrada en puerta; transiciona a `UTILIZADA` | `{ id: 'cmp_...', estado: 'UTILIZADA', puedeUtilizar: false, puedeCancelar: false }` |
| 11 | `POST` | `/compras/:id/resena` | `usr_comprador_1` | Registra puntaje y opinión post-evento; actualiza promedio | `{ id: 'res_...', puntaje: 5, comentario: 'Excelente organización', fecha: '...' }` |
| 12 | `GET` | `/organizadores/usr_org_rock` | `usr_comprador_1` | Retorna reputación recalculada y lista de reseñas | `{ puntajePromedio: 4.9, cantidadResenas: 13, resenas: [...] }` |

---

## 3. Cadena Front-End (Pantallas, Componentes y Datos)

| Pantalla | Componentes Clave Involucrados | Datos y Estados Visibles |
|---|---|---|
| **LoginScreen** (`/login`) | `HardShadow`, `LoadingView`, `ErrorBanner`, `RefreshControl` | Listado de compradores y organizadores con badge de rol Pop Art. Selección de cuenta en 1 toque. |
| **CatalogoScreen** (`/explorar`) | `SearchBar` (debounce 400ms), `FilterChip`, `SortSelector`, `EventCard`, `FlatList` con `RefreshControl` | Búsqueda por texto en tiempo real, chips de categorías canónicas, ordenamiento por precio o fecha, contador de eventos. |
| **EventoDetalleScreen** (`/evento/:id`) | `EventImage`, `QuantityStepper`, `RatingStars`, `ReviewCard`, `ConfirmModal`, `PopButton` | Portada de evento, tipos de entrada con cupo dinámico restante, stepper de cantidad con tope de cupo, resumen de precio, opiniones del organizador. |
| **CompraDetalleScreen** (`/compra/:id`) | `StateBadge`, `StatusTimeline`, `QRCode` (svg), `PopButton`, `ConfirmModal`, `RatingInput` | Ticket con diseño Pop Art, contador "Faltan X días", QR de acceso (solo si `CONFIRMADA`), timeline de estados, botones contextuales (Pagar, Cancelar, Chat, Calificar). |
| **ChatCompraScreen** (`/chat/:id`) | `KeyboardAvoidingView`, `FlatList`, `HardShadow`, `StateBadge`, `RefreshControl` | Hilo de mensajes bidireccional entre comprador y organizador, chips de rol, autoscroll, contador de caracteres (máx 1000), polling en segundo plano cada 5s. |
| **VentasEventoScreen** (`/ventas/:id`) | `AvailabilityBar`, `CompraRowOrganizador`, `FilterChip`, `ConfirmModal` | Métricas de ventas por tipo de entrada, filtro por estado de compra, acceso directo al chat con cada comprador y botón rápido de canje. |
| **ValidarEntradaScreen** (`/validar`) | `CameraView` (expo-camera), `ScanFrame`, `SegmentedFilter`, `StateBadge`, `PopButton` | Visor de cámara en vivo con marco delimitador Pop Art, escaneo continuo de QR sin doble lectura, modo alternativo de ingreso manual, confirmación de canje. |
| **OrganizadorPerfilScreen** (`/organizador/:id`) | `RatingStars`, `ReviewCard`, `HardShadow`, `FlatList` con `RefreshControl` | Ficha del organizador, puntaje promedio con escala `/ 5.0`, total de opiniones y lista completa de reseñas históricas. |

---

## 4. Reglas de Negocio Visibles en la Demo

| Regla de Negocio | Dónde se Observa en la App | Comportamiento Visible / Resultado |
|---|---|---|
| **Cupo disponible sincronizado** | `EventoDetalleScreen` y `VentasEventoScreen` | Al crear una compra, el `cupoRestante` disminuye de inmediato para todos los clientes sin esperar el pago. |
| **Tope del selector de cantidad** | `QuantityStepper` en `EventoDetalleScreen` | El botón `+` se desactiva al alcanzar el cupo remanente del tipo seleccionado. |
| **QR bloqueado en PENDIENTE** | `CompraDetalleScreen` | Se muestra un candado con el mensaje *"El QR se habilita cuando pagues tu entrada"*. |
| **Generación de QR en CONFIRMADA** | `CompraDetalleScreen` | Se renderiza el código QR en pantalla y se activa el modal de *"Ver QR grande"* para brillo óptimo. |
| **Contador regresivo de días** | `CompraDetalleScreen` y `TicketCard` | Badge amarillo *"⏳ Faltan X días"* o *"¡Es hoy!"* visible únicamente cuando la compra está `CONFIRMADA`. |
| **Cancelación con reembolso** | `CompraDetalleScreen` | Si la compra está confirmada, la modal informa el monto exacto reembolsado y el estado pasa a `CANCELADA`. |
| **QR consumido al validar** | `CompraDetalleScreen` | Luego del canje en puerta por el organizador, el QR desaparece y es reemplazado por el sello *"✓ CANJEADO EN PUERTA"*. |
| **Calificación habilitada post-canje** | `CompraDetalleScreen` | El botón *"⭐ CALIFICAR EVENTO"* solo se habilita cuando `puedeResenar === true` (compra `UTILIZADA`). |
| **Recálculo de reputación** | `OrganizadorPerfilScreen` | Al enviar la reseña, el promedio de estrellas y la cantidad de opiniones se actualizan automáticamente en el perfil. |

---

## 5. Qué Decide el Back y Qué Decide el Front

| Responsabilidad | Back-End (`backend/src/`) | Front-End (`mobile/src/`) |
|---|---|---|
| **Cálculo de importes y totales** | **Decide:** Calcula `total = precioUnitario * cantidad` y valida montos al persistir. | **Muestra:** Muestra el total provisto por la API; en el formulario muestra un total estimado informativo. |
| **Transiciones de estado** | **Decide:** Máquina de estados estricta (`PENDIENTE` → `CONFIRMADA` → `UTILIZADA` / `CANCELADA`). | **Refleja:** Renderiza `StateBadge` y desactiva o muestra botones según banderas (`puedePagar`, `puedeCancelar`, `puedeUtilizar`, `puedeResenar`). |
| **Reglas de cupo y disponibilidad** | **Decide:** Función única de disponibilidad que resta compras no canceladas/reembolsadas del cupo total. | **Respeta:** Limita el selector de cantidad al cupo devuelto y bloquea compra si está agotado. |
| **Payload del Código QR** | **Decide:** Reconoce y valida el identificador de compra transmitido en el QR. | **Genera/Lee:** Encripta/empaqueta con `armarPayloadQR(id)` y decodifica con `leerPayloadQR(data)`. |
| **Protección contra doble toque** | **Valida:** Evita condiciones de carrera y duplicaciones en base de datos en memoria. | **Bloquea:** Flags locales (`loading`, `pagando`, `publicando`, `enviando`) que inhabilitan botones durante requests. |
| **Privacidad de datos personales** | **Filtra:** Excluye el campo `email` en todas las rutas públicas y colectivas de la API. | **Oculta:** Nunca renderiza emails ni identificadores técnicos en ninguna pantalla visible. |

---

## 6. Archivos Clave a Abrir en el Video (Orden Sugerido)

Conviene tener estos 9 archivos abiertos en pestañas del editor para mostrarlos ágilmente:

1. `backend/src/domain/eventos.js`  
   *Qué mirar:* Función de disponibilidad única de cupos por tipo de entrada y cálculo de reputación del organizador.
2. `backend/src/domain/compras.js`  
   *Qué mirar:* Máquina de estados de la compra, cálculo de días restantes y banderas booleanas de permisos.
3. `mobile/src/api/client.js`  
   *Qué mirar:* Cliente HTTP con inyección automática de `x-user-id`, timeout de 8s y manejo uniforme de errores.
4. `mobile/src/screens/comprador/CatalogoScreen.js`  
   *Qué mirar:* Filtros combinados en vivo (categoría, texto, pasados), ordenamiento y hook reactivo `useEventos`.
5. `mobile/src/screens/comprador/EventoDetalleScreen.js`  
   *Qué mirar:* Manejo de tipos de entrada, QuantityStepper dinámico con límite de cupo y modal de confirmación.
6. `mobile/src/screens/comprador/CompraDetalleScreen.js`  
   *Qué mirar:* Generación del QR svg condicional al estado, timeline de transiciones y modal de reseña.
7. `mobile/src/screens/ChatCompraScreen.js`  
   *Qué mirar:* Chat bidireccional con polling silencioso cada 5s, scroll automático y control de caracteres.
8. `mobile/src/screens/organizador/ValidarEntradaScreen.js`  
   *Qué mirar:* Integración de `CameraView`, bloqueo anti doble lectura con `useRef` y modo manual alternativo.
9. `backend/tests/casosDeUso.test.js`  
   *Qué mirar:* Suite completa de integración que valida de CU1 a CU12 con 68 tests automatizados pasando en verde.
