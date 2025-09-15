# Pure Admin Kit - Component Library Makefile

.PHONY: help install dev build package clean publish test lint

# Default target
help:
	@echo "Pure Admin Kit - Available commands:"
	@echo ""
	@echo "  install    Install dependencies"
	@echo "  dev        Start development server"
	@echo "  build      Build library for distribution"
	@echo "  package    Package components for npm"
	@echo "  clean      Clean build artifacts"
	@echo "  publish    Publish to npm (dry-run by default)"
	@echo "  test       Run tests (when available)"
	@echo "  lint       Run linting (when available)"
	@echo ""

# Install dependencies
install:
	npm install

# Start development server
dev:
	npm run dev

# Build library
build:
	npm run build

# Package components
package:
	npm run package

# Clean build artifacts
clean:
	rm -rf dist
	rm -rf .svelte-kit
	rm -rf node_modules/.vite

# Publish to npm (dry-run by default, use 'make publish-real' for actual publish)
publish:
	npm publish --dry-run

publish-real:
	npm publish

# Run tests (placeholder for future implementation)
test:
	@echo "Tests not yet implemented"
	@echo "Run 'npm test' when test suite is added"

# Run linting (placeholder for future implementation)
lint:
	@echo "Linting not yet configured"
	@echo "Consider adding ESLint or similar tools"

# Full clean install and build
fresh: clean install build

# Development workflow - install, package, and show results
setup: install package
	@echo ""
	@echo "✅ Library setup complete!"
	@echo "📁 Components built in: dist/"
	@echo "🚀 Ready for development with: make dev"
	@echo "📦 Ready for publishing with: make publish"