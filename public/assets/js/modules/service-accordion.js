// Acordeón de servicios: un panel abierto por grupo. Se abre con clic/toque o teclado,
// y al pasar el mouse en pantallas con puntero.
const HOVER = window.matchMedia("(hover: hover) and (min-width: 48rem)");

function setOpen(items, target) {
  items.forEach((item) => {
    const open = item === target;
    item.classList.toggle("is-open", open);
    item.querySelector(".service-acc__toggle")?.setAttribute("aria-expanded", String(open));
  });
}

export function initServiceAccordion() {
  document.querySelectorAll('[data-js="service-acc"]').forEach((list) => {
    const items = [...list.querySelectorAll(".service-acc__item")];

    items.forEach((item) => {
      const toggle = item.querySelector(".service-acc__toggle");
      toggle?.addEventListener("click", () => {
        setOpen(items, item);
        item.querySelector(".service-acc__action")?.focus({ preventScroll: true });
      });
      item.addEventListener("mouseenter", () => {
        if (HOVER.matches) setOpen(items, item);
      });
    });
  });
}
