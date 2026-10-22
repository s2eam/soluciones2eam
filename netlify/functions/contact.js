import { confirmationEmail, notificationEmail, sendEmail } from "../lib/email.js";
import { SERVICE_LABELS } from "../lib/services.js";
import { saveLead } from "../lib/storage.js";

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const clean = (value, max) => String(value ?? "").trim().slice(0, max);

const newId = () => {
  const day = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase().padEnd(5, "0");
  return `${day}-${rand}`;
};

export default async (req) => {
  if (req.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);

  let data;
  try {
    data = await req.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  // Campo trampa para bots: si viene lleno, se responde "ok" sin procesar.
  if (data.website) return json({ ok: true });

  const lead = {
    name: clean(data.name, 100),
    phone: clean(data.phone, 30),
    email: clean(data.email, 120),
    service: clean(data.service, 40),
    zone: clean(data.zone, 100),
    message: clean(data.message, 2000),
    consent: data.consent === true,
  };

  const errors = {};
  if (lead.name.length < 2) errors.name = "Escribe tu nombre.";
  if (!/^[0-9+\s-]{8,20}$/.test(lead.phone)) errors.phone = "Escribe un teléfono válido.";
  if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) errors.email = "Revisa el correo.";
  if (!(lead.service in SERVICE_LABELS)) errors.service = "Elige un servicio.";
  if (lead.message.length < 10) errors.message = "Cuéntanos un poco más.";
  if (!lead.consent) errors.consent = "Necesitamos tu autorización para responderte.";

  if (Object.keys(errors).length > 0) return json({ ok: false, errors }, 422);

  const record = {
    id: newId(),
    createdAt: new Date().toISOString(),
    status: "nuevo",
    lead,
    emails: {},
  };

  try {
    await saveLead(record);
  } catch {
    return json({ ok: false, error: "storage_failed" }, 500);
  }

  // Los correos son "mejor esfuerzo": si fallan, el caso ya quedó guardado.
  const notify = notificationEmail(record);
  record.emails.notify = await sendEmail({
    to: process.env.NOTIFY_EMAIL,
    replyTo: lead.email || undefined,
    ...notify,
  });

  // Requiere dominio verificado en el proveedor; ver README.
  if (lead.email && process.env.CONFIRM_TO_CUSTOMER === "true") {
    record.emails.customer = await sendEmail({ to: lead.email, ...confirmationEmail(record) });
  } else {
    record.emails.customer = "skipped";
  }

  try {
    await saveLead(record);
  } catch {
    // El caso ya existe; solo se pierde el registro del estado de los correos.
  }

  return json({ ok: true, id: record.id });
};

export const config = { path: "/api/contact" };
