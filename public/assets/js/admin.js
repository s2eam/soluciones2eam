const STATUSES = ["nuevo", "en-revision", "cotizado", "ganado", "perdido"];
const LABELS = {
  "soldadura-estructuras": "Soldadura y estructuras",
  pintura: "Pintura",
  electricidad: "Electricidad residencial",
  madera: "Acabados en madera",
  mejoras: "Mejoras y remodelaciones",
  cctv: "Cámaras (CCTV)",
  alarmas: "Alarmas",
  portones: "Portones eléctricos",
  otro: "Otro",
};

const tokenInput = document.querySelector('[data-js="admin-token"]');
const loadButton = document.querySelector('[data-js="admin-load"]');
const statusEl = document.querySelector('[data-js="admin-status"]');
const rows = document.querySelector('[data-js="admin-rows"]');

async function api(method, body) {
  const response = await fetch("/api/leads", {
    method,
    headers: { Authorization: `Bearer ${tokenInput.value}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "request_failed");
  return data;
}

function cell(content) {
  const td = document.createElement("td");
  if (content instanceof Node) td.append(content);
  else td.textContent = content;
  return td;
}

function whatsappLink(phone) {
  const digits = phone.replace(/\D/g, "");
  const link = document.createElement("a");
  link.href = `https://wa.me/${digits.length === 8 ? `506${digits}` : digits}`;
  link.target = "_blank";
  link.rel = "noopener";
  link.textContent = phone;
  return link;
}

function render(leads) {
  rows.replaceChildren(
    ...leads.map((record) => {
      const { lead } = record;
      const select = document.createElement("select");
      select.className = "contact-form__input";
      STATUSES.forEach((status) => select.append(new Option(status, status, false, status === record.status)));
      select.addEventListener("change", async () => {
        try {
          await api("POST", { id: record.id, status: select.value });
          statusEl.textContent = `Estado de ${record.id} actualizado.`;
        } catch {
          statusEl.textContent = "No se pudo actualizar el estado.";
        }
      });

      const tr = document.createElement("tr");
      tr.append(
        cell(record.id),
        cell(new Date(record.createdAt).toLocaleString("es-CR")),
        cell(`${lead.name}${lead.email ? ` · ${lead.email}` : ""}`),
        cell(`${LABELS[lead.service] ?? lead.service}${lead.zone ? ` · ${lead.zone}` : ""}`),
        cell(lead.message),
        cell(lead.source === "bot" ? "Asistente" : "Formulario"),
        cell(select),
        cell(whatsappLink(lead.phone)),
      );
      return tr;
    }),
  );
}

loadButton.addEventListener("click", async () => {
  statusEl.textContent = "Cargando…";
  try {
    const { leads } = await api("GET");
    render(leads);
    statusEl.textContent = `${leads.length} solicitud(es).`;
  } catch (error) {
    statusEl.textContent =
      error.message === "unauthorized"
        ? "Clave incorrecta."
        : error.message === "admin_disabled"
          ? "Falta configurar ADMIN_TOKEN en Netlify."
          : "No se pudo cargar. Esta página solo funciona con Netlify (npm run dev o el sitio publicado).";
  }
});
