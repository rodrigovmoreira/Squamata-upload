# Spec: Suporte a MinIO (S3 Compatible) no Squamata Upload

## 1. Contexto e Objetivo
O Squamata Upload hoje gera URLs assinadas apenas para o **Firebase Storage**. O ecossistema Squamata está migrando para um **MinIO auto-hospedado** (S3-compatible). O `squamata-headless` já utiliza esse mesmo MinIO com sucesso (via `@payloadcms/storage-s3` com `forcePathStyle: true`), servindo como referência de configuração.

**Objetivo do Agente:**
1. Adicionar suporte a MinIO (S3) ao lado do Firebase, selecionável por uma **feature flag**.
2. Manter o contrato de resposta padronizado para os clientes (Calango Food, Calango Bot, etc.).
3. Adicionar endpoint de **deleção** de objetos.

---

## 2. Dependências
**Adicionar:**
- `@aws-sdk/client-s3`
- `@aws-sdk/s3-request-presigner`

**Manter:**
- `firebase-admin` (provider firebase/legado)
- `express`, `cors`, `dotenv`

---

## 3. Variáveis de Ambiente Necessárias
O código deve ler estritamente estas variáveis (criar também um `.env.example`, que hoje não existe):

```env
STORAGE_PROVIDER=firebase   # firebase | minio (default: firebase)
FIREBASE_BUCKET=            # usado apenas quando STORAGE_PROVIDER=firebase
S3_ENDPOINT=                # Ex: https://s3.calangoapp.com.br
S3_REGION=us-east-1         # Padrão aceito pelo MinIO
S3_ACCESS_KEY_ID=           # Convenção do ecossistema (squamata-headless)
S3_SECRET_ACCESS_KEY=       # Segredo gerado no painel MinIO
S3_BUCKET=                  # Ex: squamata-storage
```

> Convenção de nomes: seguir o padrão já usado pelo `squamata-headless` (`S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET`).

---

## 4. Regras de Implementação (CRÍTICO)

### Configuração Obrigatória do S3Client (MinIO)
Como o MinIO não utiliza o roteamento de DNS nativo da AWS, a instância do `S3Client` deve obrigatoriamente conter `forcePathStyle: true`:

```javascript
import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true, // OBRIGATÓRIO para o MinIO
});
```

### Branch por Provider (Feature Flag)
- **minio:** gerar URL assinada com `getSignedUrl(client, new PutObjectCommand({ Bucket, Key, ContentType }), { expiresIn: 300 })`.
- **firebase:** manter o fluxo atual do `firebase-admin` (getSignedUrl).

### Geração de URL Pública (provider minio)
```
{S3_ENDPOINT}/{S3_BUCKET}/{FILE_PATH}
```

### Permissões (ACL)
Não utilize `ACL: 'public-read'`; o bucket já é público no painel do MinIO. Envie apenas o `ContentType` correto (mimetype).

### Deleção
- **minio:** `DeleteObjectCommand({ Bucket, Key })`.
- **firebase:** `bucket.file(filePath).delete()`.

### Resposta Padronizada (ambos os providers)
```json
{ "uploadUrl": "...", "publicUrl": "...", "filePath": "..." }
```

---

## 5. Arquivos Afetados (Escopo de Busca)
- `package.json` — adicionar dependências AWS SDK.
- `.env` e `.env.example` (novo) — novas variáveis.
- `src/config/storage.js` (novo) — `S3Client` com `forcePathStyle: true` e bucket Firebase conforme a flag.
- `src/services/storageService.js` (novo) — `generateUploadUrl(fileName, contentType)` e `deleteObject(filePath)`.
- `index.js` — extrair a lógica para o service; expor rotas `/generate-upload-url`, `/delete-object` e `/health`.
- `readme.md` — alinhar a documentação com o comportamento real (providers + flag).
- `docker-compose.yml` — validar envs (`credentials.json` só é necessário no provider firebase).

---

## 6. Critérios de Aceite (Checklist de Finalização)

- [ ] `@aws-sdk/client-s3` e `@aws-sdk/s3-request-presigner` instalados no `package.json`.
- [ ] `.env.example` criado com as novas variáveis.
- [ ] `S3Client` com `forcePathStyle: true`.
- [ ] Feature flag `STORAGE_PROVIDER=firebase|minio` funcionando.
- [ ] Resposta `{ uploadUrl, publicUrl, filePath }` para ambos os providers.
- [ ] Endpoint de deleção usando `DeleteObjectCommand` (minio).
- [ ] Rota `GET /health` respondendo 200.
- [ ] Provider firebase existente continua funcionando (retrocompatibilidade).
