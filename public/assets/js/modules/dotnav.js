export function initDotnav() {
  const links = [...document.querySelectorAll('[data-js="dotnav-link"]')];
  if (links.length === 0 || !("IntersectionObserver" in window)) return;

  const byId = new Map(links.map((link) => [link.getAttribute("href").slice(1), link]));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => link.removeAttribute("aria-current"));
        byId.get(entry.target.id)?.setAttribute("aria-current", "true");
      });
    },
    { rootMargin: "-45% 0px -45% 0px" },
  );

  byId.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}
