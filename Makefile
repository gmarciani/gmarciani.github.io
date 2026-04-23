# Prerequisites: run `nvm use` before using these targets.

.PHONY: clean build serve watch prod install

## Clean generated directories (static, layouts, resources, public)
clean:
	npm run clean

## Build assets (Gulp: views, fonts, images, scripts, styles, meta)
build:
	npm install
	npm run build

## Start Hugo dev server with drafts
serve: build
	npm run serve

## Gulp watch for live asset rebuilds
watch: build
	npm run watch

## Production Hugo build with minification
prod:
	npm install
	npm run prod
