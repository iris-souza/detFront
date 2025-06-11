import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import StorySelector from './components/StorySelector';
import ChatInterface from './components/ChatInterface';
import RankingModal from './components/RankingModal';
import { User, Historia, Message, GameState } from './types';

const BACKEND_URL = 'https://detetive-generativo-backend.onrender.com';

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRankingModal, setShowRankingModal] = useState(false);
  const [selectedHistoria, setSelectedHistoria] = useState<string>('');
  const [historias, setHistorias] = useState<Historia[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [gameState, setGameState] = useState<GameState>('menu');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });

    newSocket.on('system_message', (data) => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'system',
        content: data.message,
        timestamp: new Date()
      }]);
    });

    newSocket.on('narrator_message', (data) => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'narrator',
        content: data.message,
        timestamp: new Date(),
        options: data.options
      }]);
    });

    newSocket.on('error_message', (data) => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'error',
        content: data.message,
        timestamp: new Date()
      }]);
    });

    newSocket.on('game_over', (data) => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'game_over',
        content: data.message,
        timestamp: new Date()
      }]);
      setGameState('menu');
    });

    newSocket.on('user_authenticated', (data) => {
      setUser({ id: data.user_id, username: data.username });
    });

    return () => {
      newSocket.close();
    };
  }, []);

  // Check user authentication status
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/user_status`, {
          credentials: 'include'
        });
        const data = await response.json();
        if (data.is_authenticated) {
          setUser({ id: data.user_id, username: data.username });
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };

    checkAuthStatus();
  }, []);

  // Load available stories
  useEffect(() => {
    const loadHistorias = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/historias`);
        const data = await response.json();
        setHistorias(data);
      } catch (error) {
        console.error('Error loading stories:', error);
      }
    };

    loadHistorias();
  }, []);

  const handleLogin = async (username: string, password: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        setUser({ id: data.user_id, username: data.username });
        setShowAuthModal(false);
        return { success: true };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão' };
    }
  };

  const handleRegister = async (username: string, password: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        // After successful registration, automatically login
        return await handleLogin(username, password);
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão' };
    }
  };

  const handleLogout = async () => {
    try {
      await fetch(`${BACKEND_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
      setGameState('menu');
      setMessages([]);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const startGame = (historiaId: string, duracao: string) => {
    if (!socket || !user) {
      setShowAuthModal(true);
      return;
    }

    setSelectedHistoria(historiaId);
    setGameState('playing');
    setMessages([]);
    setIsTyping(true);

    socket.emit('start_game', {
      historia_id: historiaId,
      duracao: duracao
    });
  };

  const sendMessage = (content: string, type: 'user_message' | 'contemplate_action' = 'user_message') => {
    if (!socket || !content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    socket.emit('user_message', {
      content: content.trim(),
      type_original: type
    });
  };

  const endGame = () => {
    if (!socket) return;
    
    socket.emit('end_game');
    setGameState('menu');
    setMessages([]);
  };

  const showRanking = (historiaId: string) => {
    setSelectedHistoria(historiaId);
    setShowRankingModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-detective-900 to-detective-800 text-white">
      <Header 
        user={user}
        isConnected={isConnected}
        onLogin={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 py-8">
        {gameState === 'menu' ? (
          <StorySelector
            historias={historias}
            onStartGame={startGame}
            onShowRanking={showRanking}
            user={user}
          />
        ) : (
          <ChatInterface
            messages={messages}
            isTyping={isTyping}
            onSendMessage={sendMessage}
            onEndGame={endGame}
          />
        )}
      </main>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
      )}

      {showRankingModal && (
        <RankingModal
          historiaId={selectedHistoria}
          backendUrl={BACKEND_URL}
          onClose={() => setShowRankingModal(false)}
        />
      )}
    </div>
  );
}

export default App;