# ADR 0002: Casos en Netlify Blobs y correo con Resend

- **Estado**: aceptada (octubre 2026)
- **Contexto**: presupuesto casi nulo, un solo desarrollador, sitio en Netlify. El volumen inicial de solicitudes es bajo.
- **Decisión**:
  - Los casos se guardan en Netlify Blobs (almacén clave-valor incluido en Netlify, sin cuenta ni configuración extra). Todo el acceso pasa por `netlify/lib/storage.js`.
  - Los correos se envían con la API de Resend mediante `fetch`, sin SDK. Sus fallos no impiden guardar el caso.
  - El panel `/admin` está protegido con una clave (`ADMIN_TOKEN`) y se sirve desde una función.
- **Consecuencias**: no hay consultas relacionales ni reportes avanzados. Cuando el volumen o las necesidades crezcan (cotizaciones con líneas, seguimientos, métricas), se reemplaza `storage.js` por PostgreSQL sin tocar el frontend ni las demás funciones. El correo al cliente requiere un dominio propio verificado en Resend.
