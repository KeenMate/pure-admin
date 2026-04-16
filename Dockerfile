#  ██████╗ ██╗   ██╗██╗██╗     ██████╗
#  ██╔══██╗██║   ██║██║██║     ██╔══██╗
#  ██████╔╝██║   ██║██║██║     ██║  ██║
#  ██╔══██╗██║   ██║██║██║     ██║  ██║
#  ██████╔╝╚██████╔╝██║███████╗██████╔╝
#  ╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝

FROM node:lts-alpine AS build

# Theme source URL (override with --build-arg)
ARG THEMES_URL=https://pureadmin.io/api/bundle?themes=audi,dark,express

WORKDIR /app

# Copy workspace package files
COPY package.json package-lock.json ./
COPY packages/core/package.json ./packages/core/
COPY demo/package.json ./demo/

# Install all workspace dependencies
RUN npm ci

# Copy source files
COPY packages/core/ ./packages/core/
COPY demo/ ./demo/

# Build core CSS
RUN npm run build -w @keenmate/pure-admin-core

# Download and extract theme bundle from pureadmin.io
RUN apk add --no-cache curl unzip && \
    curl -fsSL -o /tmp/themes.zip "${THEMES_URL}" && \
    mkdir -p themes && \
    unzip -o /tmp/themes.zip -d themes/ && \
    rm /tmp/themes.zip

#  ██████╗ ██╗   ██╗███╗   ██╗████████╗██╗███╗   ███╗███████╗
#  ██╔══██╗██║   ██║████╗  ██║╚══██╔══╝██║████╗ ████║██╔════╝
#  ██████╔╝██║   ██║██╔██╗ ██║   ██║   ██║██╔██╗██║█████╗
#  ██╔══██╗██║   ██║██║╚██╗██║   ██║   ██║██║╚██╗██║██╔══╝
#  ██║  ██║╚██████╔╝██║ ╚████║   ██║   ██║██║ ╚████║███████╗
#  ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝   ╚═╝   ╚═╝╚═╝  ╚═══╝╚══════╝

FROM node:lts-alpine AS runtime

ENV NODE_ENV=production

# unzip needed for on-demand theme downloads at runtime
RUN apk add --no-cache unzip

WORKDIR /app

# Copy built packages and demo
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/demo ./demo
COPY --from=build /app/package.json ./

# Copy downloaded themes and their manifest
COPY --from=build /app/themes/ ./themes/
COPY --from=build /app/themes/themes.json ./pureadmin.json

# Expose the demo server port
EXPOSE 3000

# Run the demo server
CMD ["node", "demo/server.js"]
