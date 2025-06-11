import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="message-bubble message-narrator">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-detective-600 flex items-center justify-center text-sm">
            📖
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-sm">Narrador</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-detective-300">Pensando</span>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-detective-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-detective-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-detective-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;