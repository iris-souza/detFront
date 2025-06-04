# Detetive Generativo - Frontend (React)
Este repositório contém o código do frontend React para o jogo "Detetive Generativo". Ele é a interface do utilizador, responsável por exibir a narrativa, as opções de jogo e capturar as interações do jogador, comunicando-se em tempo real com o backend Python.

# Sobre o Frontend
O frontend é construído com:

React: Uma biblioteca JavaScript para construir interfaces de utilizador dinâmicas e reativas.

HTML/CSS: Para a estrutura e estilização da aplicação, garantindo uma experiência visual imersiva e responsiva.

WebSockets (API do Navegador): Para estabelecer uma comunicação bidirecional e em tempo real com o backend Python, permitindo interações fluidas com a IA.

fetch API: Para fazer requisições HTTP ao backend (ex: para obter a lista de histórias).

Como Colocar o Frontend Para Rodar
Siga os passos abaixo para configurar e iniciar a aplicação frontend.

1. Pré-requisitos
Certifique-se de ter instalado:

Node.js (que inclui o npm - Node Package Manager)

Recomendado: Use a versão LTS (Long Term Support).

2. Configuração do Ambiente
2.1. Instalar as Dependências
Na pasta raiz do seu projeto frontend (onde se encontra o package.json), instale as dependências do Node.js:

# Navegue até a pasta do frontend
cd frontend-react

# Instale as dependências
npm install

3. Iniciar o Servidor de Desenvolvimento do Frontend
Com as dependências instaladas, você pode iniciar a aplicação React.

Importante: Certifique-se de que o backend Python já está a correr (na porta 5000 para HTTP e 8000 para WebSockets), conforme as instruções no README.md do backend.

# Na pasta frontend-react
npm start

Após executar este comando, o seu navegador deverá abrir automaticamente em http://localhost:3000 (ou outra porta disponível). A aplicação React estará a correr e tentará conectar-se ao backend.

Como o Frontend se Comunica com o Backend
O frontend e o backend operam como aplicações separadas, comunicando-se através de APIs:

Requisições HTTP (API REST):

O frontend faz uma requisição GET para http://localhost:5000/historias (ou o endereço do seu backend) para obter a lista de mistérios disponíveis.

WebSockets:

Após a seleção de um mistério, o frontend estabelece uma conexão WebSocket com ws://localhost:8000 (ou o endereço do seu backend).

Todas as interações do jogo (mensagens do jogador, respostas da IA, ações como "Falar", "Agir", "Contemplar", e o término do jogo) são enviadas e recebidas através desta conexão em tempo real.

Resolução de Problemas Comuns
Failed to execute 'send' on 'WebSocket': Still in CONNECTING state.:

Isso significa que o frontend tentou enviar uma mensagem antes que a conexão WebSocket estivesse totalmente estabelecida. O código já possui uma verificação para isso. Se persistir, pode indicar um problema de rede ou que o servidor WebSocket do backend não está a responder.

WebSocket desconectado. ou Conexão perdida com o servidor.:

Verifique se o backend Python está a correr e a ouvir nas portas corretas (5000 para HTTP, 8000 para WebSocket).

Pode ser um problema de firewall ou antivírus a bloquear a porta 8000.

Certifique-se de que o URL do WebSocket no ChatGame.js (ws://localhost:8000) está correto.

Erros no console do navegador (F12):

Uncaught (in promise) Error: A listener indicated an asynchronous response...: Este é geralmente um erro de alguma extensão do navegador e não do seu código. Pode ignorá-lo ou tentar desativar as extensões para limpar o console.

Outros erros JavaScript podem indicar problemas na lógica do frontend. Verifique a linha e o ficheiro indicados no erro.

A interface não carrega ou mostra erros:

Verifique se todas as dependências foram instaladas (npm install).

Certifique-se de que o servidor de desenvolvimento React está a correr (npm start).

Tente um "hard refresh" no navegador (Ctrl+Shift+R ou Cmd+Shift+R) ou limpe o cache do site nas ferramentas de desenvolvedor.