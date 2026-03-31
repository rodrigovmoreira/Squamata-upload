# 🦎 Squamata Upload

![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

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

---
*Desenvolvido com ☕ e foco em escalabilidade pela equipe Calango.*