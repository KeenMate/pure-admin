# Pure Admin Workspace - Makefile
# Root workspace commands for development and build

.PHONY: help setup install build watch clean demo dev package publish publish-dry verify docker-build docker-run docker-stop docker-restart docker-logs docker-clean docker-deploy docker-push

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
	@echo "    make install      - Install all workspace dependencies"
	@echo "    make dev          - Run demo server with SCSS watch"
	@echo "    make demo         - Run demo server only"
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
	@echo "    make docker-build   - Build Docker image locally"
	@echo "    make docker-run     - Run Docker container"
	@echo "    make docker-stop    - Stop Docker container"
	@echo "    make docker-restart - Restart Docker container"
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

# Full setup - install and build everything
setup: install build

# Build core CSS
build:
	npm run build -w @keenmate/pure-admin-core

# Watch SCSS files
watch:
	npm run watch -w @keenmate/pure-admin-core

# Run demo server only
demo:
	npm run start -w demo

# Development mode (demo server)
dev:
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
	@echo "Building Docker image: $(DOCKER_IMAGE_NAME):$(DOCKER_TAG)"
	docker build -t $(DOCKER_IMAGE_NAME):$(DOCKER_TAG) .
	@echo "Docker image built successfully!"

# Run Docker container
docker-run:
	@echo "Starting Docker container on port $(DOCKER_PORT)"
	@if [ $$(docker ps -q -f name=$(DOCKER_CONTAINER_NAME)) ]; then \
		echo "Container is already running at http://localhost:$(DOCKER_PORT)"; \
	elif [ $$(docker ps -aq -f name=$(DOCKER_CONTAINER_NAME)) ]; then \
		echo "Starting existing container"; \
		docker start $(DOCKER_CONTAINER_NAME); \
		echo "Application is running at: http://localhost:$(DOCKER_PORT)"; \
	else \
		echo "Creating and starting new container"; \
		docker run -d --name $(DOCKER_CONTAINER_NAME) -p $(DOCKER_PORT):3000 $(DOCKER_IMAGE_NAME):$(DOCKER_TAG); \
		echo "Application is running at: http://localhost:$(DOCKER_PORT)"; \
	fi

# Stop Docker container
docker-stop:
	@echo "Stopping Docker container"
	@if [ $$(docker ps -q -f name=$(DOCKER_CONTAINER_NAME)) ]; then \
		docker stop $(DOCKER_CONTAINER_NAME); \
		echo "Container stopped successfully"; \
	else \
		echo "Container is not running"; \
	fi

# Restart Docker container
docker-restart: docker-stop docker-run

# Show Docker container logs
docker-logs:
	@if [ $$(docker ps -aq -f name=$(DOCKER_CONTAINER_NAME)) ]; then \
		docker logs -f $(DOCKER_CONTAINER_NAME); \
	else \
		echo "Container does not exist"; \
	fi

# Remove Docker container and image
docker-clean: docker-stop
	@echo "Cleaning up Docker resources"
	@if [ $$(docker ps -aq -f name=$(DOCKER_CONTAINER_NAME)) ]; then \
		docker rm $(DOCKER_CONTAINER_NAME); \
		echo "Container removed"; \
	fi
	@if [ $$(docker images -q $(DOCKER_IMAGE_NAME):$(DOCKER_TAG)) ]; then \
		docker rmi $(DOCKER_IMAGE_NAME):$(DOCKER_TAG); \
		echo "Image removed"; \
	fi

# Build and run Docker container
docker-deploy: docker-build docker-run

# Tag and push image to registry
docker-push:
	@echo "Tagging and pushing image to $(DOCKER_REGISTRY)"
	docker tag $(DOCKER_IMAGE_NAME):$(DOCKER_TAG) $(DOCKER_REGISTRY)/$(DOCKER_IMAGE_NAME):$(DOCKER_TAG)
	docker push $(DOCKER_REGISTRY)/$(DOCKER_IMAGE_NAME):$(DOCKER_TAG)
	@echo "Image pushed to $(DOCKER_REGISTRY)/$(DOCKER_IMAGE_NAME):$(DOCKER_TAG)"
