# ADR 0001: Hosting en Netlify con funciones serverless

- **Estado**: aceptada (octubre 2026)
- **Contexto**: presupuesto casi nulo y un solo desarrollador. Se necesita publicar rápido, con HTTPS y sin administrar servidores.
- **Decisión**: sitio estático en Netlify (plan gratuito) y backend en Netlify Functions (Node.js). Los seguimientos por correo usarán funciones programadas.
- **Consecuencias**: no hay servidor Node permanente; la base de datos y el correo son servicios externos con capa gratuita. Si el proyecto crece, el backend puede migrarse a un servidor propio sin cambiar el frontend, porque el formulario solo conoce la ruta `/api/contact`.
