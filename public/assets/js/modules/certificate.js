// Garantías: el sello "cae" sobre el certificado cuando la hoja aparece en pantalla.
export function initCertificate() {
  const certificate = document.querySelector('[data-js="certificate"]');
  if (!certificate || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      certificate.classList.add("is-stamping");
      observer.disconnect();
    },
    { threshold: 0.5 },
  );
  observer.observe(certificate);
}
