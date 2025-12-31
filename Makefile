# Pure Admin Workspace - Makefile
# Root workspace commands for development and build

.PHONY: help setup install build build-themes build-all watch clean demo dev package publish verify publish-all

# Theme packages
THEME_PACKAGES = theme-audi theme-dark theme-corporate theme-express theme-minimal

# Default target - show help
help:
	@echo "Pure Admin Workspace - Available Commands:"
	@echo ""
	@echo "  Setup:"
	@echo "    make setup        - Install dependencies and build all"
	@echo ""
	@echo "  Development:"
	@echo "    make install      - Install all workspace dependencies"
	@echo "    make dev          - Run demo server with SCSS watch"
	@echo "    make demo         - Run demo server only"
	@echo ""
	@echo "  Build:"
	@echo "    make build        - Build core CSS"
	@echo "    make build-themes - Build all theme packages"
	@echo "    make build-all    - Build core + all themes"
	@echo "    make watch        - Watch SCSS files for changes"
	@echo "    make clean        - Clean dist directories"
	@echo ""
	@echo "  Package:"
	@echo "    make package      - Create npm tarballs for all packages"
	@echo "    make verify       - Clean, build, and verify packages"
	@echo "    make publish      - Publish core package to npm"
	@echo "    make publish-all  - Publish all packages to npm"
	@echo ""

# Install all workspace dependencies
install:
	npm install

# Full setup - install and build everything
setup: install build-all

# Build core CSS
build:
	npm run build -w @keenmate/pure-admin-core

# Build all theme packages
build-themes:
	npm run build -w @keenmate/pure-admin-theme-audi
	npm run build -w @keenmate/pure-admin-theme-dark
	npm run build -w @keenmate/pure-admin-theme-corporate
	npm run build -w @keenmate/pure-admin-theme-express
	npm run build -w @keenmate/pure-admin-theme-minimal

# Build everything
build-all: build build-themes

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
	cd packages/theme-audi && rm -rf dist
	cd packages/theme-dark && rm -rf dist
	cd packages/theme-corporate && rm -rf dist
	cd packages/theme-express && rm -rf dist
	cd packages/theme-minimal && rm -rf dist

# Create package tarballs
package: clean build-all
	npm pack -w @keenmate/pure-admin-core
	npm pack -w @keenmate/pure-admin-theme-audi
	npm pack -w @keenmate/pure-admin-theme-dark
	npm pack -w @keenmate/pure-admin-theme-corporate
	npm pack -w @keenmate/pure-admin-theme-express
	npm pack -w @keenmate/pure-admin-theme-minimal

# Verify packages
verify: clean build-all
	npm pack -w @keenmate/pure-admin-core
	npm pack -w @keenmate/pure-admin-theme-audi
	npm pack -w @keenmate/pure-admin-theme-dark
	npm pack -w @keenmate/pure-admin-theme-corporate
	npm pack -w @keenmate/pure-admin-theme-express
	npm pack -w @keenmate/pure-admin-theme-minimal
	@echo "All packages verified and ready!"

# Publish core package to npm (clean + build first)
publish: clean build
	npm publish -w @keenmate/pure-admin-core

# Publish all packages to npm (clean + build-all first)
publish-all: clean build-all
	npm publish -w @keenmate/pure-admin-core
	npm publish -w @keenmate/pure-admin-theme-audi
	npm publish -w @keenmate/pure-admin-theme-dark
	npm publish -w @keenmate/pure-admin-theme-corporate
	npm publish -w @keenmate/pure-admin-theme-express
	npm publish -w @keenmate/pure-admin-theme-minimal
