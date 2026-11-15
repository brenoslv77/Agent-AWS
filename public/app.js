
const form = document.getElementById('chat-form');
const input = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const chatMessages = document.getElementById('chat-messages');
const statusElement = document.getElementById('status');

// Guarda o identificador da conversa atual
let sessionId = null;

// Mostra uma mensagem na tela
function displayMessage(sender, message) {
    const element = document.createElement('p');
    element.className = 'message';

    const label = document.createElement('strong');
    label.textContent = `${sender}: `;

    element.appendChild(label);
    element.appendChild(document.createTextNode(message));

    chatMessages.appendChild(element);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Captura o envio da mensagem
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const message = input.value.trim();

    if (!message || sendButton.disabled) {
        return;
    }

    displayMessage('Você', message);

    input.value = '';
    sendButton.disabled = true;

    statusElement.textContent = 'Aguardando resposta do agente...';

    try {
        const response = await fetch('/sendMessage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message,
                sessionId
            })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                data.error || `Erro HTTP ${response.status}`
            );
        }

        // Guarda a sessão para as próximas mensagens
        sessionId = data.sessionId;

        displayMessage(
            'Agent Solucao',
            data.reply || 'O agente não retornou uma resposta.'
        );

        statusElement.textContent = '';

    } catch (error) {
        displayMessage(
            'Sistema',
            error.message || 'Não foi possível conectar ao servidor.'
        );

        statusElement.textContent =
            'Verifique a conexão e os logs do servidor.';

    } finally {
        sendButton.disabled = false;
        input.focus();
    }
});
