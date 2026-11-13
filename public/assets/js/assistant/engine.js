// Motor del asistente: lógica pura, sin DOM ni red, para poder probarla con Node.
import { AFTER_ANSWER, ANSWERS, GREETING, INTENTS, MENU, SERVICES, TEXT, THANKS, WANTS_PERSON } from "./content.js";

const PHONE = /^[0-9+\s-]{8,20}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FREE_TEXT_STATES = ["zone", "message", "name", "phone", "email"];

const CANCEL = { label: "Cancelar", value: "cancelar" };
const SERVICE_REPLIES = SERVICES.map((service) => ({ label: service.label, value: `svc:${service.key}` }));

export const normalize = (text) =>
  String(text ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();

const labelOf = (key) => SERVICES.find((service) => service.key === key)?.label ?? key;

function detectService(norm) {
  const found = SERVICES.find((service) => service.words.some((word) => new RegExp(`\\b${word}`).test(norm)));
  return found?.key;
}

export function createBot({ waUrl }) {
  let state = "idle";
  let lead = {};
  let misses = 0;

  const reply = (messages, replies = [], action) => ({ messages, replies, ...(action ? { action } : {}) });

  function whatsappText() {
    const parts = ["Hola, escribo desde el asistente del sitio."];
    if (lead.service) parts.push(`Servicio: ${labelOf(lead.service)}.`);
    if (lead.zone) parts.push(`Zona: ${lead.zone}.`);
    if (lead.message) parts.push(`Detalle: ${lead.message}`);
    if (lead.name) parts.push(`Nombre: ${lead.name}.`);
    if (lead.phone) parts.push(`Teléfono: ${lead.phone}.`);
    return parts.join(" ");
  }

  function start() {
    state = "idle";
    lead = {};
    misses = 0;
    return reply(TEXT.greeting, MENU);
  }

  function toMenu(message) {
    state = "idle";
    lead = {};
    misses = 0;
    return reply([message], MENU);
  }

  function person() {
    return reply([TEXT.person, `[Abrir WhatsApp](${waUrl(whatsappText())})`], [{ label: "Volver al menú", value: "menu" }]);
  }

  function startQuote(serviceKey) {
    lead = {};
    misses = 0;
    if (serviceKey) {
      lead.service = serviceKey;
      state = "zone";
      return reply([`Perfecto: ${labelOf(serviceKey)}.`, TEXT.askZone], [CANCEL]);
    }
    state = "service";
    return reply([TEXT.askService], [...SERVICE_REPLIES, CANCEL]);
  }

  function confirmStep() {
    state = "confirm";
    const lines = [
      `Servicio: ${labelOf(lead.service)}`,
      `Zona: ${lead.zone}`,
      `Detalle: ${lead.message}`,
      `Nombre: ${lead.name}`,
      `Teléfono: ${lead.phone}`,
      `Correo: ${lead.email || "no indicado"}`,
    ].join("\n");
    return reply(
      [TEXT.confirmIntro + "\n" + lines, TEXT.consent, TEXT.confirmAsk],
      [{ label: "Sí, enviar mi solicitud", value: "confirm" }, { label: "Empezar de nuevo", value: "restart" }, CANCEL],
    );
  }

  function submit() {
    state = "sending";
    return reply(["Enviando tu solicitud…"], [], {
      type: "submit",
      lead: { ...lead, consent: true, source: "bot" },
    });
  }

  function answer(key) {
    state = "idle";
    misses = 0;
    return reply([ANSWERS[key]], key === "precios" ? AFTER_ANSWER : AFTER_ANSWER);
  }

  function fallback() {
    misses += 1;
    if (misses >= 2) {
      misses = 0;
      return reply([TEXT.offerPerson], [{ label: "Hablar con una persona", value: "persona" }, { label: "Volver al menú", value: "menu" }]);
    }
    return reply([TEXT.notUnderstood], MENU);
  }

  function onIdle(value, norm) {
    if (value === "cotizar") return startQuote();
    if (ANSWERS[value]) return answer(value);
    if (GREETING.test(norm)) return reply(TEXT.greeting, MENU);
    if (THANKS.test(norm)) return reply([TEXT.thanks], MENU);

    const intent = INTENTS.find((item) => item.test.test(norm))?.key;
    if (intent === "cotizar") return startQuote(detectService(norm));
    if (intent) return answer(intent);

    const service = detectService(norm);
    if (service) return startQuote(service);
    return fallback();
  }

  function handle(text, value = "") {
    const norm = normalize(text);
    const freeText = FREE_TEXT_STATES.includes(state);

    if (value === "menu" || ["menu", "inicio", "volver"].includes(norm)) return toMenu(TEXT.backToMenu);
    if (value === "cancelar" || norm === "cancelar") return toMenu(TEXT.cancelled);
    if (
      value === "persona" ||
      ["persona", "humano", "asesor"].includes(norm) ||
      (!freeText && state !== "confirm" && WANTS_PERSON.test(norm))
    ) {
      return person();
    }
    if (state === "sending") return reply([TEXT.wait]);

    const clean = String(text ?? "").trim();

    switch (state) {
      case "service": {
        const key = value.startsWith("svc:") ? value.slice(4) : detectService(norm);
        if (!key) {
          misses += 1;
          if (misses >= 2) return fallback();
          return reply(["Elige un servicio de la lista o escríbelo con tus palabras."], [...SERVICE_REPLIES, CANCEL]);
        }
        lead.service = key;
        state = "zone";
        misses = 0;
        return reply([`Perfecto: ${labelOf(key)}.`, TEXT.askZone], [CANCEL]);
      }
      case "zone":
        if (clean.length < 2) return reply([TEXT.badZone], [CANCEL]);
        lead.zone = clean.slice(0, 100);
        state = "message";
        return reply([TEXT.askMessage], [CANCEL]);
      case "message":
        if (clean.length < 10) return reply([TEXT.badMessage], [CANCEL]);
        lead.message = clean.slice(0, 2000);
        state = "name";
        return reply([TEXT.askName], [CANCEL]);
      case "name":
        if (clean.length < 2) return reply([TEXT.badName], [CANCEL]);
        lead.name = clean.slice(0, 100);
        state = "phone";
        return reply([TEXT.askPhone], [CANCEL]);
      case "phone":
        if (!PHONE.test(clean)) return reply([TEXT.badPhone], [CANCEL]);
        lead.phone = clean;
        state = "email";
        return reply([TEXT.askEmail], [{ label: "Omitir", value: "skip" }, CANCEL]);
      case "email":
        if (value === "skip" || ["omitir", "no", "ninguno", "no tengo", "no gracias"].includes(norm)) {
          lead.email = "";
          return confirmStep();
        }
        if (!EMAIL.test(clean) || clean.length > 120) return reply([TEXT.badEmail], [{ label: "Omitir", value: "skip" }, CANCEL]);
        lead.email = clean;
        return confirmStep();
      case "confirm":
        if (value === "confirm" || ["si", "enviar", "ok", "dale", "confirmo", "claro"].includes(norm)) return submit();
        if (value === "restart" || ["no", "cambiar", "empezar de nuevo", "reiniciar"].includes(norm)) return startQuote();
        return reply([TEXT.confirmAsk], [{ label: "Sí, enviar mi solicitud", value: "confirm" }, { label: "Empezar de nuevo", value: "restart" }, CANCEL]);
      case "failed":
        if (value === "retry" || ["reintentar", "si", "otra vez"].includes(norm)) return submit();
        return reply([TEXT.sendFailed], [{ label: "Reintentar", value: "retry" }, { label: "Volver al menú", value: "menu" }]);
      default:
        return onIdle(value, norm);
    }
  }

  function submitted(ok, info = {}) {
    if (ok) {
      state = "idle";
      const sent = `¡Listo! Recibimos tu solicitud${info.id ? ` n.º ${info.id}` : ""}. Te contactaremos lo antes posible por teléfono o WhatsApp.`;
      lead = {};
      return reply([sent, "Si es urgente, también puedes escribirnos por WhatsApp."], [
        { label: "Escribir por WhatsApp", value: "persona" },
        { label: "Volver al menú", value: "menu" },
      ]);
    }
    state = "failed";
    return reply([info.message || TEXT.sendFailed, `[Abrir WhatsApp con mi solicitud](${waUrl(whatsappText())})`], [
      { label: "Reintentar", value: "retry" },
      { label: "Volver al menú", value: "menu" },
    ]);
  }

  return { start, handle, submitted, whatsappText };
}
