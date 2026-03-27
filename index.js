import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Carrega as variáveis do .env
dotenv.config();

// No padrão ESM, a leitura de arquivos JSON locais precisa ser feita assim
const serviceAccount = JSON.parse(
  readFileSync(new URL('./credentials.json', import.meta.url))
);

// Inicializa o Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_BUCKET
});

const bucket = admin.storage().bucket();
const app = express();

app.use(cors());
app.use(express.json());

// Middleware de Autenticação: O "Porteiro"
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  
  // Verifica se quem está chamando enviou o token correto no cabeçalho
  if (!token || token !== process.env.API_SECRET_KEY) {
    return res.status(401).json({ error: 'Acesso não autorizado' });
  }
  next();
};

// Rota principal para gerar a URL Assinada
app.post('/generate-upload-url', authMiddleware, async (req, res) => {
  try {
    const { fileName, contentType } = req.body;

    if (!fileName || !contentType) {
      return res.status(400).json({ error: 'Nome do arquivo e tipo (contentType) são obrigatórios.' });
    }

    const file = bucket.file(`uploads/${Date.now()}_${fileName}`);

    // Configura as regras da URL temporária
    const options = {
      version: 'v4',
      action: 'write', // Permite apenas fazer o upload (escrever)
      expires: Date.now() + 5 * 60 * 1000, // URL expira em 5 minutos
      contentType: contentType, // Garante que a imagem suba com o formato correto (ex: image/jpeg)
    };

    // Gera a URL
    const [url] = await file.getSignedUrl(options);

    // Devolve a URL e o caminho final do arquivo para a sua aplicação
    res.status(200).json({ 
      uploadUrl: url, 
      filePath: file.name 
    });

  } catch (error) {
    console.error('Erro ao gerar URL assinada:', error);
    res.status(500).json({ error: 'Erro interno ao gerar a URL de upload' });
  }
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Squamata-upload rodando na porta ${PORT} 🦎`);
});