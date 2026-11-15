
require('dotenv').config();

const express = require('express');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const {
    BedrockAgentCoreClient,
    InvokeHarnessCommand
} = require('@aws-sdk/client-bedrock-agentcore');

const app = express();

const port = Number(process.env.PORT || 3000);
const region = process.env.AWS_REGION;
const harnessArn = process.env.AGENTCORE_HARNESS_ARN;

if (!region || !harnessArn || harnessArn.includes('COLOQUE_SEU')) {
    throw new Error(
        'Configure AWS_REGION e AGENTCORE_HARNESS_ARN no arquivo .env.'
    );
}

const agentCore = new BedrockAgentCoreClient({ region });

app.disable('x-powered-by');

app.use(express.json({ limit: '10kb' }));

app.use(express.static(path.join(__dirname, 'public')));

// Verifica se o servidor está funcionando
app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
});

// Recebe mensagens e chama o Harness
app.post('/sendMessage', async (req, res) => {
    const message = req.body?.message;

    if (typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({
            error: 'Digite uma mensagem válida.'
        });
    }

    if (message.length > 4000) {
        return res.status(400).json({
            error: 'A mensagem deve ter no máximo 4000 caracteres.'
        });
    }

    let sessionId = req.body?.sessionId;

    if (!sessionId) {
        sessionId = randomUUID();
    }

    if (
        typeof sessionId !== 'string' ||
        !/^[A-Za-z0-9][A-Za-z0-9_-]{32,99}$/.test(sessionId)
    ) {
        return res.status(400).json({
            error: 'Identificador de sessão inválido.'
        });
    }

    try {
        const command = new InvokeHarnessCommand({
            harnessArn,
            runtimeSessionId: sessionId,
            messages: [
                {
                    role: 'user',
                    content: [
                        { text: message.trim() }
                    ]
                }
            ]
        });

        const response = await agentCore.send(command);

        let reply = '';

        // Reúne os trechos de texto enviados pelo AgentCore
        for await (const event of response.stream || []) {
            if (event.contentBlockDelta?.delta?.text) {
                reply += event.contentBlockDelta.delta.text;
            }

            if (event.runtimeClientError) {
                throw new Error(
                    event.runtimeClientError.message ||
                    'O AgentCore apresentou um erro.'
                );
            }
        }

        if (!reply.trim()) {
            return res.status(502).json({
                error: 'O agente não retornou uma resposta textual.'
            });
        }

        return res.json({
            reply: reply.trim(),
            sessionId
        });

    } catch (error) {
        console.error('Erro ao chamar o AgentCore:', {
            name: error.name,
            message: error.message
        });

        return res.status(502).json({
            error: 'Não foi possível obter uma resposta do agente. Verifique as configurações e os logs do servidor.'
        });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor iniciado na porta ${port}`);
    console.log(`Região AWS: ${region}`);
    console.log('Integração com AgentCore configurada.');
});
