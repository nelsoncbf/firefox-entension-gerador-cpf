-include .env
export

EXTENSION_DIR := firefox-extension
ARTIFACTS_DIR := web-ext-artifacts
REPO          := nelsoncbf/firefox-entension-gerador-cpf
VERSION       := $(shell node -p "require('./$(EXTENSION_DIR)/manifest.json').version")
XPI_NAME      := gerador-cpf-$(VERSION).xpi
RELEASE_URL   := https://github.com/$(REPO)/releases/download/v$(VERSION)/$(XPI_NAME)

DOCKER_RUN := docker run --rm \
	-v "$(PWD)/$(EXTENSION_DIR):/extension" \
	-v "$(PWD)/$(ARTIFACTS_DIR):/artifacts" \
	-e WEB_EXT_API_KEY=$(AMO_API_KEY) \
	-e WEB_EXT_API_SECRET=$(AMO_API_SECRET) \
	node:lts \
	npx web-ext

.PHONY: all build sign release _update-updates-json clean help

all: help

help:
	@echo "Targets disponíveis:"
	@echo "  build                   Gera o .xpi sem assinar (para teste)"
	@echo "  sign                    Assina o .xpi via AMO e atualiza o updates.json"
	@echo "  release VERSION=x.x.x  Atualiza versão, assina e prepara o release"
	@echo "  clean                   Remove artefatos gerados"

build:
	@echo "Construindo versão $(VERSION)..."
	@mkdir -p $(ARTIFACTS_DIR)
	$(DOCKER_RUN) build \
		--source-dir=/extension \
		--artifacts-dir=/artifacts \
		--overwrite-dest
	@echo "Gerado em: $(ARTIFACTS_DIR)/"

sign: build
	@echo "Assinando versão $(VERSION) via AMO..."
	$(DOCKER_RUN) sign \
		--source-dir=/extension \
		--artifacts-dir=/artifacts \
		--channel=unlisted
	@$(MAKE) _update-updates-json
	@echo ""
	@echo "Próximo passo: crie a Release v$(VERSION) no GitHub e faça upload do .xpi de $(ARTIFACTS_DIR)/"

release:
ifndef VERSION
	$(error Use: make release VERSION=x.x.x)
endif
	@echo "Atualizando manifest.json para versão $(VERSION)..."
	@node -e " \
		const fs = require('fs'); \
		const m = JSON.parse(fs.readFileSync('$(EXTENSION_DIR)/manifest.json')); \
		m.version = '$(VERSION)'; \
		fs.writeFileSync('$(EXTENSION_DIR)/manifest.json', JSON.stringify(m, null, 2) + '\n'); \
	"
	@$(MAKE) sign VERSION=$(VERSION)

_update-updates-json:
	@node -e " \
		const fs = require('fs'); \
		const u = JSON.parse(fs.readFileSync('updates.json')); \
		const addon = u.addons['gerador-cpf@nelsoncbf']; \
		const exists = addon.updates.find(v => v.version === '$(VERSION)'); \
		if (!exists) { \
			addon.updates.push({ version: '$(VERSION)', update_link: '$(RELEASE_URL)' }); \
			fs.writeFileSync('updates.json', JSON.stringify(u, null, 2) + '\n'); \
			console.log('updates.json atualizado com v$(VERSION).'); \
		} else { \
			console.log('Versão $(VERSION) já existe no updates.json.'); \
		} \
	"

clean:
	rm -rf $(ARTIFACTS_DIR)
