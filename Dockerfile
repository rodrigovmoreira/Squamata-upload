# Squamata-upload Dockerfile
# Multi-stage build optimized for production

FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Production stage
FROM node:20-alpine

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1000 node && \
    adduser -D -u 1000 -G node node

# Copy node_modules from builder
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

# Copy application code
COPY --chown=node:node package*.json ./
COPY --chown=node:node index.js ./

ENV NODE_ENV=production

# Expose port
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3005/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["npm", "start"]
