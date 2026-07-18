# Activate the .nvmrc Node version when nvm is present; no-op where Node is
# already on PATH (e.g. CI).
NVM_USE = if [ -f "$${HOME}/.nvm/nvm.sh" ]; then . "$${HOME}/.nvm/nvm.sh" && nvm use; fi

.PHONY: clean build serve watch prod install

## Install requirements: Homebrew packages, Node from .nvmrc, npm dependencies
## (Dart Sass comes from the npm `sass` dependency, so it needs no brew formula)
install:
	brew install hugo imagemagick
	. "$${HOME}/.nvm/nvm.sh" && nvm install && npm install

## Clean generated directories (static, layouts, resources, public)
clean:
	$(NVM_USE) && npm run clean

## Build assets (Gulp: views, fonts, images, scripts, styles, meta)
build:
	$(NVM_USE) && npm install && npm run build

## Start Hugo dev server with drafts
serve: build
	$(NVM_USE) && npm run serve

## Gulp watch for live asset rebuilds
watch: build
	$(NVM_USE) && npm run watch

## Production Hugo build with minification
prod:
	$(NVM_USE) && npm install && npm run prod
