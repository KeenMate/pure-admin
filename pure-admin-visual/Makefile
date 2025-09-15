.PHONY: install build watch dev clean serve

# Install dependencies
install:
	npm install

# Build CSS from SCSS
build:
	npm run build-css

# Watch SCSS changes and rebuild CSS
watch:
	npm run watch-css

# Development server with live reload
dev:
	npm run dev-server

# Clean build artifacts
clean:
	rm -rf dist/css/*
	rm -rf node_modules

# Simple HTTP server (if you have Python)
serve-python:
	python -m http.server 8000

# Simple HTTP server (if you have Node.js http-server)
serve-node:
	npx http-server -p 8000 -o

# Default development command
dev-simple: build
	@echo "CSS built. Open index.html in your browser and manually refresh for changes."
	@echo "Run 'make watch' in another terminal to auto-rebuild CSS."

# Help
help:
	@echo "Available commands:"
	@echo "  make install     - Install npm dependencies"
	@echo "  make build       - Build CSS from SCSS"
	@echo "  make watch       - Watch SCSS and auto-rebuild CSS"
	@echo "  make dev         - Start development server with live reload"
	@echo "  make clean       - Clean build artifacts"
	@echo "  make serve-python - Start Python HTTP server on port 8000"
	@echo "  make serve-node  - Start Node HTTP server on port 8000"
	@echo "  make help        - Show this help"