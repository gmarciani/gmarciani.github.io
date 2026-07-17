# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Personal technical blog for Giacomo Marciani ([gmarciani.github.io](https://gmarciani.github.io)) — a static Hugo site with a custom theme built from Pug templates, SCSS, and a Gulp asset pipeline.

## Commands

Requires Node 24 (`nvm use`), Hugo **extended**, ImageMagick, and Dart Sass.

| Command | What it does |
|---|---|
| `make build` | Gulp: compile `src/` → `layouts/`, `static/`, `assets/og/`. Run this after **any** change to `src/`, `content/`, `gulpfile.js`, or `config.yaml`. |
| `make serve` | `make build` then `hugo server -D` (includes drafts) at localhost:1313. |
| `make watch` | `make build` then Gulp watcher for live asset rebuilds. |
| `make prod` | Production build: `hugo --gc --minify`. **Excludes drafts.** |
| `make clean` | Delete generated dirs (`static/`, `layouts/`, `resources/`, `public/`). |

There is no test suite. Pre-commit hooks enforce trailing-whitespace, `check-yaml`, and a 3 MB max file size (`.pre-commit-config.yaml`).

## The two-stage build (most important thing to understand)

This is **not** a stock Hugo theme. The build has two stages:

1. **Gulp** (`gulpfile.js`) compiles source into the directories Hugo expects:
   - `src/views/**/*.pug` → `layouts/**/*.html` (Hugo templates)
   - `src/styles/main.scss` → `static/styles/main.min.css`
   - `src/scripts/`, `src/fonts/`, `src/images/`, `src/meta/` → `static/`
   - `scripts/gen-og-base.mjs` → `assets/og/og-base.png`
2. **Hugo** builds `public/` from `content/` + the generated `layouts/` + `static/` + `assets/`.

**`layouts/`, `static/`, `public/`, `resources/` are all generated — never edit them.** They are gitignored. Edit `src/` and `content/`, then `make build`. Editing a compiled file in `layouts/` will be silently overwritten on the next build.

### Template authoring notes

- Templates are **Pug**, not Go HTML. Hugo directives are embedded as literal text: `content='{{ .Title }}'` in attributes, or `| {{ ... }}` lines for standalone Hugo logic.
- Files under `src/views/` with a `.html` or `.txt` extension are **passed through verbatim** (not compiled) — used for Hugo templates that are awkward to express in Pug. Two exist today: `src/views/partials/seo/meta.html` (all SEO/social/JSON-LD logic) and `src/views/index.llms.txt` (the `/llms.txt` output).
- A Pug `include seo/meta.html` inlines that raw file **at compile time**, so its Hugo `{{ }}` code lands inside the compiled `head.html` and shares the surrounding template's variable scope. This is how `head.pug` pulls in the SEO partial.
- `assets/` is **committed source** read by Hugo via `resources.Get` (fonts + OG base image) — distinct from the generated `static/`. Do not confuse the two.

## SEO / social / AI-agent metadata

All page-level metadata is centralized in `src/views/partials/seo/meta.html` (included by `head.pug`): page-aware title/canonical/description/keywords/robots, Open Graph + Twitter cards, and schema.org JSON-LD (`Person`, `WebSite`, `BlogPosting`, `BreadcrumbList`).

- **Per-post OG images** are generated at Hugo build time via `images.Text` overlaying the page title on `assets/og/og-base.png` (the branded 1200×630 canvas from `scripts/gen-og-base.mjs`). A post can override with an `image:` front-matter field. When touching the title overlay, note it uses manual word-wrapping and only long-stable `images.Text` options on purpose (avoids version-sensitive options like `maxWidth`).
- `robots.txt` is a **static file** (`src/meta/robots.txt`), so `enableRobotsTXT: false` in `config.yaml` prevents Hugo from generating a conflicting one.
- `/llms.txt` is a custom Hugo home output format (`outputFormats.llms` in `config.yaml`, template `src/views/index.llms.txt`).
- The Gulp `meta` task uses `{ dot: true }` so dotfiles (`.manifest.json`, `.msconfig.xml`) actually publish.

## Content conventions

Detailed content-authoring guidance — post structure, quoting posts, and the blog's voice/tone — lives in `content/CLAUDE.md`, which auto-loads when working under `content/`. **Read it before creating or editing posts.** Key points:

- Posts live in `content/posts/{category}/`. Each category's `_index.md` sets the category taxonomy via Hugo `cascade`.
- HPC series posts use a two-digit numeric prefix: `01-topic-slug.md`.
- New posts default to `draft: true` (`archetypes/default.md`). **Drafts are excluded from `make prod`**, so a draft post also stays out of the sitemap and `llms.txt` until published.
- Cross-references use the `{{< ref "posts/....md" >}}` shortcode.
- Front matter: `title`, `description` (drives meta/OG/JSON-LD/llms.txt — keep under ~160 chars), `date` (YYYY-MM-DD), `draft`, optional `categories`/`tags`/`image`.
- "Quoting" posts are short blockquote posts filed under the **topic's** category (not a "quoting" category) — see `structure.md` for the exact title/slug/body format.

## Deployment

GitHub Actions (`.github/workflows/deploy.yaml`) deploys to GitHub Pages on push to `main`: installs Hugo extended + Node + ImageMagick + Dart Sass, runs `make build` then `make prod`, and publishes `public/`. Base URL comes from the `BASE_URL` env var (defaults to `https://gmarciani.github.io/`).

## Pull requests

Every PR **must follow `.github/PULL_REQUEST_TEMPLATE.md`** — mirror its sections (Description of changes, Tests, References, Checklist) and fill each from the actual changes. The template already ends with the "created with the assistance of Claude Code" attribution, so **do not add a second attribution** (no extra "Generated with Claude Code" footer) — keep exactly one, the template's.
