.PHONY: install build watch dev clean serve start

# Install dependencies
install:
	npm install

# Build CSS from SCSS
build:
	npm run build-css

# Watch SCSS changes and rebuild CSS
watch:
	npm run watch-css

# Start Express server with EJS templates
start:
	node server.js

# Start Express server with auto-restart (requires nodemon)
dev:
	npx nodemon server.js

# Development with CSS watch in parallel (requires concurrently)
dev-full:
	npx concurrently "npm run watch-css" "node server.js"

# Clean build artifacts
clean:
	rm -rf dist/css/*
	rm -rf node_modules

# Simple HTTP server for static files (if you have Python)
serve-python:
	python -m http.server 8000

# Simple HTTP server for static files (if you have Node.js http-server)
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
	@echo "  make start       - Start Express server on port 3000"
	@echo "  make dev         - Start Express server with auto-restart (nodemon)"
	@echo "  make dev-full    - Run CSS watch + Express server together"
	@echo "  make clean       - Clean build artifacts"
	@echo "  make serve-python - Start Python HTTP server on port 8000 (static files)"
	@echo "  make serve-node  - Start Node HTTP server on port 8000 (static files)"
	@echo "  make help        - Show this help"