import { waUrl } from "../modules/whatsapp.js";
import { HELP_FEATURED, HELP_QA, HELP_TOPICS } from "./content.js";
import { createBot } from "./engine.js";

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g;
const SAFE_URL = /^(https:\/\/wa\.me\/|privacidad\/|#)/;
const WA_GENERIC = "Hola S2EAM, escribo desde el sitio web.";

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

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

const topicLabel = (key) => HELP_TOPICS.find((topic) => topic.key === key)?.label ?? key;

export function initAssistant() {
  const helper = document.querySelector('[data-js="helper"]');
  const dialog = document.querySelector('[data-js="help"]');
  if (!helper || !dialog) return;

  const get = (root, name) => root.querySelector(`[data-js="${name}"]`);
  const launcher = get(helper, "helper-toggle");
  const featured = get(helper, "helper-topics");

  const title = get(dialog, "help-title");
  const closeButton = get(dialog, "help-close");
  const topicsView = get(dialog, "help-topics-view");
  const chips = get(dialog, "help-chips");
  const list = get(dialog, "help-list");
  const answer = get(dialog, "help-answer");
  const composeToggle = get(dialog, "compose-toggle");
  const composeBox = get(dialog, "compose-box");
  const composeForm = get(dialog, "compose-form");
  const composeText = get(dialog, "compose-text");

  const chatView = get(dialog, "help-chat-view");
  const backButton = get(dialog, "chat-back");
  const log = get(dialog, "chat-log");
  const repliesBox = get(dialog, "chat-replies");
  const chatForm = get(dialog, "chat-form");
  const input = get(dialog, "chat-input");
  const personLink = get(dialog, "chat-person");

  const bot = createBot({ waUrl });
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, reduceMotion ? 0 : ms));

  let topic = HELP_QA[0].topic;
  let current = HELP_QA[0].id;
  let busy = false;

  /* ---------- Burbujas con preguntas destacadas ---------- */

  featured.replaceChildren(
    ...HELP_FEATURED.map((id) => HELP_QA.find((item) => item.id === id)).filter(Boolean).map((item) => {
      const li = el("li");
      const button = el("button", "helper__topic", item.q);
      button.type = "button";
      button.addEventListener("click", () => openHelp(item.id));
      li.append(button);
      return li;
    }),
  );
  const allTopics = el("li");
  const allButton = el("button", "helper__topic helper__topic--all", "Ver todos los temas →");
  allButton.type = "button";
  allButton.addEventListener("click", () => openHelp(HELP_QA[0].id));
  allTopics.append(allButton);
  featured.append(allTopics);

  function setFeatured(open) {
    featured.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
  }

  launcher.addEventListener("click", () => setFeatured(featured.hidden));
  document.addEventListener("click", (event) => {
    if (!featured.hidden && !event.target.closest('[data-js="helper"]')) setFeatured(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !featured.hidden) {
      setFeatured(false);
      launcher.focus();
    }
  });

  /* ---------- Centro de ayuda por temas ---------- */

  function renderChips() {
    chips.replaceChildren(
      ...HELP_TOPICS.map((item) => {
        const button = el("button", "help__chip", item.label);
        button.type = "button";
        button.setAttribute("aria-pressed", String(item.key === topic));
        button.addEventListener("click", () => {
          topic = item.key;
          current = HELP_QA.find((qa) => qa.topic === topic).id;
          render();
        });
        return button;
      }),
    );
  }

  function renderList() {
    list.replaceChildren(
      ...HELP_QA.filter((item) => item.topic === topic).map((item) => {
        const li = el("li");
        const button = el("button", "help__question");
        button.type = "button";
        button.setAttribute("aria-current", String(item.id === current));
        button.append(el("span", "help__question-topic", topicLabel(item.topic)), item.q);
        button.addEventListener("click", () => {
          current = item.id;
          render();
        });
        li.append(button);
        return li;
      }),
    );
  }

  function actionButton(action) {
    const variant = action.primary ? "button--primary" : "button--ghost";
    if (action.type === "wa" || action.type === "link") {
      const link = el("a", `button ${variant} button--small`, action.label);
      if (action.type === "wa") {
        link.href = waUrl(WA_GENERIC);
        link.target = "_blank";
        link.rel = "noopener";
      } else {
        link.href = action.href;
        if (action.href.startsWith("#")) link.addEventListener("click", () => dialog.close());
      }
      return link;
    }
    const button = el("button", `button ${variant} button--small`, action.label);
    button.type = "button";
    button.addEventListener("click", () => {
      if (action.type === "chat") startChat({ quote: true });
      if (action.type === "form") {
        dialog.close();
        document.querySelector("#contacto")?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
        window.setTimeout(() => document.querySelector("#name")?.focus({ preventScroll: true }), 500);
      }
    });
    return button;
  }

  function renderAnswer() {
    const item = HELP_QA.find((qa) => qa.id === current);
    title.textContent = item.q;

    const actions = el("div", "help__actions");
    actions.append(...item.actions.map(actionButton));

    const feedback = el("div", "help__feedback");
    const note = el("span", "help__feedback-note");
    feedback.append(el("span", "", "¿Te sirvió?"));
    for (const [label, useful] of [["Sí", true], ["No", false]]) {
      const button = el("button", "help__chip help__chip--small", label);
      button.type = "button";
      button.addEventListener("click", () => {
        note.textContent = useful ? "¡Gracias por contarnos!" : "Gracias. Escríbenos tu consulta abajo.";
        if (!useful) setCompose(true);
      });
      feedback.append(button);
    }
    feedback.append(note);

    answer.replaceChildren(
      el("p", "help__answer-label", `Respuesta rápida · ${topicLabel(item.topic)}`),
      el("h3", "help__answer-title", item.q),
      el("p", "help__answer-text", item.a),
      actions,
      feedback,
    );
  }

  function render() {
    renderChips();
    renderList();
    renderAnswer();
  }

  function setCompose(open) {
    composeBox.classList.toggle("help__compose-box--open", open);
    composeToggle.setAttribute("aria-expanded", String(open));
    if (open) window.setTimeout(() => composeText.focus(), reduceMotion ? 0 : 260);
  }

  function showTopics() {
    chatView.hidden = true;
    topicsView.hidden = false;
    renderAnswer();
  }

  function openHelp(id) {
    const item = HELP_QA.find((qa) => qa.id === id) ?? HELP_QA[0];
    topic = item.topic;
    current = item.id;
    setFeatured(false);
    setCompose(false);
    render();
    showTopics();
    if (!dialog.open) dialog.showModal();
  }

  closeButton.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close(); // clic en el fondo
  });
  dialog.addEventListener("close", () => launcher.focus());
  composeToggle.addEventListener("click", () => setCompose(!composeBox.classList.contains("help__compose-box--open")));

  /* ---------- Conversación (la caja de texto solo aparece aquí) ---------- */

  function addMessage(text, who) {
    const message = el("div", `chat__msg chat__msg--${who}`);
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
        const button = el("button", "chat__reply", reply.label);
        button.type = "button";
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
    log.scrollTop = log.scrollHeight;
    personLink.href = waUrl(bot.whatsappText());
    busy = false;
    if (result.action?.type === "submit") send(result.action.lead);
  }

  function onUser(text, value) {
    if (busy) return;
    addMessage(text, "user");
    show(bot.handle(text, value));
  }

  function startChat({ quote = false, text = "" } = {}) {
    topicsView.hidden = true;
    chatView.hidden = false;
    title.textContent = quote ? "Cotizar por aquí" : "Tu consulta";
    log.replaceChildren();
    bot.start(); // reinicia el estado sin mostrar el saludo
    if (quote) onUser("Quiero pedir una cotización", "cotizar");
    else if (text) onUser(text, "");
    input.focus();
  }

  composeForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = composeText.value.trim();
    if (!text) {
      composeText.focus();
      return;
    }
    composeText.value = "";
    startChat({ text });
  });

  backButton.addEventListener("click", showTopics);

  chatForm.addEventListener("submit", (event) => {
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
