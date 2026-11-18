// "Cómo trabajamos": al elegir una etapa, la barra de avance llega hasta ella.
export function initSteps() {
  const root = document.querySelector('[data-js="steps"]');
  if (!root) return;

  const buttons = [...root.querySelectorAll(".steps__button")];
  const select = (index) => {
    root.style.setProperty("--progress", `${((index + 1) / buttons.length) * 100}%`);
    buttons.forEach((button, i) => {
      button.classList.toggle("is-done", i <= index);
      button.setAttribute("aria-pressed", String(i === index));
    });
  };

  buttons.forEach((button, i) => button.addEventListener("click", () => select(i)));
  select(0);
}
