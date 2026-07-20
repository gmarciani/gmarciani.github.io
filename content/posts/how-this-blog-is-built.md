---
title: "How this blog is built"
description: "The software stack behind this blog: Hugo, Pug, SCSS, and a Gulp pipeline, plus the process I use to maintain and publish it."
date: 2026-08-09
draft: true
categories: ["Personal Projects"]
---

This blog is a static site with a custom theme, and every part of it is code I can read, build, and break. No CMS, no database, no theme marketplace. Markdown goes in, HTML comes out, and everything in between is versioned in a single repository. This post walks through the stack, the build pipeline, and the process I use to keep it alive.

## The stack

The site runs on [Hugo](https://gohugo.io/), the static site generator. The theme is not a stock one: it is compiled from source I maintain in the same repository. [Pug](https://pugjs.org/) templates compile to the HTML layouts Hugo consumes, [SCSS](https://sass-lang.com/) compiles to the stylesheet, and a [Gulp](https://gulpjs.com/) pipeline orchestrates the whole thing: views, styles, scripts, fonts, images, and meta files. Formulas render with MathJax, and icons and social images are generated at build time with ImageMagick.

Hosting is [GitHub Pages](https://pages.github.com/). There is no server to patch and nothing to scale; the heaviest operational burden this blog can produce is a failed build.

## The build pipeline

The build has two stages, and understanding the split explains the whole repository layout:

1. **Gulp** compiles `src/` into the directories Hugo expects: Pug views become HTML layouts, SCSS becomes minified CSS, and fonts, images, and meta files are optimized and copied into place.
2. **Hugo** combines the Markdown content with the generated layouts and static assets, and produces the final site.

Everything generated is disposable and never edited by hand. The source of truth is only `content/` (the posts) and `src/` (the theme). A `Makefile` wraps the common operations: `make build` compiles assets, `make serve` runs a local server with drafts enabled, and `make prod` produces the minified production build without drafts.

## Deployment

Every push to the main branch triggers a GitHub Actions workflow: it installs Hugo, Node.js, ImageMagick, and Dart Sass, runs the two-stage build, and deploys the result to GitHub Pages. Publishing a post and deploying an infrastructure change are the same operation: a merge.

## The maintenance process

The blog follows an editorial plan: one post every two weeks, published on Sundays. Posts start as drafts; drafts are excluded from the production build, the sitemap, and the feeds, so work in progress never leaks. Publishing a post means setting its date, flipping `draft: false`, and merging; the deploy does the rest.

Every change lands through a pull request, and pre-commit hooks keep the repository honest. The same review discipline I apply to production systems applies here, at a fraction of the stakes; it keeps the muscle trained.

## What Hugo renders

The rest of this post is a live showcase of what the pipeline can render, useful as a self-test after theme changes and as a demonstration of Hugo's shortcodes.

### Links

Cross-references between posts use Hugo's `ref` shortcode, which resolves and validates the target at build time: [Hello World]({{< ref "posts/hello-world.md" >}}).

### Formulas

$$\int_{a}^{b} x^2 dx$$

### Figures

![Sample Image](/images/posts/sample-image.svg)

### YouTube

{{< youtube OTzTAp-uXgI >}}

### Vimeo

{{< vimeo 70476512 >}}

### Instagram

{{< instagram ChcyFLRtVFv >}}

### X

{{< x user=giacomomarciani id=1247056493712756737 >}}

### Code

```java
public static void main(String[] args) {
    System.out.println("Hello world!");
}
```

Remote files render through a custom `ghcode` shortcode that embeds source straight from GitHub:

{{< ghcode "https://raw.githubusercontent.com/gmarciani/yawa/mainline/docker-compose.yaml" >}}

### GitHub activity

The contribution chart below comes from a custom `ghactivity` shortcode:

{{< ghactivity username="gmarciani" >}}
