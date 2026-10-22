import { SERVICE_LABELS } from "./services.js";

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char],
  );

// Devuelve "sent", "skipped" o "failed:<motivo>". Un fallo de correo nunca debe perder el caso.
export async function sendEmail({ to, subject, html, replyTo }) {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return "skipped";
  const from = process.env.EMAIL_FROM || "Soluciones2EAM <onboarding@resend.dev>";

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    return response.ok ? "sent" : `failed:${response.status}`;
  } catch {
    return "failed:network";
  }
}

export function notificationEmail(record) {
  const { id, lead } = record;
  const row = (label, value) =>
    `<tr><td><strong>${label}</strong></td><td>${escapeHtml(value || "—")}</td></tr>`;
  return {
    subject: `Nueva solicitud ${id}: ${SERVICE_LABELS[lead.service] ?? lead.service}`,
    html: `<h2>Nueva solicitud de cotización</h2>
<table cellpadding="6">
${row("N.º", id)}${row("Nombre", lead.name)}${row("Teléfono", lead.phone)}${row("Correo", lead.email)}
${row("Servicio", SERVICE_LABELS[lead.service] ?? lead.service)}${row("Zona", lead.zone)}${row("Detalle", lead.message)}
</table>`,
  };
}

export function confirmationEmail(record) {
  const { id, lead } = record;
  return {
    subject: `Recibimos tu solicitud (n.º ${id}) | Soluciones2EAM`,
    html: `<p>Hola ${escapeHtml(lead.name)},</p>
<p>Recibimos tu solicitud de cotización sobre <strong>${escapeHtml(SERVICE_LABELS[lead.service] ?? lead.service)}</strong>. Tu número de solicitud es <strong>${id}</strong>.</p>
<p>Revisaremos los detalles y te escribiremos pronto. Si prefieres, también puedes escribirnos por WhatsApp al 6095-6381.</p>
<p>Soluciones2EAM</p>`,
  };
}
