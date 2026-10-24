"use strict";
(() => {
  const root=document.documentElement;
  const translations={en:{},ar:{}};
  const safeGet=(k)=>{try{return localStorage.getItem(k)}catch{return null}};
  const safeSet=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
  let language=safeGet("nm-language")||((navigator.language||"").toLowerCase().startsWith("ar")?"ar":"en");
  let theme=safeGet("nm-theme")||(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");
  if(!["en","ar"].includes(language))language="en";
  if(!["dark","light"].includes(theme))theme="light";
  const setTranslatedContent=(node,value)=>{
    // Trusted, static templates in data attributes support an emphasized <em> segment.
    const match=/^(.*?)<em>(.*?)<\/em>(.*)$/s.exec(value);
    if(match){const em=document.createElement("em");em.textContent=match[2];node.replaceChildren(document.createTextNode(match[1]),em,document.createTextNode(match[3]));return;}
    const br=value.includes("<br>");
    if(br){const parts=value.split("<br>");node.replaceChildren(...parts.flatMap((part,index)=>index?[document.createElement("br"),document.createTextNode(part)]:[document.createTextNode(part)]));return;}
    node.textContent=value;
  };
  // Only the explicit HTML snippets embedded in our own localization strings are rendered;
  // no user input is inserted into DOM as HTML.
  const renderTranslation=(node,value)=>{
    // Account for headings that contain both a line break and emphasized phrase.
    if(!value.includes("<br>")||!value.includes("<em>")){setTranslatedContent(node,value);return;}
    const parts=value.split("<br>");
    const fragment=document.createDocumentFragment();
    parts.forEach((part,i)=>{if(i)fragment.append(document.createElement("br"));const span=document.createElement("span");setTranslatedContent(span,part);while(span.firstChild)fragment.append(span.firstChild);});
    node.replaceChildren(fragment);
  };
  const applyLanguage=()=>{
    root.lang=language;root.dir=language==="ar"?"rtl":"ltr";
    document.querySelectorAll("[data-en][data-ar]").forEach(node=>renderTranslation(node,language==="ar"?node.dataset.ar:node.dataset.en));
    const button=document.querySelector("[data-lang-switch]");
    if(button){button.textContent=language==="ar"?"EN":"AR";button.setAttribute("aria-label",language==="ar"?"Switch to English":"التبديل إلى العربية");}
  };
  const applyTheme=()=>{
    root.dataset.theme=theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content",theme==="dark"?"#121a16":"#f7f7f2");
    const button=document.querySelector("[data-theme-switch]");
    if(button){button.textContent=theme==="dark"?"☀":"◐";button.setAttribute("aria-label",theme==="dark"?"Switch to light theme":"Switch to dark theme");button.setAttribute("aria-pressed",String(theme==="dark"));}
  };
  const init=()=>{
    applyTheme();applyLanguage();
    document.querySelector("[data-lang-switch]")?.addEventListener("click",()=>{language=language==="en"?"ar":"en";safeSet("nm-language",language);applyLanguage();});
    document.querySelector("[data-theme-switch]")?.addEventListener("click",()=>{theme=theme==="light"?"dark":"light";safeSet("nm-theme",theme);applyTheme();});
    const nav=document.querySelector("#site-nav"),toggle=document.querySelector("[data-menu-switch]");
    const menu=(open)=>{nav?.classList.toggle("is-open",open);toggle?.setAttribute("aria-expanded",String(open));toggle?.setAttribute("aria-label",open?"Close navigation":"Open navigation");if(toggle)toggle.textContent=open?"✕":"☰";};
    toggle?.addEventListener("click",()=>menu(!nav?.classList.contains("is-open")));
    nav?.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>menu(false)));
    document.addEventListener("keydown",event=>{if(event.key==="Escape"&&nav?.classList.contains("is-open")){menu(false);toggle?.focus();}});
    document.addEventListener("click",event=>{if(nav?.classList.contains("is-open")&&!event.target.closest(".site-header"))menu(false);});
    const filters=[...document.querySelectorAll("[data-filter]")];
    const cards=[...document.querySelectorAll(".project-tile[data-category]")];
    filters.forEach(filter=>filter.addEventListener("click",()=>{
      const selected=filter.dataset.filter;
      filters.forEach(f=>{const yes=f===filter;f.classList.toggle("is-active",yes);f.setAttribute("aria-pressed",String(yes));});
      cards.forEach(card=>card.hidden=selected!=="all"&&card.dataset.category!==selected);
    }));
    const top=document.querySelector("[data-top]");
    const syncTop=()=>top?.classList.toggle("show",window.scrollY>650);
    syncTop();window.addEventListener("scroll",syncTop,{passive:true});
    top?.addEventListener("click",()=>window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"}));
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
