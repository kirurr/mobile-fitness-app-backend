# Use a multi-stage build with bun for installs and node for runtime
FROM oven/bun:1.1.34-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json ./
RUN bun install --production --no-save

# Build stage
FROM oven/bun:1.1.34-alpine AS build
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json ./
RUN bun install --no-save
COPY . .
RUN bun run build

# Production stage (node runtime)
FROM node:20-alpine AS runtime
WORKDIR /app

# Copy production dependencies and built application
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

# Expose port
EXPOSE 3000

# Start the application
CMD ["node", "dist/index.js"]
