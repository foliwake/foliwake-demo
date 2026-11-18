# Foliwake demo: Umami Kitchen

The frontend of the public Foliwake demo site. Its articles are the sample content of Drupal's
Umami demo profile (English and Spanish), read by Foliwake's Drupal source; this repository holds
only the design: page templates, blocks and styles on HTML contract 2. Created with
`create-foliwake` 0.8.0 (template `minimal`).

```text
templates/<name>/      page templates: home (the home page), article and article-list (Drupal pages)
components/<name>/     blocks: latest (newest articles, block-kit) and features
scripts/site.js        the header, footer and light/dark switch every template adds
scripts/components.js  the block loader (from create-foliwake)
styles/styles.css      styles of every page: colours, type, header and footer
site.yaml              site settings for the engine
content/               the home page (published from this repository with `foliwake preview`)
dev-content/           local pages shaped like the Drupal pages, for `npm run dev:articles` (not published)
tests/                 quick checks of the vendored scripts and workflows (node --test "tests/*.test.mjs")
foliwake.config.json   local configuration for the Foliwake CLI (`foliwake dev`): the code and the content
.github/               checks, branch previews and production
```

### How Drupal pages get their template

Drupal cannot write front matter, so the site's Drupal source names the templates with path mapping
rules (on the server, `foliwake site edit`):

```json
"mappings": [
  { "match": "{lang}/list.md", "metadata": { "template": "article-list" } },
  { "match": "{lang}/node-{nid}.md", "metadata": { "template": "article" } }
]
```

The pages in `dev-content/` name the same templates in their front matter.

There is no build step: the files in `components/`, `scripts/` and `styles/` are what the browser loads.

## Develop

### Without the Foliwake CLI

Check the code with the platform's own rules after every change:

```bash
npx @foliwake/site-check
node --test "tests/*.test.mjs"
```

`@foliwake/site-check` checks everything about the code that needs no rendering: block definitions, templates, `site.yaml`, the layout of the folders and the references of scripts and stylesheets. The platform runs the same checks first, so its messages are the same. The pages and the block examples are rendered by the platform: push a branch and open its preview (below).

### With the Foliwake CLI

The Foliwake CLI is not public yet. Where you have it, it adds a local preview and the page checks:

```bash
foliwake dev --watch
```

Open http://127.0.0.1:3000/ (`npm run dev`: the home page; `npm run dev:articles`: the sample article pages). Edit a page in `content/`, a block or a stylesheet and save: the browser reloads. `dev` uses only local files; no server, store or account is needed. Every block and its examples are on http://127.0.0.1:3000/_dev/blocks: each example rendered with your CSS and JavaScript, its HTML and its problems. Authors see the same examples as a block catalog at `/_foliwake/blocks` on the preview.

`foliwake page check` checks every page and block example too. In a folder linked to a site (`.foliwake/connection.json`) it checks the site's pages on the server; `foliwake page check --config foliwake.config.json [--content dev-content]` checks the local files.

### Add a block

1. Create `components/<name>/<name>.json` with its fields, for example a title and text:

   ```json
   {
     "label": { "en": "Tip" },
     "fields": [
       { "name": "title", "type": "heading", "level": 3, "min": 0 },
       { "name": "text", "type": "text", "max": null }
     ]
   }
   ```

   Field types: `heading`, `text`, `list`, `choices`, `quote`, `image`.
2. Add `components/<name>/<name>.css` (and `<name>.js` if it needs JavaScript: its default export is `init(root, host, meta)`, best made with block-kit: `import { defineBlock, html } from '@foliwake/block-kit'` and `defineBlock('<name>', (fields, ctx) => …)`; the page maps that import to the kit of the code release, so nothing is installed. `jsconfig.json` gives your editor the kit's types (`.foliwake/types/foliwake.d.ts`, from `@foliwake/block-kit`, written by create) and, with the Foliwake CLI, of your blocks (`foliwake dev` writes them to `.foliwake/types/blocks/`)). With the Foliwake CLI, `foliwake blocks new <name> --js --example` writes all the files.
3. Use it in a page:

   ```md
   :::tip

   ### A title

   Some text.

   :::
   ```

4. Show it in `components/<name>/<name>.example.md`: a line `<!-- example: Title -->` before each example, then the block as an author writes it. The examples appear in the authors' block catalog on the preview, on `/_dev/blocks` and in `foliwake blocks render` (fragments for Storybook); the platform renders them like pages.

The engine binds the content to the fields by their order and type and reports an error when the content does not fit, instead of guessing.

## Preview a change before it is live

The code that a Foliwake server publishes is always a **commit**. Commit your work first:

```bash
git add -A && git commit -m "Describe the change"
```

With the repository connected to your site (below):

- **Push a branch** → the branch preview `https://<branch>--<site>.<branch host domain>/` shows the site's pages with that branch's code. Deleting the branch removes its preview.
- **Merge into `main`** → the checks run, the server prepares a code release from exactly that commit and rebuilds every page with it in the site's **preview**. Live does not change.
- **Release** → review the preview, then release it in the Foliwake admin: *Frontend → New code → Release*. A rollback is in the same place (or `foliwake release rollback`, by an admin of the site).

## Connect to Foliwake

The workflows in `.github/workflows/` do nothing until the repository is connected. The "Frontend checks" workflow runs on every push and pull request from the start; it needs no secrets.

1. Push this repository to GitHub.
2. In the Foliwake admin, connect the repository to your site (or ask the operator of your Foliwake server to): it needs the clone URL (a private repository also needs a read token stored on the server) and gives you the **site id** — this project was created for the site id `demo`.
3. Create a CI key of the site: `foliwake account keys create --site <site id> --server <server address>`. It can deploy code and update branch previews of this one site; it cannot publish pages or roll back.
4. In the GitHub repository settings:
   - **Environments**: `branch-previews` and `production` (deployment branches: `main` only), each with the secret `FOLIWAKE_TOKEN` = the CI key.
   - **Variables**: `FOLIWAKE_SERVER` = the server's address (e.g. `https://foliwake.example.com`); `FOLIWAKE_SITE_ID` = the site id; `BRANCH_PREVIEWS_ENABLED` = `true` to turn on branch previews; `FRONTEND_PRODUCTION_DEPLOY_ENABLED` = `true` to turn on main → preview → live (with the site setting `codeRelease: auto`, the default, a merge to main is released when every page builds without problems; with `manual` it waits for Release in the admin); optionally `FOLIWAKE_PREVIEW_URL` and `FOLIWAKE_PRODUCTION_URL` (shown as links in GitHub).
   - **Branch protection** for `main`: require the "frontend-checks" status check.

Each variable switches on one workflow, so you can enable branch previews first and production later.

### The CLI version of the workflows

The workflows run the open Foliwake CLI with `npx @foliwake/cli@<version>`, outside the checkout (so only `FOLIWAKE_SERVER` picks the server). The version is the exact one in the `foliwake.cli` field of `package.json`, set by create to its own release:

```json
"foliwake": { "cli": "0.8.0" }
```

Update it there; the workflows refuse anything but an exact version (`1.2.3`, no range). It is deliberately not a `devDependency`: `npm run` puts `node_modules/.bin` first on PATH, and an installed `@foliwake/cli` (server commands only, no local preview) would replace your own `foliwake` in `npm run dev` and `npm run check:pages`. On your machine, install a CLI globally instead: `npm i -g @foliwake/cli` for the server commands (`foliwake account keys create`, `branch update`, …), or the Foliwake CLI described in "Develop" for the local preview and page checks.

To let [Renovate](https://docs.renovatebot.com/) bump the field, add a custom manager to `renovate.json`:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "customManagers": [
    {
      "customType": "regex",
      "description": "The Foliwake CLI the workflows run: package.json foliwake.cli",
      "managerFilePatterns": ["/(^|/)package\\.json$/"],
      "matchStrings": ["\"foliwake\"\\s*:\\s*\\{[^}]*\"cli\"\\s*:\\s*\"(?<currentValue>[^\"]+)\""],
      "depNameTemplate": "@foliwake/cli",
      "datasourceTemplate": "npm"
    }
  ]
}
```

With `enabledManagers` set, add `"custom.regex"` to it.

## Content

The pages in `content/` are local sample content for development. The site's real content lives in its content source on the Foliwake server (Markdown, Google Docs, Drupal, …), not in this repository.
