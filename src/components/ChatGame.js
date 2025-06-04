import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { io } from 'socket.io-client';
import './ChatGame.css';

function ChatGame({ mysteryId, duration, onGameEnd }) {
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const socket = useRef(null);
    const chatBoxRef = useRef(null); 

    const BACKEND_URL = "https://detetive-generativo-backend.onrender.com";

    useEffect(() => {
        socket.current = io(BACKEND_URL, {
            transports: ['websocket', 'polling']
        });

        socket.current.on('connect', () => {
            console.log('Socket.IO conectado ao backend.');
            socket.current.emit('start_game', { historia_id: mysteryId, duracao: duration });
        });

        socket.current.on('disconnect', () => {
            console.log('Socket.IO desconectado.');
            addMessageToChat("Conexão perdida com o servidor. Recarregue a página.", "system");
        });

        socket.current.on('connect_error', (err) => {
            console.error('Erro de conexão Socket.IO:', err);
            addMessageToChat(`Erro de conexão com o servidor: ${err.message}.`, "system");
        });

        socket.current.on('narrator_message', (data) => {
            console.log('Mensagem Narrador recebida:', data);
            addMessageToChat(data.message, data.type);
        });

        socket.current.on('system_message', (data) => {
            console.log('Mensagem Sistema recebida:', data);
            addMessageToChat(data.message, data.type);
        });

        socket.current.on('error_message', (data) => {
            console.error('Mensagem de Erro recebida:', data);
            addMessageToChat(`ERRO: ${data.message}`, data.type);
        });

        socket.current.on('game_over', (data) => {
            console.log('Game Over recebido:', data);
            addMessageToChat(data.message, data.type);
            setTimeout(() => onGameEnd(), 3000);
        });

        return () => {
            if (socket.current) {
                socket.current.disconnect();
            }
        };
    }, [mysteryId, duration, onGameEnd]); 

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]); 

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

    const sendGameAction = (eventType, content, originalType = null) => {
        if (socket.current && socket.current.connected) {
            addMessageToChat(content, 'user'); 
            socket.current.emit(eventType, { content: content, type_original: originalType || eventType });
            setInputValue(''); 
        } else {
            console.warn('Tentativa de enviar mensagem, mas Socket.IO não está conectado.');
            addMessageToChat("Não foi possível enviar a mensagem. Conexão com o servidor não está pronta.", "system");
        }
    };

    const handleTalk = () => {
        if (inputValue.trim()) {
            sendGameAction('user_message', inputValue.trim(), 'talk_action');
        }
    };

    const handleAct = () => {
        if (inputValue.trim()) {
            sendGameAction('user_message', `🔍 ${inputValue.trim()}`, 'act_action');
        }
    };
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            handleTalk();
        }
    };

    const handleEndGame = () => {
        if (socket.current && socket.current.connected) {
            socket.current.emit('end_game');
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