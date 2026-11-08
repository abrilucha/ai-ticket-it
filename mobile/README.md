# AI Ticket It — Mobile (React Native + Expo)

Cliente móvil de **AI Ticket It**, desarrollado con **React Native** (Expo Managed Workflow) siguiendo el sistema de diseño **Pop Kinetic** (Lichtenstein Pop Art, papel prensa y sombras duras físicas).

---

## 1. Requisitos Previos

- **Node.js** v18 o superior instalado en la computadora.
- **Expo Go** instalado en tu teléfono celular (disponible gratis en Google Play Store para Android y App Store para iOS).
- Que la computadora (servidor backend) y el teléfono celular estén conectados a la **misma red Wi-Fi**.

---

## 2. Instalación

Desde la terminal, posicionate dentro de la carpeta `mobile/` e instalá las dependencias:

```bash
cd mobile
npm install
```

---

## 3. Configuración de la API (IP de Red Local)

Para que el celular físico pueda conectarse con el servidor Express corriendo en tu PC, no podés usar `localhost` (porque `localhost` en el teléfono se refiere a sí mismo).

1. Averiguá la dirección IP local de tu computadora en la red Wi-Fi (en Windows corré `ipconfig` en PowerShell y buscá la IPv4 de tu adaptador Wi-Fi, por ejemplo `192.168.1.40` o `192.168.0.x`).
2. Podés configurar la variable en un archivo `.env` en la raíz de `mobile/`:
   ```bash
   cp .env.example .env
   ```
   Y editar `.env` indicando la IP:
   ```env
   EXPO_PUBLIC_API_URL=http://TU_IP_LOCAL:3000
   ```
   *(Si no creás el archivo `.env`, por defecto utiliza `http://192.168.1.40:3000`, configurable en `mobile/src/api/config.js`).*

---

## 4. Ejecución del Proyecto

1. Asegurate de que el backend esté corriendo en tu PC en el puerto 3000 (`npm run dev` desde la carpeta `backend/`).
2. En otra terminal, iniciá el bundler de Expo dentro de `mobile/`:

```bash
cd mobile
npx expo start
```

3. Verás en pantalla un **código QR** generado por Expo Metro Bundler.

---

## 5. Cómo Probar desde el Celular con Expo Go

1. **Paso 0 (Verificación de Red):** Abrí el navegador web de tu celular (Chrome o Safari) e ingresá a:
   ```text
   http://TU_IP_LOCAL:3000/health
   ```
   Deberías recibir inmediatamente el JSON `{"status":"ok", ...}`. Si no carga, revisá el apartado de Solución de Problemas (Firewall).
2. **Abrir la App:**
   - En **Android:** Abrí la app **Expo Go** y seleccioná *"Scan QR code"*, apuntando al QR de tu terminal.
   - En **iOS:** Abrí la app nativa de **Cámara** y tocá la notificación para abrir en **Expo Go**.
3. **Flujo de Prueba en Fase 1:**
   - Verás la pantalla de **Login Pop Art** sin contraseñas con los usuarios del seed agrupados en *Compradores* y *Organizadores*.
   - Al tocar cualquier comprador (ej. *Lucas* o *Mariana*), entrarás a la vista con pestañas **"EXPLORAR"** y **"MIS COMPRAS"**.
   - En **"EXPLORAR"**, la app llamará a `GET /categorias` y listará las 5 categorías canónicas en vivo, confirmando la conectividad de la API.
   - Podés presionar **"SALIR"** en el encabezado para cerrar sesión y probar el ingreso como organizador (*Productora Rock*), accediendo a las pestañas **"MIS EVENTOS"** y **"VALIDAR ENTRADA"**.

---

## 6. Solución de Problemas Frecuentes

### No conecta con el backend desde el celular ("No se pudo conectar con el servidor")
- **Firewall de Windows:** Windows Defender suele bloquear las conexiones entrantes a Node.js en redes Wi-Fi públicas o privadas. Andá a *Panel de control > Firewall de Windows Defender > Permitir que una aplicación o una característica se comunique a través de Windows Defender Firewall*, buscá **Node.js JavaScript Runtime** y marcá los casilleros de redes **Privada** y **Pública**.
- **Red Wi-Fi:** Asegurate de que la PC y el teléfono no estén en redes distintas (por ejemplo, PC por cable en una subred aislada o celular con datos móviles 4G/5G encendidos en lugar de Wi-Fi).
- **IP Desactualizada:** Si el router reasignó tu IP por DHCP, corré `ipconfig` nuevamente y actualizá `EXPO_PUBLIC_API_URL`.

---

## 7. QR y Cámara (Fase 4b: Validación de Accesos)

Esta versión incorpora generación y lectura autónoma de códigos QR para el control de acceso en eventos, funcionando 100% offline sin servicios externos pagos ni dependencias web.

### 7.1 Formato de Payload del QR
El contenido binario codificado en el QR sigue el formato estándar:
```text
AITICKETIT:<compraId>
```
*Ejemplo:* `AITICKETIT:cmp_confirmada_1`

- Si el escáner detecta un código que no comience con el prefijo canónico `AITICKETIT:` (por ejemplo una URL web genérica o un código de barras de otro producto), lo rechaza de inmediato mostrando un aviso flotante y rehabilita la cámara tras 2 segundos.
- Si detecta un código válido de AI Ticket It, extrae el identificador de la compra y consulta al backend (`GET /compras/:id`).

### 7.2 Cómo Probar el Flujo Completo

Tenés dos opciones muy sencillas para probar el escaneo en vivo:

#### Opción A: Dos celulares físicos con Expo Go
1. En el **Celular A**, iniciá sesión como un comprador (ej. *Lucas*) y andá a **"MIS COMPRAS"**.
2. Abrí una compra en estado **CONFIRMADA** (ej. *Cosquín Rock 2027*). Verás el código QR troquelado en la tarjeta y el botón **"🔍 VER QR GRANDE"**.
3. En el **Celular B**, iniciá sesión como el organizador del evento (ej. *Productora Rock*) y andá a la pestaña **"VALIDAR ENTRADA"**.
4. Con el modo **CÁMARA** activo (otorgando el permiso cuando la app lo solicite), apuntá la cámara trasera del Celular B hacia la pantalla del Celular A.
5. Al detectar el QR, la app muestra la tarjeta de verificación con los datos del evento, el asistente y el botón **"✓ MARCAR COMO UTILIZADA"**.
6. Al presionar el botón y confirmar el modal, la entrada transiciona a `UTILIZADA`.
7. En el Celular A, al recargar o volver a entrar, la entrada exhibirá el sello Pop Art **"ENTRADA UTILIZADA"** con la fecha y hora de acceso, bloqueando el código QR interactivo.

#### Opción B: Un celular físico + Pantalla de la PC
1. En la PC, podés generar un código QR de prueba en tu navegador o terminal con el texto exacto `AITICKETIT:cmp_confirmada_1` (o abrir la app en un emulador/navegador web).
2. En tu celular físico con Expo Go, entrá como organizador (*Productora Rock*), andá a **"VALIDAR ENTRADA"** y apuntá tu teléfono a la pantalla de la PC.
3. Se cargarán los datos de la compra y podrás confirmar el ingreso.

### 7.3 Casos de Borde Soportados
- **QR ajeno o formato desconocido:** Muestra un toast *"Código QR no reconocido (no pertenece a AI Ticket It)"* y reanuda el escaneo automáticamente a los 2 segundos sin trabar la interfaz.
- **Entrada ya utilizada:** Muestra la advertencia *"⚠️ Esta entrada ya fue utilizada previamente"*, oculta el botón de canje y mantiene visible el botón *"ESCANEAR OTRA ENTRADA"*.
- **Entrada con pago pendiente:** Muestra *"⏳ El pago de esta compra aún está pendiente"*, impidiendo el canje hasta que se abone.
- **Entrada cancelada o reembolsada:** Muestra *"🚫 Esta compra fue cancelada o reembolsada"*.
- **Falta de permisos o cámara deshabilitada:** Muestra la pantalla explicativa Pop Art para solicitar permisos o pasar al modo de **INGRESO MANUAL** sin interrumpir la operación.

---

## 8. Chat de la Compra y Reseñas (Fase 5)

Esta fase completa el ciclo de vida de la compra con soporte de mensajería bidireccional entre comprador y organizador, y sistema de reputación con calificación por estrellas y comentarios verificados.

### 8.1 Cómo Probar el Chat con un Solo Celular Físico

El chat funciona de forma completamente reactiva con polling silencioso cada 5 segundos y persistencia en memoria del backend:

1. **Iniciar como Comprador:**
   - En la pantalla de login, tocá la cuenta de **Lucas García**.
   - Andá a la pestaña **"MIS COMPRAS"** y abrí cualquier compra (ej. *Cosquín Rock 2027*).
   - Tocá el botón **"💬 CHAT CON EL ORGANIZADOR"** (disponible en cualquier estado, incluso canceladas).
   - Escribí un mensaje: *"Hola, ¿a qué hora abren las puertas?"* y tocá **ENVIAR**.
   - Verás tu mensaje a la derecha en color azul cobalto con el rótulo *"Vos"* y el chip *"COMPRADOR"*.
2. **Cambiar al Organizador:**
   - Volvé atrás y tocá **"SALIR"** en la barra superior.
   - En la lista de cuentas, seleccioná el organizador del evento: **Productora Rock**.
   - En la pestaña **"MIS EVENTOS"**, abrí *Cosquín Rock 2027* y tocá **"VENTAS Y ACCESOS"**.
   - En la fila de la compra de Lucas, tocá el botón **"💬 CHAT"** (o abrí la compra y tocá **"💬 CHAT CON EL COMPRADOR"**).
   - Verás el mensaje de Lucas a la izquierda en burbuja blanca con el autor *"Lucas García"*.
   - Respondé: *"¡Hola Lucas! El ingreso comienza a las 17:00 hs."* y tocá **ENVIAR**.
   - El mensaje se ubicará a la derecha para el organizador.
3. **Comprobar la Reactividad:**
   - Cerrá sesión e ingresá de nuevo como **Lucas García**.
   - Al volver al chat de esa compra, verás el hilo completo con las respuestas actualizadas.

### 8.2 Cómo Probar las Reseñas con un Solo Celular Físico

El backend garantiza que **únicamente** se pueden reseñar compras en estado `UTILIZADA` que no hayan sido calificadas previamente:

1. **Identificar la Compra Habilitada:**
   - En el seed inicial limpio, la compra `cmp_utilizada_sin_resena` de Lucas pertenece a *Cosquín Rock 2027*, está `UTILIZADA` y tiene `puedeResenar: true`.
   - En **"MIS COMPRAS"**, dicha tarjeta exhibe el badge amarillo **"⭐ CALIFICÁ"**.
   - En cambio, las compras en estado `CONFIRMADA` o `PENDIENTE` no tienen este badge.
2. **Completar la Calificación:**
   - Abrí el detalle de esa compra. Verás el botón destacado **"⭐ CALIFICAR EVENTO"**.
   - Tocá el botón para abrir el modal Pop Art de reseña.
   - Seleccioná la puntuación (1 a 5 estrellas) tocando las estrellas grandes.
   - Escribí tu opinión (ej. *"Excelente festival, la acreditación fue súper rápida"*). El contador indicará los caracteres utilizados sobre el límite de 500.
   - Presioná **"PUBLICAR RESEÑA"**.
3. **Verificación de Impacto Inmediato:**
   - Al confirmarse, el modal se cierra y la pantalla se actualiza automáticamente:
     - El botón *"⭐ CALIFICAR EVENTO"* desaparece porque `puedeResenar` pasa a `false`.
     - Aparece el bloque **"TU RESEÑA DEL EVENTO"** con las estrellas, la fecha y tu comentario entre comillas.
     - Al volver a **"MIS COMPRAS"**, la tarjeta cambia su badge a **"✓ RESEÑADA"**.
   - Andá a la pestaña **"EXPLORAR"**, entrá al evento *Cosquín Rock 2027* y tocá **"Ver perfil del organizador"**:
     - *Productora Rock* ahora muestra 3 reseñas (antes 2), el promedio recalculado y tu reseña visible al tope de la lista.
