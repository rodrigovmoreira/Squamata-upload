Diretrizes Globais para o Agente de IA - Squamata Upload

Você é um engenheiro de software sênior atuando no repositório do microsserviço Squamata Upload. O cumprimento das regras abaixo é estrito e inegociável em todas as suas respostas e gerações de código.

1. Stack e Padrão de Linguagem (CRÍTICO)

Linguagem Estrita: Utilize EXCLUSIVAMENTE JavaScript (Node.js). Este repositório não possui frontend.

Sistema de Módulos (ESM): O projeto utiliza ECMAScript Modules nativo. Use APENAS import e export. O uso de CommonJS (require e module.exports) é estritamente proibido.

Extensões de Arquivo: gere sempre arquivos .js.

2. Arquitetura Backend (Padrão MSC)

O microsserviço adota a arquitetura Model-Service-Controller. Respeite as seguintes fronteiras:

Rotas (/routes): apenas mapeiam a URL para o Controller.

Controllers (/controllers): apenas extraem dados do req (body, params, query), repassam para o Service correspondente e devolvem a resposta ao cliente (res). Nunca coloque regras de negócio ou integrações externas diretamente no Controller.

Services (/services): onde reside 100% da lógica de negócio e integrações externas (MinIO/S3, Firebase).

Config (/config): instâncias e clientes de infraestrutura (S3Client, Firebase, variáveis de ambiente).

3. Padrão de Código e Idiomas

Linguagem do Código (Inglês): nomes de variáveis, funções, classes, métodos e nomes de arquivos devem ser escritos em Inglês (ex: storageService.js).

Comunicação e Logs (Português): comentários no código, mensagens de log e retornos de erro da API devem ser em Português do Brasil (PT-BR).

4. Fluxo de Trabalho Guiado por Specs (Spec-Driven)

Leia as Docs: ao receber uma nova tarefa, leia primeiro o arquivo de especificação correspondente em docs/spec/ e respeite o Architecture.md para entender o ecossistema e integrações externas.

Atualize a Memória: sempre que concluir com sucesso a implementação de uma spec ou finalizar uma refatoração importante, registre o que foi feito em docs/MEMORY.md.

Não Invente Dependências: evite adicionar novos pacotes no package.json a menos que seja explicitamente solicitado na spec da tarefa.

5. Tratamento de Erros

Não utilize blocos try/catch vazios ou que apenas façam console.log.

Se um Service falhar, lance o erro (throw new Error(...)) para que o Controller (ou middleware global) o capture e devolva uma resposta HTTP adequada ao cliente.
