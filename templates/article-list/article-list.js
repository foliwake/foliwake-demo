// Article lists (Drupal's generated list per language, template "article-list").
// The engine writes each article as a heading with its link, an image and a
// summary; this script groups them into cards. Without JavaScript the list
// stays a readable sequence of headings, images and summaries.
import { addSiteChrome } from '../../scripts/site.js';

const TEXT = {
  en: { intro: 'Recipes, tips and kitchen stories from the Umami food magazine.' },
  es: { intro: 'Recetas, consejos e historias de cocina de la revista Umami.' },
};

const isImageParagraph = (el) => el?.tagName === 'P' && el.children.length === 1 && el.firstElementChild.tagName === 'IMG' && el.textContent.trim() === '';

// One card from a heading and the image and summary that follow it.
function card(heading) {
  const item = document.createElement('li');
  const article = document.createElement('article');
  article.className = 'card';
  item.append(article);
  let next = heading.nextElementSibling;
  if (isImageParagraph(next)) {
    const figure = document.createElement('figure');
    figure.className = 'card__image';
    const image = next.firstElementChild;
    image.loading = 'lazy';
    image.sizes = '(min-width: 72rem) 22rem, (min-width: 40rem) 45vw, 100vw';
    figure.append(image);
    const after = next.nextElementSibling;
    next.remove();
    next = after;
    article.append(figure);
  }
  const body = document.createElement('div');
  body.className = 'card__body';
  heading.className = 'card__title';
  body.append(heading);
  if (next?.tagName === 'P' && !isImageParagraph(next)) {
    next.className = 'card__summary';
    body.append(next);
  }
  article.append(body);
  return item;
}

function cards(container) {
  const headings = [...container.querySelectorAll(':scope > h2')].filter((h) => h.querySelector('a'));
  if (headings.length === 0) return;
  const list = document.createElement('ul');
  list.className = 'cards';
  headings[0].before(list);
  for (const heading of headings) list.append(card(heading));
}

function intro(title) {
  const lang = document.documentElement.lang === 'es' ? 'es' : 'en';
  const p = document.createElement('p');
  p.className = 'list-intro';
  p.textContent = TEXT[lang].intro;
  title.after(p);
}

function enhance() {
  addSiteChrome();
  const title = document.querySelector('main h1');
  if (!title) return;
  intro(title);
  cards(title.parentElement);
  document.documentElement.classList.add('has-cards');
}

enhance();
