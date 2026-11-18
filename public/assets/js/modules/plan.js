// Portada: la leyenda del plano ilumina cada parte de la casa; al tocarla,
// baja al servicio y abre su panel en el acordeón.
export function initPlan() {
  const plan = document.querySelector('[data-js="plan"]');
  if (!plan) return;

  const keys = [...plan.querySelectorAll(".plan__key")];
  const highlight = (key) => {
    if (key) plan.dataset.on = key.dataset.part;
    else delete plan.dataset.on;
    keys.forEach((k) => k.classList.toggle("is-on", k === key));
  };

  keys.forEach((key) => {
    key.addEventListener("mouseenter", () => highlight(key));
    key.addEventListener("focus", () => highlight(key));
    key.addEventListener("blur", () => highlight(null));
    key.addEventListener("click", () => {
      const item = document.getElementById(`svc-${key.dataset.service}`)?.closest(".service-acc__item");
      if (!item) return;
      item.querySelector(".service-acc__toggle")?.click();
      item.closest("section")?.scrollIntoView({ behavior: "smooth" });
    });
  });
  plan.querySelector(".plan__legend")?.addEventListener("mouseleave", () => highlight(null));

  // Quita la animación de trazado al terminar, para que el resaltado responda al instante
  window.setTimeout(() => plan.classList.remove("is-drawing"), 3500);
}
