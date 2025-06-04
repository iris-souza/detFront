import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './ChatGame.css';

function ChatGame({ mysteryId, duration, onGameEnd }) {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const ws = useRef(null); 
    const chatBoxRef = useRef(null); 

    const WEBSOCKET_URL = "ws://localhost:8000"; 

    const addMessageToChat = (content, type, sender = null) => {
        const characterSpeechRegex = /\*\*(.*?):\*\* "(.*?)"/g;
        let lastIndex = 0;
        let match;
        const newMessages = [];

        if (type === 'narrador') {
            while ((match = characterSpeechRegex.exec(content)) !== null) {
                const [fullMatch, characterName, speechContent] = match;

                if (match.index > lastIndex) {
                    newMessages.push({
                        content: content.substring(lastIndex, match.index).trim(),
                        type: 'narrador',
                        sender: 'Narrador',
                        timestamp: new Date().toLocaleTimeString()
                    });
                }

                newMessages.push({
                    content: speechContent.trim(),
                    type: 'character_speech',
                    sender: characterName.trim(),
                    timestamp: new Date().toLocaleTimeString()
                });
                lastIndex = characterSpeechRegex.lastIndex;
            }

            if (lastIndex < content.length) {
                const remainingContent = content.substring(lastIndex).trim();
                if (remainingContent) {
                    newMessages.push({
                        content: remainingContent,
                        type: 'narrador',
                        sender: 'Narrador',
                        timestamp: new Date().toLocaleTimeString()
                    });
                }
            }

            if (newMessages.length === 0) {
                newMessages.push({
                    content: content,
                    type: 'narrador',
                    sender: 'Narrador',
                    timestamp: new Date().toLocaleTimeString()
                });
            }
        } else {
            newMessages.push({
                content: content,
                type: type,
                sender: sender || (type === 'user' ? 'Você' : 'Sistema'),
                timestamp: new Date().toLocaleTimeString()
            });
        }
        
        setMessages(prevMessages => [...prevMessages, ...newMessages]);
    };

    useEffect(() => {
        ws.current = new WebSocket(WEBSOCKET_URL);

        ws.current.onopen = () => {
            console.log('WebSocket conectado.');
            if (ws.current.readyState === WebSocket.OPEN) {
                console.log('Enviando mensagem inicial para o backend...');
                ws.current.send(JSON.stringify({ type: 'start_game', historia_id: mysteryId, duracao: duration }));
            }
        };

        ws.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('Mensagem WS recebida:', data);
            
            addMessageToChat(data.message, data.type);

            if (data.type === 'game_over') {
                setTimeout(() => onGameEnd(), 3000);
            }
        };

        ws.current.onclose = () => {
            console.log('WebSocket desconectado.');
            addMessageToChat("Conexão perdida com o servidor. Recarregue a página.", "system");
        };

        ws.current.onerror = (error) => {
            console.error('Erro no WebSocket:', error);
            addMessageToChat("Erro na conexão WebSocket. Verifique o console.", "system");
        };

        return () => {
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                ws.current.close();
            }
        };
    }, [mysteryId, duration, onGameEnd]); 

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]); 

    const sendGameMessage = (type, content) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            addMessageToChat(content, 'user'); 
            ws.current.send(JSON.stringify({ type: type, content: content })); 
            setInputValue(''); 
        }
    };

    const handleTalk = () => {
        if (inputValue.trim()) {
            sendGameMessage('user_message', `(FALO) ${inputValue.trim()}`);
        }
    };

    const handleAct = () => {
        if (inputValue.trim()) {
            sendGameMessage('user_message', `(AJO) ${inputValue.trim()}`);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            handleTalk();
        }
    };

    const handleEndGame = () => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify({ type: 'end_game' }));
        }
        onGameEnd();
    };

    const renderMessageContent = (msg) => {
        if (msg.type === 'narrador' || msg.type === 'character_speech') {
            return (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                </ReactMarkdown>
            );
        }
        return msg.content;
    };

    return (
        <div className="chat-game-container">
            <div id="chat-box" ref={chatBoxRef}>
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.type}-message`}>
                        <div className="message-header">
                            <span className="message-sender">
                                {msg.sender}
                            </span>
                            <span className="message-time">{msg.timestamp}</span>
                        </div>
                        <div className="message-content">
                            {renderMessageContent(msg)}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="input-area">
                <input
                    type="text"
                    id="user-input"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua ação ou pergunta..."
                    className="chat-input"
                />
                
                <div className="action-buttons">
                    <button onClick={handleTalk} className="talk-button">💬 Falar</button>
                    <button onClick={handleAct} className="act-button">🔍 Agir</button>
                </div>
                
                <button onClick={handleEndGame} className="end-game-button">
                    🛑 Terminar Jogo
                </button>
            </div>
        </div>
    );
}

export default ChatGame;