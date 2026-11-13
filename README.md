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

El botón flotante (`wa-widget`) usa el enlace oficial "click to chat" (`https://wa.me/<número>?text=...`) y abre WhatsApp en el celular o WhatsApp Web en el computador. No incrusta una ventana de chat dentro de la página. WhatsApp también publica un botón de marca "Chat on WhatsApp" (imagen verde o blanca, solo en inglés, que no debe modificarse); si prefieres usarlo, descárgalo de la guía oficial de WhatsApp y enlázalo con `https://wa.me/50660956381`.

## Logo

El logo S2EAM está en `public/assets/img/logo-s2eam.png` (recorte circular con fondo transparente, 94 px) y `favicon.png`. El archivo original recibido está en `docs/brand/logo-original.png`. Es de baja resolución: para impresión, rótulos o pantallas muy grandes se necesita el archivo original en vector (SVG) o PNG de 1000 px o más.

## Asistente de primera línea

Botón Asistente (abajo a la derecha, junto al de WhatsApp). Es un bot **de reglas**: no usa IA ni cuesta por mensaje. Se identifica como asistente automatizado, responde preguntas frecuentes (zona, garantía, visita, tiempos, servicios), nunca da precios ni opiniones técnicas, y guía una solicitud de cotización paso a paso (servicio, zona, detalle, nombre, teléfono, correo opcional y confirmación con consentimiento). Al confirmar, la envía a `/api/contact` como cualquier otra solicitud (aparece en `/admin` con canal Asistente). En cualquier momento ofrece pasar a una persona por WhatsApp con un mensaje ya preparado, y lo ofrece solo tras dos respuestas que no entiende.

- Textos y reglas: `public/assets/js/assistant/content.js` (aquí se edita lo que dice el bot).
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
  assets/css/base/      Variables (tokens) y estilos base
  assets/css/blocks/    Un archivo por bloque BEM
  assets/js/            main.js, config.js y modules/
netlify/functions/      API: contact.js (/api/contact) y leads.js (/api/leads, protegida)
netlify/lib/            Código compartido: almacenamiento, correo, servicios
public/admin/           Panel interno de solicitudes
docs/                   Documentación y decisiones (adr/)
```

## Convenciones

- CSS: `bloque__elemento--modificador`, un archivo por bloque en `css/blocks/`, colores y espacios solo desde `tokens.css`. `npm run lint:css` valida el patrón BEM.
- JS: los ganchos de comportamiento usan atributos `data-js="..."`, no clases de estilo.
- Commits: mensajes cortos con prefijo (`feat:`, `fix:`, `docs:`, `chore:`).

## Estado actual (v0.2)

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
