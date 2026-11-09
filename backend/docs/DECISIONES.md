# Decisiones de Arquitectura y Negocio - AI Ticket It

Este documento registra los fundamentos y criterios técnicos aplicados en el diseño y refactorización del backend.

---

## 1. Persistencia 100% en Memoria Detrás de Repositorios

- **Contexto**: Las especificaciones y consignas de la materia exigen el uso exclusivo de persistencia en memoria en arrays o Maps, descartando cualquier dependencia de MongoDB, SQLite, Mongoose o motores de base de datos externos.
- **Decisión**: Se implementó el patrón **Repository** (`UsuarioRepository`, `CategoriaRepository`, `EventoRepository`, `CompraRepository`, `ResenaRepository`, `MensajeRepository`, `CambioEstadoCompraRepository`).
- **Beneficio**: Las capas superiores (`Services` y `Controllers`) interactúan únicamente con abstracciones agnósticas a la tecnología de almacenamiento. Si en el futuro se requiriese migrar a una base de datos real, solo se modificará la capa de repositorios sin tocar ni una sola línea de lógica de negocio o controladores.

---

## 2. Aislamiento y Concurrencia en Memoria

- **Problema**: La mutación directa de objetos en memoria compartida genera condiciones de carrera, contaminación entre tests y mutaciones accidentales fuera de los servicios.
- **Decisión**: Los repositorios aplican copias defensivas con spread operators (`{ ...item }` y `[...array]`), retornos inmutables y generadores de identificadores únicos en base al timestamp y UUID nativo (`crypto.randomUUID()`).
- **Beneficio**: Garantiza aislamiento completo por llamada y permite que la suite de pruebas unitarias y de integración corra de forma predecible y reproducible.

---

## 3. Máquina de Estados Centralizada (`MaquinaEstadoCompra`)

- **Problema**: Dispersar validaciones de estado condicionales (`if (compra.estado === ...)`) en múltiples controladores o servicios genera inconsistencias y riesgo de transiciones ilegales.
- **Decisión**: Toda la lógica del ciclo de vida de una compra se encuentra encapsulada en la clase de dominio `MaquinaEstadoCompra`.
  - Estados soportados: `PENDIENTE`, `CONFIRMADA`, `UTILIZADA`, `CANCELADA`, `REEMBOLSADA`.
  - Acciones:
    - `PAGAR`: únicamente desde `PENDIENTE` $\rightarrow$ `CONFIRMADA`.
    - `UTILIZAR`: únicamente desde `CONFIRMADA` $\rightarrow$ `UTILIZADA`.
    - `CANCELAR`:
      - Desde `PENDIENTE` $\rightarrow$ `CANCELADA` (libera cupo).
      - Desde `CONFIRMADA` $\rightarrow$ `REEMBOLSADA` (libera cupo y registra reembolso).
      - Desde `UTILIZADA` $\rightarrow$ **Bloqueada** (lanza `ConflictError`).
- **Beneficio**: Las reglas de transición son la única fuente de verdad y no pueden ser eludidas por ningún endpoint.

---

## 4. Cálculo Dinámico del Cupo Restante

- **Problema**: Mantener un campo mutable `cupoDisponible` dentro del documento o entidad de `Evento` genera desfasajes cuando se cancelan o reembolsan compras concurrentes.
- **Decisión**: El cupo restante se calcula dinámicamente como:
  $$\text{Cupo Restante} = \text{Cupo Total del Tipo} - \sum \text{Entradas de compras en estado } (\text{PENDIENTE} \cup \text{CONFIRMADA} \cup \text{UTILIZADA})$$
  Las compras en estado `CANCELADA` o `REEMBOLSADA` no restan cupo, por lo que quedan automáticamente liberadas sin necesidad de realizar operaciones adicionales de incremento.
- **Beneficio**: Eliminación total de problemas de sobrevendedor (*overselling*) y coherencia matemática garantizada en todo momento.

---

## 5. Chat Asociado a la Compra (No al Evento)

- **Problema**: Las consultas de post-venta, acreditaciones o accesos son privadas y contextuales a la compra de entradas de un comprador particular.
- **Decisión**: Los mensajes pertenecen a una `compraId` específica (`/compras/:id/mensajes`). Solo los dos actores intervinientes (el comprador titular o el organizador dueño del evento) tienen autorización para leer o enviar mensajes.
- **Beneficio**: Privacidad de datos, simplicidad de acceso y contexto delimitado a la transacción.

---

## 6. Reputación y Puntaje del Organizador Calculado On-the-Fly

- **Problema**: Almacenar un campo acumulado `puntajePromedio` en el usuario organizador exige transacciones distribuidas o sincronizaciones propensas a desfasaje al agregarse nuevas reseñas.
- **Decisión**: El cálculo del puntaje promedio del organizador está centralizado en `ReputacionService.calcularPuntajeOrganizador(organizadorId)`. Dicho servicio reúne todas las compras de eventos de ese organizador y promedia las reseñas asociadas redondeando a un decimal.
  - Si no posee reseñas: `puntajePromedio: null`, `cantidadResenas: 0`.
- **Beneficio**: No hay estado desincronizado. Al crear una nueva reseña, el puntaje del organizador se refleja inmediatamente en el catálogo y en el detalle de todos sus eventos.

---

## 7. Matriz de Trazabilidad: Casos de Uso del TP vs Tests y Endpoints

| Caso de Uso del TP | Test en `tests/casosDeUso.test.js` | Endpoints HTTP Involucrados |
|---|---|---|
| **CU1** Comprador ve sus compras con estado y días restantes (solo si `CONFIRMADA`) | `CU1: comprador ve sus compras con estado y días restantes (solo si CONFIRMADA)` | `GET /compras/mias` |
| **CU2** Organizador ve las compras de un evento con estado y entradas restantes por tipo | `CU2: organizador ve las compras de un evento con estado y entradas restantes por tipo` | `GET /eventos/:id/compras` |
| **CU3** Comprador busca por texto y explora por categorías | `CU3: comprador busca por texto y explora por categorías` | `GET /categorias`, `GET /eventos?q=...`, `GET /eventos?categoria=...` |
| **CU4** Organizador crea un evento con varios tipos de entrada | `CU4: organizador crea un evento con varios tipos de entrada` | `POST /eventos` |
| **CU5** Comprador envía mensajes en una compra | `CU5: comprador envía mensajes en una compra` | `POST /compras/:id/mensajes` |
| **CU6** Organizador responde mensajes | `CU6: organizador responde mensajes` | `POST /compras/:id/mensajes`, `GET /compras/:id/mensajes` |
| **CU7** Comprador cancela una compra y se registra el reembolso | `CU7: comprador cancela una compra y se registra el reembolso` | `POST /compras/:id/cancelar`, `GET /eventos/:id` |
| **CU8** Cancelación permitida solo si la compra no está `UTILIZADA` y el evento no se realizó | `CU8: cancelación permitida solo si la compra no está UTILIZADA y el evento no se realizó` | `POST /compras/:id/cancelar` |
| **CU9** Comprador puntúa y comenta una vez utilizada la entrada | `CU9: comprador puntúa y comenta una vez utilizada la entrada` | `POST /compras/:id/resena` |
| **CU10** Las reseñas de eventos anteriores se ven en los eventos de cada organizador | `CU10: las reseñas de eventos anteriores se ven en los eventos de cada organizador` | `GET /eventos/:id`, `GET /organizadores/:id` |
| **CU11** Comprador ordena por precio, fecha y puntaje del organizador | `CU11: comprador ordena por precio, fecha y puntaje del organizador` | `GET /eventos?orden=...&direccion=...` |
| **CU12** Comprador compra eligiendo tipo y cantidad sin superar el cupo | `CU12: comprador compra eligiendo tipo y cantidad sin superar el cupo` | `GET /eventos/:id`, `POST /compras` |

---

## 8. Autenticación y Registro Real

### Entidad única `Usuario` con atributo `rol`
- Se modela una sola entidad `Usuario` con el discriminador `rol` (`COMPRADOR` u `ORGANIZADOR`).
- Evita duplicación de estructuras de base y autorizaciones, permitiendo que compras y eventos referencien un único tipo de usuario de manera consistente.

### Hashing con `crypto.scrypt` nativo
- Las contraseñas se hashean utilizando la función nativa `crypto.scrypt` con sal aleatoria de 16 bytes y longitud de clave de 64 bytes.
- Se almacenan en formato `salt:key` y se verifican con `crypto.timingSafeEqual`. Si el usuario no existe, se ejecuta un hash ficticio para mitigar ataques de temporización (*timing attacks*).

### Tokens opacos en memoria (`SesionRepository`)
- Las sesiones activas se gestionan mediante tokens opacos generados con `crypto.randomBytes(32).toString('hex')` en un `Map` en memoria.
- No se utilizan JWTs ni firmas externas, manteniendo coherencia con el diseño en memoria y permitiendo revocación inmediata en `POST /auth/logout`.

### Mensaje unificado de credenciales inválidas
- Tanto si el email no existe como si la contraseña es incorrecta, el sistema responde siempre `401 Unauthorized` con el mensaje genérico `"Credenciales inválidas"`.
- Esta práctica previene la enumeración de correos electrónicos registrados en la plataforma.

### Expiración de sesiones a 24 horas
- Cada sesión almacena su timestamp de creación (`creadoEn`) y se invalida automáticamente si han transcurrido más de 24 horas desde su emisión.
- Al detectarse expiración, el registro es purgado inmediatamente del repositorio liberando memoria.

### Contraseña demo para cuentas del seed
- Todas las cuentas preexistentes en el seed se inicializan con la contraseña unificada `Demo1234`.
- Las contraseñas se hashean de manera individual con su propia sal criptográfica durante la carga del seed o al invocar `POST /dev/reset`.

### Flag `ENABLE_SIMULATED_AUTH` para tests legados
- La variable de entorno `ENABLE_SIMULATED_AUTH` permite que el middleware `requireAuth` acepte condicionalmente la cabecera `x-user-id`.
- Se evalúa dinámicamente por request, está apagada por defecto en producción/desarrollo y se enciende exclusivamente en la configuración de Jest para preservar la validez de los tests preexistentes.


| Caso de Uso del TP | Test en `tests/casosDeUso.test.js` | Endpoints HTTP Involucrados |
|---|---|---|
| **CU1** Comprador ve sus compras con estado y días restantes (solo si `CONFIRMADA`) | `CU1: comprador ve sus compras con estado y días restantes (solo si CONFIRMADA)` | `GET /compras/mias` |
| **CU2** Organizador ve las compras de un evento con estado y entradas restantes por tipo | `CU2: organizador ve las compras de un evento con estado y entradas restantes por tipo` | `GET /eventos/:id/compras` |
| **CU3** Comprador busca por texto y explora por categorías | `CU3: comprador busca por texto y explora por categorías` | `GET /categorias`, `GET /eventos?q=...`, `GET /eventos?categoria=...` |
| **CU4** Organizador crea un evento con varios tipos de entrada | `CU4: organizador crea un evento con varios tipos de entrada` | `POST /eventos` |
| **CU5** Comprador envía mensajes en una compra | `CU5: comprador envía mensajes en una compra` | `POST /compras/:id/mensajes` |
| **CU6** Organizador responde mensajes | `CU6: organizador responde mensajes` | `POST /compras/:id/mensajes`, `GET /compras/:id/mensajes` |
| **CU7** Comprador cancela una compra y se registra el reembolso | `CU7: comprador cancela una compra y se registra el reembolso` | `POST /compras/:id/cancelar`, `GET /eventos/:id` |
| **CU8** Cancelación permitida solo si la compra no está `UTILIZADA` y el evento no se realizó | `CU8: cancelación permitida solo si la compra no está UTILIZADA y el evento no se realizó` | `POST /compras/:id/cancelar` |
| **CU9** Comprador puntúa y comenta una vez utilizada la entrada | `CU9: comprador puntúa y comenta una vez utilizada la entrada` | `POST /compras/:id/resena` |
| **CU10** Las reseñas de eventos anteriores se ven en los eventos de cada organizador | `CU10: las reseñas de eventos anteriores se ven en los eventos de cada organizador` | `GET /eventos/:id`, `GET /organizadores/:id` |
| **CU11** Comprador ordena por precio, fecha y puntaje del organizador | `CU11: comprador ordena por precio, fecha y puntaje del organizador` | `GET /eventos?orden=...&direccion=...` |
| **CU12** Comprador compra eligiendo tipo y cantidad sin superar el cupo | `CU12: comprador compra eligiendo tipo y cantidad sin superar el cupo` | `GET /eventos/:id`, `POST /compras` |

