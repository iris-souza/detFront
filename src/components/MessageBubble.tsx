import React from 'react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const formatContent = (content: string) => {
    // Format character names in bold (e.g., **Sr. Antônio:** becomes bold)
    return content.replace(/\*\*(.*?):\*\*/g, '<strong>$1:</strong>');
  };

  const getMessageClass = () => {
    switch (message.type) {
      case 'user':
        return 'message-bubble message-user';
      case 'narrator':
        return 'message-bubble message-narrator';
      case 'system':
        return 'message-bubble message-system';
      case 'error':
        return 'message-bubble message-error';
      case 'game_over':
        return 'message-bubble message-game-over';
      default:
        return 'message-bubble message-narrator';
    }
  };

  const getMessageIcon = () => {
    switch (message.type) {
      case 'user': return '👤';
      case 'narrator': return '📖';
      case 'system': return '⚙️';
      case 'error': return '⚠️';
      case 'game_over': return '🎯';
      default: return '📖';
    }
  };

  const getMessageLabel = () => {
    switch (message.type) {
      case 'user': return 'Você';
      case 'narrator': return 'Narrador';
      case 'system': return 'Sistema';
      case 'error': return 'Erro';
      case 'game_over': return 'Fim de Jogo';
      default: return 'Narrador';
    }
  };

  return (
    <div className={getMessageClass()}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-detective-600 flex items-center justify-center text-sm">
            {getMessageIcon()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-sm">
              {getMessageLabel()}
            </span>
            <span className="text-xs opacity-70">
              {message.timestamp.toLocaleTimeString('pt-BR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>
          <div 
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ 
              __html: formatContent(message.content) 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;