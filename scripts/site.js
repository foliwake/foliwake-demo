// The site's header and footer, and its light/dark switch.
// Every template's script calls addSiteChrome() once. Pages are plain HTML from the
// engine (<main> only), so the chrome is added here; without JavaScript the page
// is still complete and readable.

const LABELS = {
  en: {
    home: 'Home',
    articles: 'Articles',
    otherLanguage: 'Español',
    theme: 'Switch between light and dark',
    content: 'Sample content: the Drupal Umami demo.',
    builtWith: 'Published with Foliwake',
    source: 'Source on GitHub',
  },
  es: {
    home: 'Inicio',
    articles: 'Artículos',
    otherLanguage: 'English',
    theme: 'Cambiar entre claro y oscuro',
    content: 'Contenido de ejemplo: la demo Umami de Drupal.',
    builtWith: 'Publicado con Foliwake',
    source: 'Código en GitHub',
  },
};

const REPOSITORY = 'https://github.com/foliwake/foliwake-demo';
const THEME_KEY = 'foliwake-demo-theme';

const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

/** The page language this site has labels for (en or es). */
export function pageLanguage() {
  const lang = (document.documentElement.lang || 'en').slice(0, 2);
  return lang === 'es' ? 'es' : 'en';
}

/** The labels of the page language. */
export function labels() {
  return LABELS[pageLanguage()];
}

/** The article list of the page language: /articles or /es/articles. */
export function listPath(lang = pageLanguage()) {
  return lang === 'es' ? '/es/articles' : '/articles';
}

function storedTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // Private mode or blocked storage: the switch still works for this page.
  }
}

function currentTheme() {
  const set = document.documentElement.dataset.theme;
  if (set === 'light' || set === 'dark') return set;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyStoredTheme() {
  const theme = storedTheme();
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
}

function themeButton(text) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'theme-toggle';
  button.setAttribute('aria-label', text.theme);
  button.title = text.theme;
  const paint = () => {
    button.innerHTML = currentTheme() === 'dark' ? SUN : MOON;
  };
  button.addEventListener('click', () => {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    storeTheme(next);
    paint();
  });
  paint();
  return button;
}

function link(href, text) {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text;
  if (location.pathname === href) a.setAttribute('aria-current', 'page');
  return a;
}

function header(text) {
  const lang = pageLanguage();
  const element = document.createElement('header');
  element.className = 'site-header';
  element.innerHTML = `<div class="site-header__inner">
    <a class="site-brand" href="/"><span><span class="site-brand__mark">Umami</span> Kitchen</span>
    <span class="site-brand__tag">Foliwake demo</span></a>
    <nav class="site-nav" aria-label="Site"></nav>
  </div>`;
  const nav = element.querySelector('nav');
  nav.append(link(listPath(lang), text.articles));
  const other = lang === 'es' ? 'en' : 'es';
  const otherLink = link(listPath(other), text.otherLanguage);
  otherLink.lang = other;
  otherLink.hreflang = other;
  nav.append(otherLink);
  element.querySelector('.site-header__inner').append(themeButton(text));
  return element;
}

function footer(text) {
  const element = document.createElement('footer');
  element.className = 'site-footer';
  element.innerHTML = `<div class="site-footer__inner">
    <p></p>
    <p><span></span> · <a href="${REPOSITORY}"></a></p>
  </div>`;
  const [content, built] = element.querySelectorAll('p');
  content.textContent = text.content;
  built.querySelector('span').textContent = text.builtWith;
  built.querySelector('a').textContent = text.source;
  return element;
}

let added = false;

/** Adds the header and footer around <main> (once per page). */
export function addSiteChrome() {
  if (added) return;
  added = true;
  applyStoredTheme();
  const text = labels();
  document.body.prepend(header(text));
  document.body.append(footer(text));
}
