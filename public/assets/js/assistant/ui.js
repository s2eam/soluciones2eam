import { waUrl } from "../modules/whatsapp.js";
import { createBot } from "./engine.js";

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const SAFE_URL = /^(https:\/\/wa\.me\/|privacidad\/|#)/;

// Convierte [texto](url) en enlaces seguros usando solo nodos de texto (sin innerHTML).
function renderText(element, text) {
  let last = 0;
  for (const match of text.matchAll(LINK)) {
    const [full, label, url] = match;
    element.append(text.slice(last, match.index));
    if (SAFE_URL.test(url)) {
      const link = document.createElement("a");
      link.href = url;
      link.textContent = label;
      link.target = "_blank";
      link.rel = "noopener";
      element.append(link);
    } else {
      element.append(label);
    }
    last = match.index + full.length;
  }
  element.append(text.slice(last));
}

export function initAssistant() {
  const root = document.querySelector('[data-js="chat"]');
  if (!root) return;

  const get = (name) => root.querySelector(`[data-js="${name}"]`);
  const toggle = get("chat-toggle");
  const panel = get("chat-panel");
  const closeButton = get("chat-close");
  const log = get("chat-log");
  const repliesBox = get("chat-replies");
  const form = get("chat-form");
  const input = get("chat-input");
  const personLink = get("chat-person");

  const bot = createBot({ waUrl });
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let started = false;
  let busy = false;

  const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, reduceMotion ? 0 : ms));

  function addMessage(text, who) {
    const message = document.createElement("div");
    message.className = `chat__msg chat__msg--${who}`;
    if (who === "typing") {
      message.setAttribute("aria-hidden", "true");
      message.textContent = "…";
    } else {
      renderText(message, text);
    }
    log.append(message);
    log.scrollTop = log.scrollHeight;
    return message;
  }

  function setReplies(replies) {
    repliesBox.replaceChildren(
      ...replies.map((reply) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "chat__reply";
        button.textContent = reply.label;
        button.addEventListener("click", () => onUser(reply.label, reply.value));
        return button;
      }),
    );
  }

  async function send(lead) {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.ok) {
        await show(bot.submitted(true, { id: data.id }));
      } else {
        const first = data.errors && Object.values(data.errors)[0];
        await show(bot.submitted(false, { message: first }));
      }
    } catch {
      await show(bot.submitted(false));
    }
  }

  async function show(result) {
    busy = true;
    setReplies([]);
    for (const text of result.messages) {
      const typing = addMessage("", "typing");
      await sleep(450);
      typing.remove();
      addMessage(text, "bot");
    }
    setReplies(result.replies);
    personLink.href = waUrl(bot.whatsappText());
    busy = false;
    if (result.action?.type === "submit") send(result.action.lead);
  }

  function onUser(text, value) {
    if (busy) return;
    addMessage(text, "user");
    show(bot.handle(text, value));
  }

  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (!open) return;
    if (!started) {
      started = true;
      show(bot.start());
    }
    input.focus();
  }

  toggle.addEventListener("click", () => setOpen(panel.hidden));
  closeButton.addEventListener("click", () => {
    setOpen(false);
    toggle.focus();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      setOpen(false);
      toggle.focus();
    }
  });
  document.addEventListener("click", (event) => {
    if (!panel.hidden && !event.target.closest('[data-js="chat"]')) setOpen(false);
  });
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = "";
    onUser(text, "");
  });

  personLink.href = waUrl(bot.whatsappText());
  personLink.target = "_blank";
  personLink.rel = "noopener";
}
