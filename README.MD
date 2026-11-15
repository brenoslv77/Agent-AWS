# Agent Solucao — Automação Residencial

Projeto de integração de um agente de Inteligência Artificial com uma interface web de chat, utilizando AWS Amazon Bedrock AgentCore e uma base de conhecimento (RAG).

## Objetivo

Desenvolver um assistente virtual capaz de responder perguntas sobre automação residencial, consultando informações de uma base de conhecimento própria.

## Arquitetura

O fluxo de comunicação funciona assim:

1. O usuário envia uma mensagem pelo chat web.
2. O backend Node.js recebe a mensagem.
3. O backend encaminha a solicitação ao Amazon Bedrock AgentCore.
4. O agente utiliza o Gateway para acessar a ferramenta de consulta.
5. A ferramenta chama uma função AWS Lambda.
6. A Lambda consulta a Knowledge Base (RAG) no Amazon Bedrock.
7. A resposta retorna ao usuário pelo chat.

## Tecnologias utilizadas

- AWS Amazon Bedrock AgentCore
- Amazon Bedrock Knowledge Bases
- AWS Lambda
- Amazon Bedrock AgentCore Gateway
- Node.js
- Express
- JavaScript
- HTML e CSS

## Estrutura do projeto

```text
Agent AWS/
├── public/
│   ├── app.js
│   └── index.html
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── server.js
```

## Configuração

1. Instale o [Node.js](https://nodejs.org/).
2. Clone o repositório.
3. Instale as dependências:

```bash
npm install
```

4. Crie um arquivo `.env` com base no `.env.example`.
5. Pre