# Especificação de Arquitetura — Squamata Upload

O Squamata Upload é o microsserviço centralizador de armazenamento de objetos do ecossistema Squamata. Ele expõe URLs assinadas para que as aplicações cliente (Calango Food, Calango Bot, etc.) façam upload diretamente do navegador para o bucket, evitando o "Double Hop" (arquivo passando pelo backend antes de ir para a nuvem).

---

## 1. Responsabilidade

- Único ponto da rede que conhece as credenciais do storage (Firebase `credentials.json` e/ou credenciais S3 do MinIO).
- Gera URLs assinadas temporárias (5 minutos) para upload client-side.
- Retorna a URL pública final pronta para ser salva no banco de dados.
- Organiza arquivos por projeto via prefixo (ex: `calango-food/...`).

---

## 2. Storage Multi-Provider (Feature Flag)

O serviço deve suportar dois provedores, selecionáveis via variável de ambiente:

- `STORAGE_PROVIDER=firebase` (padrão/legado): Firebase Storage via `firebase-admin`.
- `STORAGE_PROVIDER=minio`: MinIO (S3-compatible) via AWS SDK v3 (`@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`).

Contrato de resposta padronizado (independente do provider):

```
{ uploadUrl, publicUrl, filePath }
```

Os clientes não precisam saber qual provider está ativo — apenas consomem a resposta.

---

## 3. Infraestrutura MinIO (referência: squamata-headless)

O MinIO roda na infraestrutura local (OptiPlex 790/3010, 1TB via NFS) e é exposto via Cloudflare Tunnel. O `squamata-headless` já utiliza esse mesmo MinIO com sucesso.

- **Endpoint:** `https://s3.calangoapp.com.br`
- **Bucket:** `squamata-storage`
- **Region:** `us-east-1`
- **forcePathStyle:** `true` (OBRIGATÓRIO para o MinIO funcionar corretamente)

Convenção de credenciais S3 (alinhada ao `squamata-headless`):

```
S3_ENDPOINT
S3_REGION
S3_ACCESS_KEY_ID
S3_SECRET_ACCESS_KEY
S3_BUCKET
```

---

## 4. Rede e Porta

- **Container:** `squamata-upload`
- **Porta:** `3005` (host e container)
- **Rede:** `squamata-global` (externa)
- **Docker:** `docker-compose.yml` monta `credentials.json` (provider firebase) como volume read-only.

---

## 5. Endpoints

- `POST /generate-upload-url` (autenticado) → `{ uploadUrl, publicUrl, filePath }`
- `POST /delete-object` (autenticado) → remove objeto do bucket ativo
- `GET /health` → healthcheck (referenciado no Dockerfile)
