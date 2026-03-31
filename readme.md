# 🦎 Squamata Upload

[![Node.js](https://img.shields.io/badge/Node.js-22%2B-green?logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-404D59?logo=express&logoColor=white)](https://expressjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)

Um microsserviço dedicado, rápido e seguro para gerenciamento de uploads no Firebase Storage. Criado para centralizar a infraestrutura de arquivos de múltiplas aplicações (como Calango Food e Calango Bot).

## 🎯 Por que o Squamata? (A Arquitetura)

Para evitar o gargalo do *"Double Hop"* (onde o frontend envia arquivos pesados para o backend, que então os envia para a nuvem), o Squamata atua apenas como um **autorizador**. 

Ele utiliza o padrão de **URLs Assinadas (Signed URLs)**:
1. Sua aplicação pede permissão ao Squamata.
2. O Squamata gera um link temporário e seguro do Google Cloud.
3. Sua aplicação faz o upload da imagem **direto do navegador do usuário** para o bucket final.

Isso garante servidor leve, economia de banda e credenciais do Firebase isoladas em um único lugar seguro.

---

## ✨ Features

- 🔒 **Segurança Centralizada:** Único ponto da rede que guarda o `credentials.json` do Firebase.
- 🚀 **Upload Direto:** Gera URLs para upload client-side, tirando a carga do backend.
- 📂 **Isolamento Multi-Tenant:** Organiza arquivos automaticamente por Projeto e ID do Cliente (`/projeto/tenantId/arquivo.ext`).
- 🔗 **Retorno Dinâmico:** Já devolve a URL Pública final pronta para ser salva no banco de dados.

---

## 🛠️ Instalação e Configuração

### 1. Pré-requisitos
- [Node.js](https://nodejs.org/) (v16 ou superior)
- Conta no Firebase com Storage habilitado.

### 2. Clonando e Instalando
```bash
git clone https://github.com/seu-usuario/squamata-upload.git
cd squamata-upload
npm install
```

### 3. Variáveis de Ambiente
Crie um arquivo .env na raiz do projeto com a seguinte estrutura:
```bash
PORT=3005
# Crie uma senha forte. Suas aplicações usarão ela para pedir acesso.
API_SECRET_KEY=sua_chave_secreta_super_segura_aqui
# O nome do seu bucket no Firebase (sem "gs://")
FIREBASE_BUCKET=seu-projeto.firebasestorage.com
```

### 4. Credenciais do Firebase
Faça o download da sua chave privada no painel do Firebase (Configurações do Projeto > Contas de Serviço) e salve na raiz do projeto com o nome:
📄 credentials.json

---

## 💻 Como Usar (API Reference)

```bash
npm start
```

### Gerar URL de Upload

POST /generate-upload-url

### Headers Obrigatórios:

```bash
Authorization: <Sua API_SECRET_KEY>
Content-Type: application/json
```

### Body (JSON):

```bash
{
  "fileName": "foto-lanche.jpg",
  "contentType": "image/jpeg",
  "tenantId": "lojista-xpto-123",
  "project": "calango-food"
}
```

### Resposta de Sucesso (200 OK):

```bash
{
  "uploadUrl": "[https://storage.googleapis.com/](https://storage.googleapis.com/)... (URL temporária para fazer o PUT do arquivo)",
  "publicUrl": "[https://firebasestorage.googleapis.com/](https://firebasestorage.googleapis.com/)... (URL final para salvar no banco)",
  "filePath": "calango-food/lojista-xpto-123/170000000_foto-lanche.jpg"
}
```

---
Desenvolvido com ☕ e foco em escalabilidade pela equipe Calango.