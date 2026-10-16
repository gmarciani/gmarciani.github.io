# Activate the .nvmrc Node version when nvm is present, installing it if
# needed (CI runners ship nvm without our version); no-op where nvm is absent
# and Node is already on PATH.
NVM_USE = if [ -f "$${HOME}/.nvm/nvm.sh" ]; then . "$${HOME}/.nvm/nvm.sh" && nvm install; fi

.PHONY: help clean build serve watch prod install

help: ## show this help message
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*##' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  %-10s %s\n", $$1, $$2}'

install: ## install Homebrew packages, Node from .nvmrc, npm dependencies
	brew install hugo imagemagick
	. "$${HOME}/.nvm/nvm.sh" && nvm install && npm install

clean: ## delete generated directories and files
	$(NVM_USE) && npm run clean

build: ## build assets (Gulp: views, fonts, images, scripts, styles, meta)
	$(NVM_USE) && npm install && npm run build

serve: build ## start Hugo dev server with drafts
	$(NVM_USE) && npm run serve

watch: build ## Gulp watch for live asset rebuilds
	$(NVM_USE) && npm run watch

prod: ## production Hugo build with minification
	$(NVM_USE) && npm install && npm run prod
