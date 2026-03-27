# Plan: Documentação Squamata-upload com Deployment

## TL;DR
Criar documentação completa focada em deployment do microsserviço Squamata-upload para rodar em container Docker em VPS Linux. **11 documentos** cobrindo desde setup local até observabilidade em produção.

---

## Steps

### Fase 1: Documentação Base
1. **README.md** — Visão geral, características, quick start  
2. **SETUP.md** — Instalação local, variáveis de ambiente, testes  
3. **API_DOCUMENTATION.md** — Endpoints, payloads, responses, exemplos cURL com curl executáveis  

### Fase 2: Docker & Deployment
4. **Dockerfile** — Multi-stage, Node.js 20-slim, non-root user, otimizado  
5. **docker-compose.yml** — App service, volumes, port mapping, env file  
6. **.dockerignore** — Excluir node_modules, .git, .env, logs  
7. **DEPLOYMENT.md** — Build, push, run em VPS Linux, nginx reverse proxy config  

### Fase 3: Configuração & Segurança
8. **.env.example** — Template de variáveis  
9. **SECURITY.md** — Secrets, autenticação, rate limiting (presente/futura), HTTPS  
10. **ARCHITECTURE.md** — Diagrama ASCII, fluxo de requisição, integração Firebase  

### Fase 4: Operacional
11. **MONITORING.md** — Health endpoints, logs, troubleshooting  

---

## Relevant Context

### Project Overview
- **Name**: Squamata-upload
- **Purpose**: Microsserviço para upload de imagens via HTTP para Firebase
- **Tech Stack**: Node.js + Express + Firebase Admin SDK
- **Deployment**: Docker containers em VPS Linux
- **Client**: Calango Inc (Calango Food)

### Current Implementation
- **index.js**: Express server com autenticação via token (API_SECRET_KEY) e endpoint `/generate-upload-url` que gera URLs assinadas temporárias (5 min) para upload ao Firebase Storage
- **Authentication**: Bearer token validation em middleware
- **Response**: JSON com `{ uploadUrl, filePath }`
- **Dependencies**: express, firebase-admin, cors, dotenv

### Key Files
- `index.js` — Servidor Express com lógica de geração de URL
- `package.json` — Dependencies (express@5.2.1, firebase-admin@13.7.0)
- `.env` — PORT, API_SECRET_KEY, FIREBASE_BUCKET
- `.gitignore` — Já exclui node_modules, credentials.json, .env

---

## Documentation Specifications

### 1. README.md
- **Purpose**: Marketing + Getting Started  
- **Sections**:
  - Header com emoji 🦎 e descrição 1-liner
  - Features (autenticação segura, URLs temporárias, integração Firebase)
  - Stack tech (Node.js, Express, Firebase)
  - Quick Start (clone, npm install, npm start, exemplo cURL)
  - Estrutura de diretórios
  - Links para outros docs (SETUP, API_DOCUMENTATION, DEPLOYMENT, ARCHITECTURE, SECURITY)
  - License, Author

### 2. SETUP.md
- **Purpose**: Desenvolvimento local  
- **Sections**:
  - Prerequisites (Node.js 18+, npm/yarn, Firebase account)
  - Clone + install steps (git clone, cd, npm install)
  - Environment setup (.env.example → .env, preencher variáveis)
  - Running locally (npm start, teste de porta 3005)
  - Teste funcional (cURL POST com token válido)
  - Troubleshooting (EADDRINUSE, env vars faltando)

### 3. API_DOCUMENTATION.md
- **Purpose**: Referência de endpoints  
- **Sections**:
  - Base URL: http://localhost:3005 ou https://api.domain.com
  - Authentication: Bearer token no header `Authorization`
  - Endpoint: `POST /generate-upload-url`
    - **Request**: JSON `{ fileName: string, contentType: string }`
    - **Response 200**: `{ uploadUrl: string, filePath: string }`
    - **Response 400**: `{ error: "Nome do arquivo e tipo (contentType) são obrigatórios." }`
    - **Response 401**: `{ error: "Acesso não autorizado" }`
    - **Response 500**: `{ error: "Erro interno ao gerar a URL de upload" }`
  - **Example cURL**:
    ```bash
    curl -X POST http://localhost:3005/generate-upload-url \
      -H "Authorization: GfSLsZV8RFzVlPnJF5J8Ru1eUmi8Bs9DnNklmNSv6t73wJCtBsGcTpCsHPgKIq5s" \
      -H "Content-Type: application/json" \
      -d '{"fileName": "my-image.jpg", "contentType": "image/jpeg"}'
    ```
  - URL expiration: 5 minutos
  - File path format: `uploads/{timestamp}_{fileName}`

### 4. Dockerfile
- **Specs**:
  - Base: `node:20-alpine`
  - Non-root user: `appuser` (UID 1000)
  - Working dir: `/app`
  - Copy package*.json, install, copy source
  - Expose 3005
  - CMD: `npm start`
  - No credentials.json em image (via volume ou env)
  - Build context: `.dockerignore` exclude node_modules, .git, .env

### 5. docker-compose.yml
- **Specs**:
  - Version: "3.9"
  - Service `squamata-upload`:
    - Image: `squamata-upload:latest`
    - Build: `.` (Dockerfile)
    - Ports: `3005:3005`
    - Env file: `.env`
    - Volumes: 
      - `./credentials.json:/app/credentials.json:ro` (read-only)
    - Restart policy: `unless-stopped`
    - Networks: Optional (para multi-container futura)

### 6. .dockerignore
- node_modules/
- .git/
- .gitignore
- .env
- .env.*
- docker-compose.yml
- credentials.json
- *.md
- logs/
- .DS_Store

### 7. DEPLOYMENT.md
- **Purpose**: Deploy em VPS Linux  
- **Sections**:
  - Prerequisites (VPS com Docker/Docker Compose, SSH access)
  - Step 1: SSH into server, clone repo
  - Step 2: Copy credentials.json via sftp ou echo
  - Step 3: Create .env (API_SECRET_KEY, FIREBASE_BUCKET, PORT)
  - Step 4: `docker-compose build` e `docker-compose up -d`
  - Step 5: Verificar logs (`docker-compose logs -f`)
  - Step 6: Nginx reverse proxy config (snippet):
    ```nginx
    server {
        listen 443 ssl http2;
        server_name api.domain.com;
        # SSL config aqui
        location / {
            proxy_pass http://localhost:3005;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    ```
  - Troubleshooting: Port bind, permission, logs

### 8. .env.example
```
# Squamata-upload Configuration

# Server
PORT=3005

# Security: Strong API secret key for client authentication
# Generate: openssl rand -base64 32
API_SECRET_KEY=your_strong_secret_key_here

# Firebase
FIREBASE_BUCKET=your-project.firebasestorage.app
```

### 9. SECURITY.md
- **Purpose**: Segurança e boas práticas  
- **Sections**:
  - API_SECRET_KEY: Não commit em repo, usar .env, rotação regular
  - credentials.json: Não commit, proteger permissões (chmod 600)
  - HTTPS: Obrigatório em produção (via nginx/load balancer)
  - Token validation: Via middleware, fail-fast
  - CORS: Configurado, validar origin em produção
  - Rate limiting: *Futuro com express-rate-limit*
  - Logs: Não logar secrets
  - Dependency updates: npm audit, renovate

### 10. ARCHITECTURE.md
- **Purpose**: Visão técnica  
- **Sections**:
  - Diagrama ASCII: Client → Nginx → Node.js → Firebase
  - Request flow: POST → Auth middleware → Firebase SDK → Return URL
  - Componentes: Express server, Firebase Admin SDK, bucket storage
  - Integração Firebase: Service Account auth via credentials.json
  - URL assinada: O que é, por que 5 min expiry, como usar

### 11. MONITORING.md
- **Purpose**: Operacional e observabilidade  
- **Sections**:
  - Logs: console.log → docker logs, structure JSON logs (futuro)
  - Health check: Recomendação adicionar `GET /health` endpoint
  - Exemplo health check response: `{ status: "ok", uptime: seconds }`
  - Docker monitoring: `docker stats`, `docker ps`
  - Troubleshooting:
    - Firebase auth error: Check credentials.json, bucket name
    - 401 Unauthorized: Validate API_SECRET_KEY
    - 400 Bad request: Validate contentType (image/jpeg, etc.)
  - Performance: URL generation é instantâneo (async)
  - Disk space: Monitor logs rotation (futuro)

---

## Verification Criteria

- [ ] README é legível em 3 minutos para novo dev
- [ ] SETUP.md: npm install → npm start → POST com sucesso
- [ ] API_DOCUMENTATION.md: cURL examples são executáveis
- [ ] Dockerfile: build sem erros, <300MB, executa npm start
- [ ] docker-compose.yml: `docker-compose up -d` funciona
- [ ] DEPLOYMENT.md: passo-a-passo claro e testável em VPS
- [ ] .env.example: listado e documentado
- [ ] Todos os docs linkados no README
- [ ] Nenhum secret em documentação (exemplos com placeholders)

---

## Future Enhancements

1. **CI/CD**: GitHub Actions para build/push de imagem Docker
2. **Testing**: Jest tests + coverage
3. **Health Endpoint**: `GET /health` com status e uptime
4. **Structured Logging**: winston ou pino (JSON logs)
5. **Rate Limiting**: express-rate-limit por IP/token
6. **Monitoring**: Prometheus metrics, Grafana dashboards
7. **Auto-scaling**: Kubernetes ou Docker Swarm config
8. **Database**: Log store para auditoria de uploads

---

## Notes

- **Secrecy**: API_SECRET_KEY e credentials.json são sensíveis — .env.example nunca contém valores reais
- **Firebase**: Admin SDK autentica como aplicação (não precisa de API key do cliente)
- **URL expiry**: 5 minutos é bom para uploads; UI deve fazer upload imediatamente após obter URL
- **Calango Food**: Cliente usará POST /generate-upload-url para obter URL antes de fazer upload direto para Firebase
