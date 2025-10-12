# Pure Admin Core - Makefile
# Common development and build tasks

# Detect OS
ifeq ($(OS),Windows_NT)
    DETECTED_OS := Windows
    RM := rmdir /s /q
    MKDIR := mkdir
    CLEAN_CMD := if exist dist $(RM) dist && $(MKDIR) dist\css dist\fonts
else
    DETECTED_OS := $(shell uname -s)
    RM := rm -rf
    MKDIR := mkdir -p
    CLEAN_CMD := $(RM) dist && $(MKDIR) dist/css dist/fonts
endif

.PHONY: help install build watch clean test package publish dev verify prepublish

# Default target - show help
help:
	@echo "Pure Admin Core - Available Commands:"
	@echo ""
	@echo "  make install    - Install dependencies"
	@echo "  make build      - Build SCSS and copy fonts"
	@echo "  make watch      - Watch SCSS files for changes"
	@echo "  make dev        - Alias for watch"
	@echo "  make clean      - Clean dist directory"
	@echo "  make package    - Clean, build, and create tarball"
	@echo "  make test       - Test package locally (npm pack)"
	@echo "  make verify     - Clean, build, and test workflow"
	@echo "  make prepublish - Dry run publish check"
	@echo "  make publish    - Publish to npm (requires npm login)"
	@echo ""

# Install dependencies
install:
	npm install

# Build everything (SCSS + fonts)
build:
	npm run build

# Watch SCSS files for changes
watch:
	npm run watch

# Development alias
dev: watch

# Clean dist directory
clean:
	@echo "Cleaning dist directory..."
	@$(CLEAN_CMD)
	@echo "Clean complete"

# Create package tarball (clean build)
package: clean build
	@echo "Creating package tarball..."
	npm pack
	@echo ""
	@echo "Package created! Install in another project with:"
	@echo "  npm install ./pure-admin-core-1.0.0.tgz"

# Test package locally (quick pack without clean)
test:
	@echo "Creating local package tarball..."
	npm pack
	@echo ""
	@echo "Package created! Install in another project with:"
	@echo "  npm install ./pure-admin-core-1.0.0.tgz"

# Pre-publish check (dry run)
prepublish:
	@echo "Running publish dry-run..."
	npm publish --dry-run
	@echo ""
	@echo "If everything looks good, run: make publish"

# Publish to npm
publish:
	@echo "Publishing to npm..."
	@echo "Make sure you're logged in (npm login) and have proper permissions"
	@read -p "Continue? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		npm publish; \
	else \
		echo "Publish cancelled"; \
	fi

# Build and test workflow
verify: clean build test
	@echo "Package verified and ready!"
