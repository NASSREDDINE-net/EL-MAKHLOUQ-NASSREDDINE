"use strict";
const T = {
  en: {home:"Home",projects:"Projects",about:"About",contact:"Contact",rights:"Designed and developed by Nassreddine El Makhlouq."},
  ar: {home:"الرئيسية",projects:"المشاريع",about:"من أنا",contact:"تواصل",rights:"تصميم وبرمجة نصر الدين المخلوق."}
};
function storeGet(key, fallback) { try { return localStorage.getItem(key) || fallback; } catch { return fallback; } }
function storeSet(key,value) { try { localStorage.setItem(key,value); } catch {} }
let lang = storeGet("portfolio-lang", (navigator.language || "").toLowerCase().startsWith("ar") ? "ar" : "en");
let theme = storeGet("portfolio-theme", matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
if (!T[lang]) lang = "en";
if (!["dark","light"].includes(theme)) theme = "dark";
function safeLocalizedContent(el, raw) {
  // Only one known, static highlighted span is supported; all other content is plain text.
  const m = /^(.*?)<span class=['"]gradient['"]>(.*?)<\/span>(.*)$/s.exec(raw);
  if (!m) { el.textContent = raw; return; }
  const span = document.createElement("span");
  span.className = "gradient";
  span.textContent = m[2];
  el.replaceChildren(document.createTextNode(m[1]), span, document.createTextNode(m[3]));
}
function applyLang() {
  document.documentElement.lang = lang;
  document.documentElement.dir = document.body.dir = lang === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const translated = T[lang][el.dataset.i18n];
    if (translated) el.textContent = translated;
  });
  document.querySelectorAll("[data-en][data-ar]").forEach(el =>
    safeLocalizedContent(el, lang === "ar" ? el.dataset.ar : el.dataset.en)
  );
  document.querySelectorAll("[data-lang-label]").forEach(el => {
    el.textContent = lang === "ar" ? "EN" : "AR";
    el.setAttribute("aria-label", lang === "ar" ? "Switch to English" : "التبديل إلى العربية");
  });
}
function applyTheme() {
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll("[data-theme-label]").forEach(el => {
    el.textContent = theme === "dark" ? "☀" : "☾";
    el.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme");
    el.setAttribute("aria-pressed", String(theme === "dark"));
  });
}
function toggleLang() { lang = lang === "ar" ? "en" : "ar"; storeSet("portfolio-lang",lang); applyLang(); }
function toggleTheme() { theme = theme === "dark" ? "light" : "dark"; storeSet("portfolio-theme",theme); applyTheme(); }
function updateProgress() {
  const root = document.documentElement;
  const max = root.scrollHeight - root.clientHeight;
  root.style.setProperty("--scroll-progress", (max ? Math.min(100, root.scrollTop / max * 100) : 0) + "%");
  document.querySelector("[data-back-top]")?.classList.toggle("visible", root.scrollTop > 500);
}
document.addEventListener("DOMContentLoaded", () => {
  applyLang(); applyTheme();
  document.querySelectorAll("[data-year]").forEach(el => { el.textContent = "2026–2027"; });
  const menu = document.querySelector(".menu");
  const toggle = document.querySelector("[data-menu-toggle]");
  const setMenu = open => {
    menu?.classList.toggle("open",open);
    toggle?.setAttribute("aria-expanded",String(open));
    toggle?.setAttribute("aria-label",open ? "Close menu" : "Open menu");
  };
  toggle?.addEventListener("click", () => setMenu(!menu?.classList.contains("open")));
  document.querySelectorAll(".menu a").forEach(a => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown",e => { if (e.key === "Escape" && menu?.classList.contains("open")) { setMenu(false); toggle?.focus(); } });
  document.addEventListener("click",e => { if (menu?.classList.contains("open") && !e.target.closest(".nav")) setMenu(false); });
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    }),{threshold:.06,rootMargin:"0px 0px 80px 0px"});
    document.querySelectorAll("[data-reveal]").forEach(el => observer.observe(el));
  } else document.querySelectorAll("[data-reveal]").forEach(el => el.classList.add("is-visible"));
  document.querySelector("[data-back-top]")?.addEventListener("click", () =>
    window.scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"})
  );
  updateProgress();
  let scheduled = false;
  window.addEventListener("scroll", () => {
    if (!scheduled) requestAnimationFrame(() => { updateProgress(); scheduled = false; });
    scheduled = true;
  },{passive:true});
});
