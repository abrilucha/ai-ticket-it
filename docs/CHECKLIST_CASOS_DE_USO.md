# Checklist de Casos de Uso (CU1 a CU12) - AI Ticket It

Este checklist sirve para guiar la ejecución de la prueba completa de aceptación antes y durante la grabación del video demostrativo.

---

## Preparación Previa: Reinicio Limpio del Backend

Como los datos del servidor residen en memoria, antes de comenzar la grabación es indispensable reiniciar el proceso para contar con el seed canónico inicial:

```bash
# 1. En la terminal del backend (o cancelando con Ctrl+C):
npm start
# Verifica que imprima: "Servidor corriendo en puerto 3000" y seed inicial cargado.
```

Para verificar que el backend esté limpio y respondiendo correctamente:
```bash
curl.exe http://localhost:3000/health
# Debe devolver: {"status":"ok", ...}
```

---

## Tabla de Verificación de Casos de Uso

| Estado | Caso de Uso | Usuario de Prueba | Datos del Seed a Utilizar | Pasos en la Aplicación | Resultado Esperado en Pantalla |
|:---:|---|---|---|---|---|
| [ ] | **CU1: Comprador ve sus compras con estado y días restantes (solo si CONFIRMADA)** | Lucas García (`usr_comprador_1`) | `cmp_confirmada_1` (Cosquín Rock 2027) | 1. Ingresar como Lucas García.<br>2. Ir a la pestaña **Mis compras**.<br>3. Observar la entrada `Cosquín Rock 2027`. | Muestra badge azul `CONFIRMADA` y contador amarillo `⏳ Faltan 30 días`. En compras `PENDIENTE` o `UTILIZADA` no figura contador de días. |
| [ ] | **CU2: Organizador ve las compras de un evento con estado y entradas restantes por tipo** | Productora Rock Nacional (`usr_org_rock`) | `evt_cosquin` | 1. Ingresar como Productora Rock Nacional.<br>2. En **Mis eventos**, tocar `Cosquín Rock 2027`.<br>3. Ver sección "Disponibilidad por tipo" y "Compras registradas". | Muestra barras de cupo por tipo (Campo General: 498 disponibles / 500 cupo total) y listado de compras con filtros por estado (`CONFIRMADA`, etc.). |
| [ ] | **CU3: Comprador busca por texto y explora por categorías** | Lucas García (`usr_comprador_1`) | Categorías `rock`, `teatro`, etc. | 1. Ingresar como Lucas.<br>2. En **Explorar**, escribir "Cosquín" en el buscador.<br>3. Tocar el chip de categoría `ROCK`. | El catálogo filtra en vivo mediante debounce; se listan solo eventos coincidentes con su badge de categoría. Al limpiar filtros, reaparece el total. |
| [ ] | **CU4: Organizador crea un evento con varios tipos de entrada** | Productora Rock Nacional (`usr_org_rock`) | Formulario en blanco | 1. En **Mis eventos**, tocar `+ CREAR EVENTO`.<br>2. Completar nombre ("Quilmes Rock 2027"), descripción, categoría Rock, fecha futura y hora.<br>3. Agregar 2 tipos de entrada ("Campo" \$20.000 / cupo 200, "VIP" \$45.000 / cupo 50).<br>4. Tocar `PUBLICAR EVENTO`. | El evento se crea exitosamente en el back y se redirige a **Mis eventos**, donde el nuevo recital aparece listado con sus cupos listos para la venta. |
| [ ] | **CU5: Comprador envía mensajes en una compra** | Lucas García (`usr_comprador_1`) | `cmp_confirmada_1` | 1. Ir a **Mis compras** y abrir el ticket de Cosquín.<br>2. Tocar `💬 CHAT CON EL ORGANIZADOR`.<br>3. Escribir *"¿A qué hora abren las puertas?"* y pulsar `ENVIAR`. | El mensaje aparece en una burbuja azul alineada a la derecha con el rótulo `Vos`, rol `COMPRADOR` y hora de envío. |
| [ ] | **CU6: Organizador responde mensajes en una compra** | Productora Rock Nacional (`usr_org_rock`) | `cmp_confirmada_1` | 1. Cambiar de usuario a Productora Rock Nacional.<br>2. Ir a **Mis eventos** → Cosquín → Compras registradas.<br>3. Tocar el botón de chat en la fila de Lucas García.<br>4. Escribir *"Apertura 17:00 hs. ¡Te esperamos!"* y tocar `ENVIAR`. | El organizador ve el mensaje previo de Lucas a la izquierda y su respuesta a la derecha. El polling sincroniza la conversación. |
| [ ] | **CU7: Comprador cancela compra y recibe reembolso** | Lucas García (`usr_comprador_1`) | `cmp_confirmada_1` (o una compra nueva recién pagada) | 1. En **Mis compras**, abrir el detalle del ticket.<br>2. Tocar `CANCELAR COMPRA`.<br>3. En el modal rojo, confirmar cancelación. | El estado transiciona a `CANCELADA`, desaparece el QR de acceso y aparece la caja de aviso *"✓ REEMBOLSO REGISTRADO"* con el monto reintegrado. |
| [ ] | **CU8: Comprador califica un evento finalizado con puntaje de 1 a 5 y comentario** | Lucas García (`usr_comprador_1`) | `cmp_utilizada_sin_resena` (evento finalizado) | 1. En **Mis compras** (pestaña Historial), abrir la compra utilizada.<br>2. Tocar `⭐ CALIFICAR EVENTO`.<br>3. Seleccionar 5 estrellas, redactar comentario ("Sonido impecable y acceso rápido") y tocar `PUBLICAR RESEÑA`. | Se cierra la modal, la compra queda marcada como reseñada y se renderiza la tarjeta fija *"TU RESEÑA DEL EVENTO"* con estrellas, fecha y comentario. |
| [ ] | **CU9: Comprador compra entradas con cupo limitado** | Lucas García (`usr_comprador_1`) | `evt_cosquin` | 1. En el catálogo, abrir `Cosquín Rock 2027`.<br>2. Seleccionar tipo de entrada y elegir 2 entradas con el selector `+`.<br>3. Tocar `INICIAR COMPRA` y confirmar en la modal. | Se crea la compra en estado `PENDIENTE`. El cupo disponible en el evento disminuye automáticamente de 498 a 496. |
| [ ] | **CU10: Comprador ve reseñas de un organizador con su puntaje promedio** | Lucas García (`usr_comprador_1`) | `usr_org_rock` | 1. En el detalle del evento, desplazarse a la sección del organizador.<br>2. Tocar `VER TODAS LAS RESEÑAS (X) →`. | Se abre la pantalla del organizador con su tarjeta de reputación (ej: `4.8 / 5.0`), cantidad total de opiniones y el historial cronológico de reseñas. |
| [ ] | **CU11: Comprador paga una compra pendiente y obtiene código QR** | Lucas García (`usr_comprador_1`) | Compra recién creada en `PENDIENTE` | 1. En el detalle de la compra pendiente (donde el QR está bloqueado con candado).<br>2. Tocar `PAGAR $...`. | El estado cambia a `CONFIRMADA`, se desbloquea el código QR dinámico y se habilita el botón `🔍 VER QR GRANDE` con el modal a pantalla completa. |
| [ ] | **CU12: Organizador valida una entrada con escáner de cámara y QR o por ingreso manual** | Productora Rock Nacional (`usr_org_rock`) | Compra confirmada del comprador | 1. En el menú inferior, tocar **Validar entrada**.<br>2. Escanear el QR desde la pantalla de otro celular O en la pestaña **Ingreso manual** ingresar el identificador del ticket.<br>3. Verificar datos del asistente y tocar `✓ MARCAR COMO UTILIZADA`. | Se valida el acceso, la entrada pasa a `UTILIZADA` y ya no permite futuros canjes. En el celular del comprador el QR queda sellado como canjeado. |

---

## Casos de Error Provocados a Propósito (Demostración de Robustez)

Para evidenciar en la grabación el manejo de fallos y validaciones de borde:

1. **Intento de cancelar una entrada ya utilizada:**
   - Abrir una compra en estado `UTILIZADA`.
   - Verificar que el botón `CANCELAR COMPRA` no está presente y la entrada muestra el sello *"✓ CANJEADO EN PUERTA"*.
2. **Intento de validar un QR ya consumido:**
   - En **Validar entrada**, volver a escanear o ingresar el ID de una compra ya utilizada.
   - En pantalla aparece el badge `UTILIZADA` y la advertencia: *"⚠️ Esta entrada ya fue utilizada previamente"*, impidiendo un segundo canje.
3. **Intentar publicar un evento con errores de validación:**
   - En **Crear evento**, intentar publicar sin nombre o con fecha en el pasado.
   - La pantalla muestra de inmediato el banner de error explicativo en castellano indicando la corrección requerida.
4. **Reseña sin comentario o con más de 500 caracteres:**
   - En el modal de reseña, el botón `PUBLICAR RESEÑA` permanece deshabilitado hasta que el usuario escribe un comentario no vacío y el contador dinámico advierte si se aproxima al límite.
