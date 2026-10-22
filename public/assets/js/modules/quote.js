export function initQuote() {
  const select = document.querySelector("#service");
  const name = document.querySelector("#name");
  if (!select) return;

  document.querySelectorAll('[data-js="quote"]').forEach((button) => {
    button.addEventListener("click", () => {
      select.value = button.dataset.service;
      select.classList.remove("contact-form__input--flash");
      void select.offsetWidth; // reinicia la animación si ya se había mostrado
      select.classList.add("contact-form__input--flash");
      window.setTimeout(() => name?.focus({ preventScroll: true }), 500);
    });
  });

  select.addEventListener("animationend", () => {
    select.classList.remove("contact-form__input--flash");
  });
}
