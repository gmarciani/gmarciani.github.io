# Tech Stack

## Core
- **Static site generator**: [Hugo](https://gohugo.io/)
- **Templating**: Pug (compiled to HTML via Gulp)
- **Styling**: SCSS (compiled via Dart Sass + Gulp)
- **Asset pipeline**: Gulp 5 (scripts, styles, images, fonts, views, meta)
- **JavaScript**: ES modules (`"type": "module"` in package.json)
- **Node.js**: v24 (managed via nvm, pinned in `.nvmrc`)
- **Build orchestration**: Make

## Build Dependencies
- `gulp` — task runner for asset compilation
- `gulp-sass` + `sass` (Dart Sass) — SCSS compilation
- `gulp-pug` — Pug to HTML
- `gulp-uglify` — JS minification
- `gulp-clean-css` — CSS minification
- `gulp-imagemin` + `gulp-image-resize` — image optimization
- `gulp-concat` — JS bundling
- `gulp-sitemap` — sitemap generation
- `imagemagick` (system dep) — favicon generation

## Pre-commit
- `trailing-whitespace`, `check-yaml`, `check-added-large-files` (max 3MB)

## Common Commands

Activate the Node.js environment before running any target:

```shell
nvm use
```

| Command | Description |
|---|---|
| `make install` | Install Node.js dependencies |
| `make build` | Install deps + build assets (views, fonts, images, scripts, styles, meta) |
| `make serve` | Build assets then start Hugo dev server with drafts |
| `make watch` | Build assets then start Gulp watcher for live rebuilds |
| `make clean` | Clean generated directories (static, layouts, resources, public) |
| `make prod` | Production Hugo build with minification |

## Hosting
- GitHub Pages, deployed from `public/` directory
- Base URL: `https://gmarciani.github.io/`
