# Soluciones2EAM: mejoras constructivas y seguridad electrónica

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

**Todavía no hace**: bot de primera línea ni asistente de IA, y no limita envíos repetidos desde una misma persona (pendiente: límite de tasa).

## Configuración de la fase 4

1. `npm install` (instala `@netlify/blobs`).
2. Crea una cuenta en Resend y una clave de API. Con la cuenta gratuita, el remitente de pruebas `onboarding@resend.dev` solo envía al correo de tu propia cuenta, así que `NOTIFY_EMAIL` debe ser ese correo. Para escribirles a los clientes necesitas un dominio propio verificado en Resend.
3. Copia `.env.example` a `.env` y llena `RESEND_API_KEY`, `NOTIFY_EMAIL` y `ADMIN_TOKEN`. En Netlify, carga las mismas variables en Site configuration > Environment variables.
4. `npm run dev`, envía una solicitud de prueba y revisa `http://localhost:8888/admin`.
5. Cuando tengas dominio: verifícalo en Resend, pon `EMAIL_FROM` con ese dominio y cambia `CONFIRM_TO_CUSTOMER=true`.

Privacidad: los datos de los clientes quedan guardados, así que publica la política de privacidad antes de abrir el formulario. El panel `/admin` y la API `/api/leads` solo responden con la clave.

## Pendientes antes de publicar

- [x] Nombre (Soluciones2EAM) y WhatsApp (`public/assets/js/config.js`).
- [ ] Definir zona de cobertura y cambiar los textos de servicios por los reales.
- [ ] Política de privacidad y enlace desde el formulario.
- [x] Persistencia de casos y aviso por correo (fase 4). Falta el correo de confirmación al cliente (requiere dominio).
