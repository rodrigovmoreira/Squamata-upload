# Multi-stage build optimized for production

FROM node:20-alpine AS builder

WORKDIR /app

# Copia os arquivos de pacote
COPY package*.json ./

# Instala as dependencias
RUN npm ci --omit=dev

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copia do builder dando propriedade ao usuário nativo 'node'
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

# Copia o código dando propriedade ao usuário 'node'
COPY --chown=node:node package*.json ./
COPY --chown=node:node index.js ./

ENV NODE_ENV=production

# Muda para o usuário seguro que JÁ EXISTE na imagem
USER node

# Expose port
EXPOSE 3005

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3005/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start application
CMD ["npm", "start"]