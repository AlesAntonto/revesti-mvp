# RE:VESTI — MVP, etapa 3

Prototipo web académico para simular la exploración, publicación y compra de ropa de segunda mano en Hermosillo, Sonora.

## Tecnologías
- HTML, CSS y JavaScript.
- `localStorage` para conservar favoritos y publicaciones en el navegador.
- No requiere Node.js, npm ni base de datos.

## Abrir en VS Code
1. Descomprime el ZIP.
2. Abre Visual Studio Code.
3. Selecciona **Archivo → Abrir carpeta** y elige `revesti-mvp`.
4. Abre `index.html` en tu navegador. También puedes usar la extensión **Live Server**: clic derecho en `index.html` → **Open with Live Server**.

## Funcionalidades incluidas
- Catálogo con publicaciones ficticias de demostración.
- Búsqueda por nombre, categoría, marca o vendedor.
- Filtros por categoría, talla, precio y prendas que aceptan intercambio.
- Ordenamiento por precio y fecha.
- Vista de detalle de cada prenda.
- Favoritos guardados en el navegador.
- Formulario para publicar una prenda con nombre, categoría, marca, talla, estado, modalidad (venta, intercambio o ambas), precio, descripción, nombre del vendedor y fotografía.
- Vista previa de la fotografía y compresión automática para reducir el espacio utilizado.
- Las nuevas publicaciones se agregan al catálogo y permanecen después de recargar la página en el mismo navegador.
- Compra simulada: el comprador escribe su nombre y confirma una operación de demostración, sin pagos ni datos bancarios.
- Al confirmar, la prenda cambia a estado “Vendida” y deja de estar disponible para otra compra.
- Una publicación marcada como vendida puede reactivarse desde su detalle para repetir las pruebas.
- Las compras simuladas se registran localmente en el navegador.

## Importante sobre el almacenamiento
Esta es una simulación de MVP sin servidor ni base de datos. Las publicaciones, favoritos y compras simuladas se guardan en `localStorage` del navegador y dispositivo donde se crean. No se sincronizan con otros usuarios, computadoras o teléfonos. Si se borran los datos del sitio en el navegador, se pueden perder las publicaciones guardadas.

## GitHub Pages
El prototipo puede publicarse como sitio estático en GitHub Pages. La página será accesible mediante un enlace, pero cada visitante verá y guardará sus propias publicaciones localmente en su navegador. Para compartir publicaciones entre usuarios se necesitaría posteriormente una base de datos y un backend.

Pasos generales:
1. Crea un repositorio público, por ejemplo `revesti-mvp`.
2. Sube los archivos de esta carpeta (no el ZIP).
3. En GitHub abre **Settings → Pages**.
4. En **Build and deployment**, elige **Deploy from a branch**.
5. Selecciona la rama `main` y la carpeta `/ (root)` y guarda.

## Aviso
Los nombres, publicaciones, precios y operaciones son ficticios. No se realizan pagos ni contactos reales. La confirmación de compra solo cambia el estado de la publicación dentro del navegador; no representa una transacción comercial real. Las fotografías de demostración se cargan desde Unsplash, por lo que requieren conexión a internet.

## Identidad visual
El logotipo proporcionado por el equipo está en `assets/revesti-logo.png` y aparece en el encabezado y el pie de página. Para sustituirlo por una versión nueva, conserva ese nombre de archivo o actualiza la ruta en `index.html`.


## Etapa 4: Sistema de intercambios
- Las publicaciones que aceptan intercambio muestran el botón **Proponer intercambio**.
- El formulario permite describir a la persona propietaria la prenda que se ofrece a cambio.
- Las propuestas se guardan en `localStorage` bajo la clave `revesti-exchange-proposals`.
- El botón **Intercambios** abre la bandeja local para aceptar o rechazar propuestas.
- Al aceptar una propuesta, la publicación cambia a **Intercambio acordado** y deja de estar disponible para nuevas compras o intercambios.
- Si se acepta una propuesta para una publicación, las demás propuestas pendientes para esa misma prenda se rechazan automáticamente.
- La opción **Reactivar publicación** permite repetir la demostración.
- Es una simulación académica en un solo navegador: no hay cuentas, notificaciones reales, mensajería ni coordinación de entregas.


## Etapa 5: adaptación móvil y PWA

Esta versión incorpora:
- Navegación inferior en celular: Explorar, Favoritos, Intercambios y Publicar.
- Catálogo móvil en dos columnas, controles táctiles más cómodos y formularios adaptados.
- Ventanas y botones ajustados a pantallas pequeñas.
- `manifest.webmanifest` con identidad de la aplicación e iconos.
- `sw.js` para guardar los archivos principales y permitir abrir la estructura básica sin conexión.
- Registro del Service Worker mediante HTTPS o localhost.

### Probar en computadora
Abre el proyecto mediante un servidor local (por ejemplo, Live Server en VS Code). No abras `index.html` directamente con doble clic, porque el Service Worker requiere HTTPS o localhost.

### Instalar en celular
1. Publica el proyecto mediante GitHub Pages (HTTPS).
2. Abre la URL publicada desde el navegador del teléfono.
3. Android: Chrome > menú > Instalar aplicación o Añadir a pantalla de inicio.
4. iPhone: Safari > Compartir > Añadir a pantalla de inicio.

### Alcance y limitaciones
La PWA no es una aplicación nativa ni requiere Play Store/App Store. El Service Worker almacena los archivos principales del sitio; las fotografías de demostración alojadas externamente y las fuentes de Google requieren conexión. Las publicaciones, favoritos, compras simuladas e intercambios siguen guardándose en `localStorage` de cada navegador: no se sincronizan entre dispositivos ni entre usuarios. Las fotos que se suben desde el equipo también permanecen en el almacenamiento local del navegador.
