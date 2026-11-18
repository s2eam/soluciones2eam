# S2EAM: mejoras constructivas y seguridad electrónica

Sitio web con formulario de cotización, enlace a WhatsApp y, en fases siguientes, bot de primera línea y asistente de IA para cotizaciones y seguimientos por correo. Se gestiona según el plan de gestión del proyecto (ISO 21500/21502).

## Stack

HTML, CSS3 con **BEM**, JavaScript (ES modules), Node.js en Netlify Functions. Hosting: Netlify. Código: GitHub.

## Arranque

```bash
npm install
npm install -g netlify-cli   # una sola vez
npm run dev                  # sitio + función en http://localhost:8888
```

## Subir a GitHub desde VS Code

```bash
git init -b main
git add .
git commit -m "chore: estructura inicial del sitio"
git remote add origin https://github.com/<usuario>/<repositorio>.git
git push -u origin main
```

Para publicar: en Netlify, "Add new site" > "Import an existing project", elige el repositorio. La configuración ya está en `netlify.toml`.

## Ver el sitio

- Con Live Server de VS Code (abre `public/index.html`): sirve para revisar diseño y navegación. El formulario no envía, porque `/api/contact` solo existe en Netlify.
- Con `npm run dev` (Netlify CLI): sitio y formulario completos.
- Propuestas de marca: `public/marca/index.html` (versión A) y `public/marca/version-b.html` (versión B). El sitio usa la versión B por defecto; `public/index.html?tema=a` muestra la A.

## Botón de WhatsApp

Botón redondo verde (`wa-widget`) con el logo oficial de WhatsApp y una etiqueta al pasar el mouse. Al tocarlo muestra un menú de temas; cada opción abre WhatsApp con un mensaje ya preparado (`https://wa.me/<número>?text=...`). No incrusta una ventana de chat.

## Logo

Versión vectorial en `public/assets/img/logo/`: símbolo, horizontal, vertical, versiones en blanco y en un solo color, más PNG para favicon, iPhone y redes. El encabezado y el pie usan `logo-symbol.svg`. Los archivos anteriores están en `public/assets/img/anterior/` y el original recibido en `docs/brand/logo-original.png`.

## Secciones de la página

- **Portada**: título, texto y botones (sin franja de colores desde la v0.11).
- **Servicios** (`_services.scss`, `modules/service-accordion.js`): acordeón por grupo. Cada panel es un servicio con su foto; el abierto muestra descripción y "Cotizar este servicio", que preselecciona el servicio en el formulario. En celular los paneles se apilan como franjas.
- **Fotos de servicios**: `public/assets/img/servicios/*.webp` (Pexels, ver `CREDITOS.md`). Para cambiar una foto basta con reemplazar el archivo con el mismo nombre. Se cargan con ruta desde la raíz (`/assets/...`), así que se ven con `npm run dev` y en Netlify, no con Live Server.
- **Nuestros valores** (`_values.scss`): cinta métrica; cada valor cuelga de una marca. En pantallas angostas la cinta queda vertical.
- **Cómo trabajamos** (`_steps.scss`, `modules/steps.js`): avance de obra de 0 % a 100 %; al tocar una etapa la barra avanza hasta ella.

## Asistente de primera línea

Botón «Ayuda» con el símbolo del logo (abajo a la derecha, junto al de WhatsApp). Al tocarlo muestra tres preguntas frecuentes como burbujas; cada una abre un centro de ayuda (`<dialog>`) con temas, respuestas y botones de acción. La caja de texto solo aparece al elegir «Cotizar por aquí» o «Escribir mi consulta». Es un bot **de reglas**: no usa IA ni cuesta por mensaje. Se identifica como asistente automatizado, responde preguntas frecuentes (zona, garantía, visita, tiempos, servicios), nunca da precios ni opiniones técnicas, y guía una solicitud de cotización paso a paso (servicio, zona, detalle, nombre, teléfono, correo opcional y confirmación con consentimiento). Al confirmar, la envía a `/api/contact` como cualquier otra solicitud (aparece en `/admin` con canal Asistente). En cualquier momento ofrece pasar a una persona por WhatsApp con un mensaje ya preparado, y lo ofrece solo tras dos respuestas que no entiende.

- Textos y reglas: `public/assets/js/assistant/content.js` (aquí se edita lo que dice el bot; `HELP_QA` son las preguntas del centro de ayuda y `HELP_FEATURED` las burbujas).
- Lógica sin interfaz: `assistant/engine.js`. Interfaz: `assistant/ui.js`.
- No guarda la conversación; solo la solicitud final.
- Límite de envíos: 5 solicitudes por hora por conexión (se guarda una huella de la IP, no la IP). Los contadores viejos se borran solos cada día con la función `cleanup`.
- La fase 6 (IA para borradores de cotización) se conectará a las solicitudes ya guardadas, con aprobación humana.

## SEO técnico y mantenimiento

- `public/index.html` incluye descripción, dirección canónica, etiquetas Open Graph (vista previa al compartir en redes y WhatsApp) y datos estructurados de negocio local en JSON-LD. `public/robots.txt` y `public/sitemap.xml` ayudan a los buscadores; `/admin` queda excluido.
- Al comprar el dominio propio, cambia la dirección en todos esos archivos con `npm run seo:url -- https://tu-dominio.com`, revisa el resultado con `git diff` y haz commit y push.
- La imagen para compartir es `public/assets/img/og-s2eam.png`; conviene rehacerla cuando haya un logo en alta resolución.
- La función programada `cleanup` borra cada día los contadores viejos del límite de envíos. Solo corre en el sitio publicado: después del primer despliegue, revisa que aparezca en la lista de funciones de Netlify.
- Pendiente: analítica (ver el plan de gestión, P20).

## Iconos

Los iconos son de [Tabler Icons](https://tabler.io/icons) (licencia MIT, texto en `docs/licenses/tabler-icons-LICENSE.txt`). Están en un solo archivo, `public/assets/img/icons.svg`, y se usan así: `<svg class="icon" aria-hidden="true"><use href="assets/img/icons.svg#ti-nombre"></use></svg>`. Para agregar otro, copia su `<symbol>` desde el paquete `@tabler/icons` (carpeta `icons/outline`) con el id `ti-nombre`. El sprite necesita servirse por HTTP (Live Server o Netlify), no abriendo el archivo directo.

## Estructura

```
public/                 Sitio estático
  assets/css/           CSS compilado (lo genera Gulp; no se edita ni se sube a Git)
  ../src/scss/base/     Variables (tokens) y estilos base
  ../src/scss/blocks/   Un parcial SCSS por bloque BEM
  ../src/scss/abstracts/ Mixins y breakpoints
  assets/js/            main.js, config.js y modules/
netlify/functions/      API: contact.js (/api/contact) y leads.js (/api/leads, protegida)
netlify/lib/            Código compartido: almacenamiento, correo, servicios
public/admin/           Panel interno de solicitudes
docs/                   Documentación y decisiones (adr/)
```

## Convenciones

- CSS: `bloque__elemento--modificador`, un parcial por bloque en `src/scss/blocks/`, colores, espacios y radios solo desde `_tokens.scss`. `npm run lint:css` valida SCSS y el patrón BEM.
- Estilos: edita `src/scss/`, luego `npm run build` (una vez) o `npm run watch` (mientras trabajas). Netlify ejecuta `npm run build` en cada deploy.
- JS: los ganchos de comportamiento usan atributos `data-js="..."`, no clases de estilo.
- Commits: mensajes cortos con prefijo (`feat:`, `fix:`, `docs:`, `chore:`).

## Estado actual (v0.12)

Funciona: página con servicios, formulario y botón de WhatsApp; la función valida los datos, filtra bots, **guarda cada caso** (Netlify Blobs) y **avisa por correo** al negocio (Resend). El panel interno está en `/admin`.

**Todavía no hace**: asistente de IA para cotizaciones y seguimientos (fase 6), ni atender por la API de WhatsApp.

## Configuración de la fase 4

1. `npm install` (instala `@netlify/blobs`).
2. Crea una cuenta en Resend y una clave de API. Con la cuenta gratuita, el remitente de pruebas `onboarding@resend.dev` solo envía al correo de tu propia cuenta, así que `NOTIFY_EMAIL` debe ser ese correo. Para escribirles a los clientes necesitas un dominio propio verificado en Resend.
3. Copia `.env.example` a `.env` y llena `RESEND_API_KEY`, `NOTIFY_EMAIL` y `ADMIN_TOKEN`. En Netlify, carga las mismas variables en Site configuration > Environment variables.
4. `npm run dev`, envía una solicitud de prueba y revisa `http://localhost:8888/admin`.
5. Cuando tengas dominio: verifícalo en Resend, pon `EMAIL_FROM` con ese dominio y cambia `CONFIRM_TO_CUSTOMER=true`.

Privacidad: los datos de los clientes quedan guardados, así que publica la política de privacidad antes de abrir el formulario. El panel `/admin` y la API `/api/leads` solo responden con la clave.

## Correo de las solicitudes

Cada solicitud llega a `soluciones2eam@gmail.com` (variable `NOTIFY_EMAIL`; si falta, se usa esa dirección). Mientras se use el remitente de pruebas de Resend, el correo solo se entrega a la dirección con la que se creó la cuenta de Resend, así que esa cuenta debe estar registrada con `soluciones2eam@gmail.com` o hay que verificar un dominio propio. Los casos se guardan siempre y se ven en `/admin`.

## Pendientes antes de publicar

- [x] Nombre (S2EAM) y WhatsApp (`public/assets/js/config.js`).
- [ ] Definir zona de cobertura y cambiar los textos de servicios por los reales.
- [ ] Revisión legal de la política de privacidad (`public/privacidad/`, ya enlazada desde el formulario; es un borrador).
- [ ] Confirmar el plazo de garantía: el sitio dice que se indica en cada cotización.
- [x] Persistencia de casos y aviso por correo (fase 4). Falta el correo de confirmación al cliente (requiere dominio).
