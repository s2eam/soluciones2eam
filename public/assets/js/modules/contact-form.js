import { waUrl } from "./whatsapp.js";

class FormError extends Error {}

export function initContactForm() {
  const form = document.querySelector('[data-js="contact-form"]');
  if (!form) return;

  const status = form.querySelector('[data-js="status"]');
  const submit = form.querySelector('button[type="submit"]');
  const whatsapp = form.querySelector('[data-js="form-whatsapp"]');
  const idleLabel = submit.textContent;

  function setStatus(text, isError = false) {
    status.textContent = text;
    status.classList.toggle("contact-form__status--error", isError);
  }

  function setBusy(busy) {
    submit.disabled = busy;
    submit.textContent = busy ? "Enviando…" : idleLabel;
  }

  function showSent() {
    submit.classList.add("button--success");
    submit.textContent = "Solicitud enviada";
    window.setTimeout(() => {
      submit.classList.remove("button--success");
      submit.textContent = idleLabel;
    }, 3000);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form));
    data.consent = form.elements.consent.checked;
    setBusy(true);
    setStatus("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const first = result.errors && Object.values(result.errors)[0];
        throw first ? new FormError(first) : new Error("request_failed");
      }
      form.reset();
      setBusy(false);
      showSent();
      setStatus(`Recibimos tu solicitud${result.id ? ` (n.º ${result.id})` : ""}. Te responderemos pronto.`);
    } catch (error) {
      setBusy(false);
      setStatus(
        error instanceof FormError
          ? error.message
          : "No pudimos enviar tu solicitud. Inténtalo de nuevo o envíala por WhatsApp.",
        true,
      );
    }
  });

  // Alternativa sin servidor: arma el mensaje con lo que ya se llenó y abre WhatsApp.
  whatsapp?.addEventListener("click", () => {
    const fields = form.elements;
    const service = fields["service"];
    const parts = ["Hola, quiero pedir una cotización."];
    if (fields["name"].value.trim()) parts.push(`Nombre: ${fields["name"].value.trim()}.`);
    if (service.value) parts.push(`Servicio: ${service.options[service.selectedIndex].text}.`);
    if (fields["zone"].value.trim()) parts.push(`Zona: ${fields["zone"].value.trim()}.`);
    if (fields["message"].value.trim()) parts.push(fields["message"].value.trim());
    window.open(waUrl(parts.join(" ")), "_blank", "noopener");
  });
}
