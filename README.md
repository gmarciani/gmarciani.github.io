# Gmarciani

![GMARCIANI Logo](src/images/logo/gm-logo.svg)

[![CI/CD](https://github.com/gmarciani/gmarciani.github.io/actions/workflows/cicd.yaml/badge.svg)](https://github.com/gmarciani/gmarciani.github.io/actions/workflows/cicd.yaml)

Personal blog at [gmarciani.github.io](https://gmarciani.github.io).

## Requirements

Install Node.js 24 and Hugo:

```shell
nvm install 24
brew install hugo imagemagick
```

## Usage

Activate the Node.js environment:

```shell
nvm use
```

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
