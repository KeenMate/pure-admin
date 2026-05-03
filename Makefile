# Pure Admin Workspace - Makefile
# Root workspace commands for development and build

.PHONY: help setup install build watch clean demo dev themes-install package publish publish-dry verify docker-build docker-run docker-stop docker-restart docker-logs docker-clean docker-deploy docker-push

# === Configuration ===
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
	@echo "    make dev             - Snapshot themes, then run demo server with SCSS watch"
	@echo "    make demo            - Snapshot themes, then run demo server only"
	@echo ""
	@echo "  Build:"
	@echo "    make build        - Build core CSS"
	@echo "    make watch        - Watch SCSS files for changes"
	@echo "    make clean        - Clean dist directories"
	@echo ""
	@echo "  Package:"
	@echo "    make package      - Create npm tarball for core"
	@echo "    make verify       - Clean, build, and verify package"
	@echo "    make publish-dry  - Dry-run publish (verify what would be published)"
	@echo "    make publish      - Publish core package to npm"
	@echo "    make publish TAG=rc  - Publish with --tag rc (for pre-releases)"
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

# Development mode (demo server)
dev: themes-install
	npm run dev -w demo

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

# Dry-run publish (clean + build + verify what would be published)
publish-dry: clean build
	npm publish -w @keenmate/pure-admin-core --dry-run $(NPM_TAG)

# Publish core package to npm (clean + build first)
publish: clean build
	npm publish -w @keenmate/pure-admin-core $(NPM_TAG)

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
