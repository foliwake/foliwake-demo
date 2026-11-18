// Article pages (Drupal articles, template "article"): the site chrome, a line
// above the title (back to the list, reading time) and the lead image as a figure.
import { addSiteChrome, labels, listPath, pageLanguage } from '../../scripts/site.js';

const WORDS_PER_MINUTE = 220;

const TEXT = {
  en: { back: 'All articles', minutes: (n) => `${n} min read` },
  es: { back: 'Todos los artículos', minutes: (n) => `${n} min de lectura` },
};

function readingMinutes(main) {
  const words = main.textContent.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

function articleMeta(main) {
  const text = TEXT[pageLanguage()];
  const meta = document.createElement('p');
  meta.className = 'article-meta';
  const back = document.createElement('a');
  back.href = listPath();
  back.textContent = `← ${text.back}`;
  const time = document.createElement('span');
  time.textContent = text.minutes(readingMinutes(main));
  meta.append(back, time);
  return meta;
}

// The engine writes the lead image as <p><img></p> right after the title.
function leadImage(title) {
  const next = title?.nextElementSibling;
  if (!next || next.tagName !== 'P' || next.children.length !== 1 || next.firstElementChild.tagName !== 'IMG') return;
  if (next.textContent.trim() !== '') return;
  const figure = document.createElement('figure');
  figure.className = 'article-lead';
  figure.append(next.firstElementChild);
  next.replaceWith(figure);
}

function enhance() {
  addSiteChrome();
  const main = document.querySelector('main');
  if (!main) return;
  main.classList.add('article');
  const title = main.querySelector('h1');
  if (title) title.before(articleMeta(main));
  leadImage(title);
  document.title = `${document.title} · ${labels().articles}`;
}

enhance();
