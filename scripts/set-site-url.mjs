// Cambia la dirección del sitio en index.html, robots.txt y sitemap.xml.
// Uso: npm run seo:url -- https://tu-dominio.com
import { readFileSync, writeFileSync } from "node:fs";

const target = process.argv[2];
if (!target?.startsWith("https://")) {
  console.error("Uso: npm run seo:url -- https://tu-dominio.com");
  process.exit(1);
}

const html = readFileSync("public/index.html", "utf8");
const canonical = html.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
if (!canonical) {
  console.error("No se encontró la etiqueta canonical en public/index.html");
  process.exit(1);
}

const current = new URL(canonical).origin;
const next = new URL(target).origin;

for (const file of ["public/index.html", "public/robots.txt", "public/sitemap.xml"]) {
  writeFileSync(file, readFileSync(file, "utf8").replaceAll(current, next));
}
console.log(`Dirección cambiada de ${current} a ${next}`);
