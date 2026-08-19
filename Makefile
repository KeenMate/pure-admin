# Pure Admin Workspace - Makefile
# Root workspace commands for development and build

# --- Windows recipe-shell fix -------------------------------------------------
# GNU make on Windows picks Git's bare `usr/bin/sh.exe` as the recipe shell.
# When make is launched from cmd.exe / PowerShell, that sh runs npm/npx's Unix
# shell-shims, whose `#!/usr/bin/env bash` line searches PATH for `bash`. On a
# stock Windows PATH the first `bash` is `C:\Windows\System32\bash.exe` — WSL's
# bash — which can't see Windows paths (`C:/Program Files/nodejs/npm`), so it
# dies with a misleading "No such file or directory" (make Error 127). Git
# Bash works only because its PATH puts MSYS `/usr/bin` ahead of System32.
# Pinning the recipe shell to Git's FULL bash launcher rebuilds PATH with
# `/usr/bin` first, so `env bash` resolves to MSYS bash regardless of the
# launching shell. Guarded by $(wildcard) so it's a no-op when Git isn't at
# the default location (falls back to make's normal shell selection).
ifeq ($(OS),Windows_NT)
  # NB: the existence check uses `?` for the space in "Program Files" — a
  # literal space would make $(wildcard) split it into two patterns that never
  # match. The SHELL assignment itself keeps the real (spaced) path.
  ifneq ($(wildcard C:/Program?Files/Git/bin/bash.exe),)
    SHELL := C:/Program Files/Git/bin/bash.exe
  endif
endif
# -----------------------------------------------------------------------------

.PHONY: help setup install build watch clean demo dev kill-port themes-install treeview-app test test-e2e test-e2e-install test-e2e-ui test-e2e-headed package publish publish-rc publish-dry publish-dry-rc verify docker-build docker-run docker-stop docker-restart docker-logs docker-clean docker-deploy docker-push

# === Configuration ===
# Demo server port (demo/server.js, also the Playwright webServer port).
# Override: make kill-port PORT=xxxx
PORT ?= 3000

# Docker image settings
DOCKER_IMAGE_NAME = pure-admin
DOCKER_REGISTRY = registry.km8.es
DOCKER_TAG = production
DOCKER_CONTAINER_NAME = pure-admin
DOCKER_PORT = 8080

# NPM publish tag (empty for latest, use TAG=rc for pre-releases)
TAG ?=
NPM_TAG = $(if $(TAG),--tag $(TAG),)

# Default target - show help
help:
	@echo "Pure Admin Workspace - Available Commands:"
	@echo ""
	@echo "  Setup:"
	@echo "    make setup        - Install dependencies and build"
	@echo ""
	@echo "  Development:"
	@echo "    make install         - Install all workspace dependencies"
	@echo "    make themes-install  - Snapshot themes into ./themes/ (per pureadmin.json + .pureadmin.json)"
	@echo "    make dev             - Snapshot themes, build Svelte treeview app, then run demo server with SCSS watch"
	@echo "    make demo            - Snapshot themes, then run demo server only"
	@echo "    make kill-port       - Free the demo server port (default $(PORT); override with PORT=xxxx)"
	@echo "    make treeview-app    - Build the embedded Svelte treeview demo bundle (auto-runs as part of make dev)"
	@echo ""
	@echo "  Build:"
	@echo "    make build        - Build core CSS"
	@echo "    make watch        - Watch SCSS files for changes"
	@echo "    make clean        - Clean dist directories"
	@echo ""
	@echo "  Test:"
	@echo "    make test              - Run the Playwright e2e suite (alias for test-e2e)"
	@echo "    make test-e2e          - Run e2e tests headless (auto-starts the demo server)"
	@echo "    make test-e2e-install  - One-time: download the chromium browser binary"
	@echo "    make test-e2e-ui       - Open the Playwright Test UI (debugging)"
	@echo "    make test-e2e-headed   - Run e2e tests in a visible browser"
	@echo ""
	@echo "  Package:"
	@echo "    make package      - Create npm tarball for core"
	@echo "    make verify       - Clean, build, and verify package"
	@echo "    make publish-dry    - Dry-run publish as 'latest' (verify what would be published)"
	@echo "    make publish-dry-rc - Dry-run publish under --tag rc (for pre-releases)"
	@echo "    make publish        - Publish core package to npm as 'latest'"
	@echo "    make publish-rc     - Publish core package under --tag rc (canonical for X.Y.Z-rcN)"
	@echo "    make publish TAG=<x> - Publish under arbitrary dist-tag (e.g. TAG=beta, TAG=next)"
	@echo ""
	@echo "  Docker:"
	@echo "    make docker-build   - Build container image locally (podman)"
	@echo "    make docker-run     - Run container (podman)"
	@echo "    make docker-stop    - Stop container (podman)"
	@echo "    make docker-restart - Restart container (podman)"
	@echo "    make docker-logs    - Show Docker container logs"
	@echo "    make docker-clean   - Remove Docker container and image"
	@echo "    make docker-deploy  - Build and run Docker container"
	@echo "    make docker-push    - Tag and push image to registry"
	@echo ""
	@echo "  Note: Theme packages have moved to pure-admin-themes repo"
	@echo ""

# Install all workspace dependencies
install:
	npm install

# Full setup - install, build, and snapshot themes
setup: install build themes-install

# Build core CSS
build:
	npm run build -w @keenmate/pure-admin-core

# Watch SCSS files
watch:
	npm run watch -w @keenmate/pure-admin-core

# Snapshot themes into ./themes/ from configured sources (remote API or local sibling paths via .pureadmin.json).
# Skips silently if no pureadmin.json / .pureadmin.json exists yet (e.g. fresh clone before configs are written).
themes-install:
	@if [ -f pureadmin.json ] || [ -f .pureadmin.json ]; then \
		npx @keenmate/pureadmin themes install; \
	else \
		echo "themes-install: no pureadmin.json or .pureadmin.json — skipping"; \
	fi

# Run demo server only
demo: themes-install
	npm run start -w demo

# Free the demo server port (e.g. after a crashed/orphaned `make demo`/`make dev`
# leaves the port held). Override the port with: make kill-port PORT=3001
# NB: this Makefile pins the recipe shell to Git Bash on Windows (see top), so
# even the Windows branch is bash — hence netstat|awk|taskkill rather than
# cmd.exe `for /f`. The leading `-` ignores "nothing to kill" as success.
kill-port:
	@echo "Freeing port $(PORT)..."
ifeq ($(OS),Windows_NT)
	-@netstat -ano | grep LISTENING | grep ":$(PORT) " | awk '{print $$5}' | sort -u | xargs -r -I{} taskkill //F //PID {}
else
	-@lsof -ti tcp:$(PORT) | xargs -r kill -9
endif
	@echo "Port $(PORT) is free"

# Build the embedded Svelte treeview demo app. First run installs deps in
# demo/svelte-apps/treeview/node_modules/ (~38 packages, ~8 s); subsequent
# runs only rebuild the bundle (~1.5 s). Skipped if no node_modules guard
# isn't tripped; otherwise always rebuilds so source edits land in dist/.
treeview-app:
	@if [ ! -d demo/svelte-apps/treeview/node_modules ]; then \
		echo "Installing treeview-app dependencies (first run)..."; \
		cd demo/svelte-apps/treeview && npm install; \
	fi
	@echo "Building treeview-app bundle..."
	@cd demo/svelte-apps/treeview && npm run build

# Development mode (demo server)
dev: themes-install treeview-app
	npm run dev -w demo

# === Test Commands ===

# Run the Playwright e2e suite (default test target). The Playwright config's
# webServer block auto-starts `npm run start` (demo, port 3000) and reuses an
# already-running server. Run `make test-e2e-install` once first to fetch the
# browser binary.
test: test-e2e

test-e2e:
	npm run test:e2e

# One-time: download the chromium browser binary Playwright drives.
test-e2e-install:
	npm run test:e2e:install

# Playwright Test UI (interactive debugging).
test-e2e-ui:
	npm run test:e2e:ui

# Run the suite in a visible (headed) browser.
test-e2e-headed:
	npm run test:e2e:headed

# Clean dist directories
clean:
	cd packages/core && rm -rf dist && mkdir -p dist/css dist/fonts

# Create package tarball
package: clean build
	npm pack -w @keenmate/pure-admin-core

# Verify package
verify: clean build
	npm pack -w @keenmate/pure-admin-core
	@echo "Package verified and ready!"

# Dry-run publish as 'latest' (clean + build + verify what would be published)
publish-dry: clean build
	npm publish -w @keenmate/pure-admin-core --dry-run $(NPM_TAG)

# Dry-run publish under --tag rc (for pre-release versions like X.Y.Z-rcN)
publish-dry-rc: clean build
	npm publish -w @keenmate/pure-admin-core --dry-run --tag rc

# Publish core package to npm as 'latest' (clean + build first)
publish: clean build
	npm publish -w @keenmate/pure-admin-core $(NPM_TAG)

# Publish core package under --tag rc (canonical for X.Y.Z-rcN pre-releases).
# Keeps 'latest' dist-tag untouched; consumers opt in via @rc or by pinning the
# exact version. Equivalent to `make publish TAG=rc` but harder to forget.
publish-rc: clean build
	npm publish -w @keenmate/pure-admin-core --tag rc

# === Docker Commands ===

# Build Docker image
docker-build:
	@echo "Building Podman image: $(DOCKER_IMAGE_NAME):$(DOCKER_TAG)"
	podman build -t $(DOCKER_IMAGE_NAME):$(DOCKER_TAG) .
	@echo "Image built successfully!"

# Run Docker container
docker-run:
	@echo "Starting container on port $(DOCKER_PORT)"
	@if [ $$(podman ps -q -f name=$(DOCKER_CONTAINER_NAME)) ]; then \
		echo "Container is already running at http://localhost:$(DOCKER_PORT)"; \
	elif [ $$(podman ps -aq -f name=$(DOCKER_CONTAINER_NAME)) ]; then \
		echo "Starting existing container"; \
		podman start $(DOCKER_CONTAINER_NAME); \
		echo "Application is running at: http://localhost:$(DOCKER_PORT)"; \
	else \
		echo "Creating and starting new container"; \
		podman run -d --name $(DOCKER_CONTAINER_NAME) -p $(DOCKER_PORT):3000 $(DOCKER_IMAGE_NAME):$(DOCKER_TAG); \
		echo "Application is running at: http://localhost:$(DOCKER_PORT)"; \
	fi

# Stop Docker container
docker-stop:
	@echo "Stopping container"
	@if [ $$(podman ps -q -f name=$(DOCKER_CONTAINER_NAME)) ]; then \
		podman stop $(DOCKER_CONTAINER_NAME); \
		echo "Container stopped successfully"; \
	else \
		echo "Container is not running"; \
	fi

# Restart Docker container
docker-restart: docker-stop docker-run

# Show Docker container logs
docker-logs:
	@if [ $$(podman ps -aq -f name=$(DOCKER_CONTAINER_NAME)) ]; then \
		podman logs -f $(DOCKER_CONTAINER_NAME); \
	else \
		echo "Container does not exist"; \
	fi

# Remove Docker container and image
docker-clean: docker-stop
	@echo "Cleaning up container resources"
	@if [ $$(podman ps -aq -f name=$(DOCKER_CONTAINER_NAME)) ]; then \
		podman rm $(DOCKER_CONTAINER_NAME); \
		echo "Container removed"; \
	fi
	@if [ $$(podman images -q $(DOCKER_IMAGE_NAME):$(DOCKER_TAG)) ]; then \
		podman rmi $(DOCKER_IMAGE_NAME):$(DOCKER_TAG); \
		echo "Image removed"; \
	fi

# Build and run Docker container
docker-deploy: docker-build docker-run

# Tag and push image to registry
docker-push:
	@echo "Tagging and pushing image to $(DOCKER_REGISTRY)"
	podman tag $(DOCKER_IMAGE_NAME):$(DOCKER_TAG) $(DOCKER_REGISTRY)/$(DOCKER_IMAGE_NAME):$(DOCKER_TAG)
	podman push $(DOCKER_REGISTRY)/$(DOCKER_IMAGE_NAME):$(DOCKER_TAG)
	@echo "Image pushed to $(DOCKER_REGISTRY)/$(DOCKER_IMAGE_NAME):$(DOCKER_TAG)"
