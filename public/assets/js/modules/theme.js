// La versión B es la predeterminada; "?tema=a" muestra la versión A para comparar.
const LOGOS = { a: "logo-mark.svg", b: "logo-mark-b.svg" };

export function initTheme() {
  const theme = new URLSearchParams(window.location.search).get("tema");
  if (!LOGOS[theme]) return;

  if (theme === "a") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;

  document.querySelectorAll('[data-js="logo"]').forEach((img) => {
    img.src = img.src.replace(/logo-mark(-b)?\.svg/, LOGOS[theme]);
  });
}
