// latest: the newest articles of an article list as cards.
// The author writes a title and the path of a list page (e.g. /articles; block
// fields cannot hold links yet). The block reads that page's body
// (<path>.plain.html, served next to every page), takes its first three articles
// (heading with link, image, summary) and renders them with block-kit. The path
// itself is hidden; the page keeps a plain link to the list after the block, the
// way to the articles without JavaScript or when the list cannot be read.
import { defineBlock, html, nothing } from '@foliwake/block-kit';

const COUNT = 3;

const isImageParagraph = (el) => el?.tagName === 'P' && el.querySelector(':scope > img') !== null && el.textContent.trim() === '';

// The articles of a list page's body: [{ href, title, image, alt, summary }].
function articlesOf(body) {
  const doc = new DOMParser().parseFromString(body, 'text/html');
  const items = [];
  for (const heading of doc.querySelectorAll('h2')) {
    const link = heading.querySelector('a[href]');
    if (!link) continue;
    let next = heading.nextElementSibling;
    let image = null;
    if (isImageParagraph(next)) {
      image = next.querySelector('img');
      next = next.nextElementSibling;
    }
    const summary = next?.tagName === 'P' && !isImageParagraph(next) ? next.textContent.trim() : '';
    items.push({
      href: link.getAttribute('href'),
      title: link.textContent.trim(),
      image: image?.getAttribute('src') ?? null,
      srcset: image?.getAttribute('srcset') ?? null,
      alt: image?.getAttribute('alt') ?? '',
      summary,
    });
  }
  return items;
}

async function text(url, signal) {
  const response = await fetch(url, { signal, credentials: 'same-origin' });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.text();
}

// The list page's body: <path>.plain.html, or the <main> of the page itself where
// no plain body is served (`foliwake dev`).
async function readList(path, signal) {
  try {
    return await text(`${path}.plain.html`, signal);
  } catch (error) {
    if (signal.aborted) throw error;
    const page = new DOMParser().parseFromString(await text(path, signal), 'text/html');
    return page.querySelector('main')?.innerHTML ?? '';
  }
}

// Only a path of this site ("/articles"): the block never reads another origin.
function listPathOf(value) {
  const path = (value ?? '').trim().replace(/\/$/, '');
  if (!/^\/[a-z0-9][a-z0-9/_-]*$/i.test(path) || path.includes('//')) return null;
  return path;
}

const card = (item) => html`<li><article class="latest__card">
  ${item.image ? html`<figure class="latest__image"><img src=${item.image} srcset=${item.srcset ?? nothing}
    sizes="(min-width: 72rem) 22rem, (min-width: 40rem) 30vw, 100vw" alt=${item.alt} loading="lazy"></figure>` : nothing}
  <div class="latest__body"><h3><a href=${item.href}>${item.title}</a></h3>
  ${item.summary ? html`<p>${item.summary}</p>` : nothing}</div>
</article></li>`;

export default defineBlock('latest', (_fields, ctx) => {
  const state = ctx.state({ status: 'loading', items: [] });
  const path = listPathOf(ctx.field('list')?.textContent);
  if (!path) return;

  ctx.render(() => {
    const { status, items } = state.value;
    if (status === 'loading') return html`<p class="latest__status" role="status">${ctx.t('loading')}</p>`;
    if (status === 'failed') return nothing; // the link to the list after the block remains
    return html`<ul class="latest__cards">${items.map(card)}</ul>`;
  });

  readList(path, ctx.signal)
    .then((body) => {
      const items = articlesOf(body).slice(0, COUNT);
      state.value = items.length ? { status: 'ready', items } : { status: 'failed', items: [] };
      ctx.root.dataset.latest = state.value.status;
    })
    .catch((error) => {
      if (ctx.signal.aborted) return;
      console.warn('[latest]', error);
      state.value = { status: 'failed', items: [] };
      ctx.root.dataset.latest = 'failed';
    });
});
