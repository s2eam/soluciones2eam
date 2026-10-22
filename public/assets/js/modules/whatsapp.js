import { WHATSAPP_NUMBER, WHATSAPP_TEXT } from "../config.js";

export const waUrl = (text) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

function setLink(link, text) {
  link.href = waUrl(text);
  link.target = "_blank";
  link.rel = "noopener";
}

function initWidget() {
  const toggle = document.querySelector('[data-js="wa-toggle"]');
  const panel = document.querySelector('[data-js="wa-panel"]');
  if (!toggle || !panel) return;

  const setOpen = (open) => {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
  };

  toggle.addEventListener("click", () => setOpen(panel.hidden));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!panel.hidden && !event.target.closest('[data-js="wa-widget"]')) setOpen(false);
  });
}

export function initWhatsapp() {
  document.querySelectorAll('[data-js="whatsapp"]').forEach((link) => setLink(link, WHATSAPP_TEXT));
  document.querySelectorAll('[data-js="wa-option"]').forEach((link) => {
    setLink(link, `Hola, quiero cotizar: ${link.dataset.topic}.`);
  });
  initWidget();
}
