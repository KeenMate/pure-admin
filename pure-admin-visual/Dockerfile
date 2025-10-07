# Pure Admin Visual - Express.js Application with Mustache
# Multi-stage build for smaller image size

# Stage 1: Build CSS assets
FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies (only needed for SASS compilation)
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies like sass)
RUN npm ci

# Copy source code
COPY . .

# Build all CSS themes and assets
RUN npm run build-css && npm run build-themes

# Stage 2: Runtime image (production-only dependencies)
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies (no sass, no build tools)
RUN npm ci --production --ignore-scripts

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Copy fonts (served by Express)
COPY --from=builder /app/fonts ./fonts
COPY --from=builder /app/assets ./assets

# Copy application code
COPY server.js ./
COPY views ./views

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

USER nodejs

# Set port environment variable
ENV PORT=9000

# Expose port
EXPOSE 9000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:9000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the Express.js server
CMD ["node", "server.js"]