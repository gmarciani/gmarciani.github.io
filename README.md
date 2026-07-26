# Gmarciani

![GMARCIANI Logo](src/images/brand/logo.svg)

[![CI/CD](https://github.com/gmarciani/gmarciani.github.io/actions/workflows/cicd.yaml/badge.svg)](https://github.com/gmarciani/gmarciani.github.io/actions/workflows/cicd.yaml)

Personal blog at [gmarciani.github.io](https://gmarciani.github.io).

## Requirements

Install all requirements (Homebrew packages: Hugo, ImageMagick; Node.js from `.nvmrc` via nvm; npm dependencies, including Dart Sass):

```shell
make install
```

## Usage

Build:

```shell
make build
```

Serve the website:

```shell
make serve
```

Enable Gulp watching to live preview changes:

```shell
make watch
```

Clean generated directories:

```shell
make clean
```

Production build:

```shell
make prod
```
