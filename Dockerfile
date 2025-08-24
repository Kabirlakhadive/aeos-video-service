# syntax = docker/dockerfile:1

# 1. ===== BUILD STAGE =====
# Using a full Node image to get all the build tools
FROM node:22-slim AS builder

WORKDIR /app

# Install OS packages needed for building dependencies
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

# Copy dependency manifests
COPY package.json package-lock.json ./

# Install all dependencies (including devDependencies needed for the build)
RUN npm ci

# Copy the rest of the source code
# We need tsconfig for the build and the worker directory itself
COPY . .

# Build the worker from TypeScript to JavaScript
# This will create a 'dist' directory
RUN npm run build:worker

# Prune devDependencies to reduce the size of node_modules
RUN npm prune --omit=dev


# 2. ===== FINAL STAGE =====
# Using a slim image for a smaller final container
FROM node:22-slim AS final

WORKDIR /app

ENV NODE_ENV=production

# Install runtime-only OS dependencies (like ffmpeg for video processing)
RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y ffmpeg && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

# Copy the pruned production node_modules from the 'builder' stage
COPY --from=builder /app/node_modules ./node_modules

# Copy the compiled worker code from the 'builder' stage
COPY --from=builder /app/dist ./dist

# Copy package.json to be able to run npm scripts
COPY --from=builder /app/package.json ./package.json

# The command to run when the container starts.
# This will be overridden by the 'processes' command in your fly.toml,
# but it's good practice to have it here.
CMD ["npm", "run", "worker"]