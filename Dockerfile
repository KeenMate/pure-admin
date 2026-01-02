#  ██████╗ ██╗   ██╗██╗██╗     ██████╗
#  ██╔══██╗██║   ██║██║██║     ██╔══██╗
#  ██████╔╝██║   ██║██║██║     ██║  ██║
#  ██╔══██╗██║   ██║██║██║     ██║  ██║
#  ██████╔╝╚██████╔╝██║███████╗██████╔╝
#  ╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝

FROM node:lts-alpine AS build

WORKDIR /app

# Copy workspace package files
COPY package.json package-lock.json ./
COPY packages/core/package.json ./packages/core/
COPY packages/theme-audi/package.json ./packages/theme-audi/
COPY packages/theme-corporate/package.json ./packages/theme-corporate/
COPY packages/theme-dark/package.json ./packages/theme-dark/
COPY packages/theme-express/package.json ./packages/theme-express/
COPY packages/theme-minimal/package.json ./packages/theme-minimal/
COPY demo/package.json ./demo/

# Install all workspace dependencies
RUN npm ci

# Copy source files
COPY packages/core/ ./packages/core/
COPY packages/theme-audi/ ./packages/theme-audi/
COPY packages/theme-corporate/ ./packages/theme-corporate/
COPY packages/theme-dark/ ./packages/theme-dark/
COPY packages/theme-express/ ./packages/theme-express/
COPY packages/theme-minimal/ ./packages/theme-minimal/
COPY demo/ ./demo/

# Build core package
RUN npm run build -w @keenmate/pure-admin-core

# Build all theme packages
RUN npm run build -w @keenmate/pure-admin-theme-audi
RUN npm run build -w @keenmate/pure-admin-theme-corporate
RUN npm run build -w @keenmate/pure-admin-theme-dark
RUN npm run build -w @keenmate/pure-admin-theme-express
RUN npm run build -w @keenmate/pure-admin-theme-minimal

#  ██████╗ ██╗   ██╗███╗   ██╗████████╗██╗███╗   ███╗███████╗
#  ██╔══██╗██║   ██║████╗  ██║╚══██╔══╝██║████╗ ████║██╔════╝
#  ██████╔╝██║   ██║██╔██╗ ██║   ██║   ██║██╔██╗██║█████╗
#  ██╔══██╗██║   ██║██║╚██╗██║   ██║   ██║██║╚██╗██║██╔══╝
#  ██║  ██║╚██████╔╝██║ ╚████║   ██║   ██║██║ ╚████║███████╗
#  ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝  ╚═══╝╚══════╝

FROM node:lts-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

# Copy built packages and demo
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/demo ./demo
COPY --from=build /app/package.json ./

# Expose the demo server port
EXPOSE 3000

# Run the demo server
CMD ["node", "demo/server.js"]
