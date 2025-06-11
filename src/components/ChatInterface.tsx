import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare, Zap, Eye, X } from 'lucide-react';
import { Message } from '../types';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface ChatInterfaceProps {
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (content: string, type?: 'user_message' | 'contemplate_action') => void;
  onEndGame: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  isTyping,
  onSendMessage,
  onEndGame
}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedAction, setSelectedAction] = useState<'talk' | 'act' | 'contemplate'>('talk');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const messageType = selectedAction === 'contemplate' ? 'contemplate_action' : 'user_message';
    onSendMessage(inputValue, messageType);
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleQuickAction = (option: { texto: string; comando: string }) => {
    onSendMessage(option.comando);
  };

  const getActionIcon = (action: 'talk' | 'act' | 'contemplate') => {
    switch (action) {
      case 'talk': return <MessageSquare className="w-4 h-4" />;
      case 'act': return <Zap className="w-4 h-4" />;
      case 'contemplate': return <Eye className="w-4 h-4" />;
    }
  };

  const getActionLabel = (action: 'talk' | 'act' | 'contemplate') => {
    switch (action) {
      case 'talk': return 'Falar';
      case 'act': return 'Agir';
      case 'contemplate': return 'Contemplar';
    }
  };

  const getPlaceholder = () => {
    switch (selectedAction) {
      case 'talk': return 'Digite sua pergunta ou comentário...';
      case 'act': return 'Descreva sua ação...';
      case 'contemplate': return 'Reflita sobre as pistas...';
    }
  };

  // Get the latest message with options for quick actions
  const latestMessageWithOptions = messages
    .slice()
    .reverse()
    .find(msg => msg.options && msg.options.length > 0);

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="bg-detective-800 rounded-t-lg border border-detective-600 p-4 flex justify-between items-center">
        <h3 className="text-lg font-bold text-white flex items-center">
          🕵️ Investigação em Andamento
        </h3>
        <button
          onClick={onEndGame}
          className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors"
        >
          <X className="w-4 h-4" />
          <span className="text-sm">Encerrar Caso</span>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 bg-detective-900 border-x border-detective-600 p-4 overflow-y-auto chat-container">
        <div className="space-y-4">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Actions */}
      {latestMessageWithOptions && (
        <div className="bg-detective-800 border-x border-detective-600 p-4">
          <div className="mb-2 text-detective-300 text-sm font-medium">
            Ações Sugeridas:
          </div>
          <div className="flex flex-wrap gap-2">
            {latestMessageWithOptions.options!.map((option, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(option)}
                className="btn-action"
              >
                {option.texto}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-detective-800 rounded-b-lg border border-detective-600 p-4">
        {/* Action Selector */}
        <div className="flex space-x-2 mb-3">
          {(['talk', 'act', 'contemplate'] as const).map((action) => (
            <button
              key={action}
              onClick={() => setSelectedAction(action)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedAction === action
                  ? 'bg-blue-600 text-white'
                  : 'bg-detective-700 text-detective-300 hover:bg-detective-600'
              }`}
            >
              {getActionIcon(action)}
              <span>{getActionLabel(action)}</span>
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex space-x-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={getPlaceholder()}
            className="flex-1 chat-input"
            autoFocus
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="btn-primary flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </form>

        <div className="mt-2 text-detective-400 text-xs">
          💡 Dica: Use "Falar" para perguntas, "Agir" para ações físicas, "Contemplar" para reflexões
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;