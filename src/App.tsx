import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import Header from './components/Header';
import AuthModal from './components/AuthModal';
import StorySelector from './components/StorySelector';
import ChatInterface from './components/ChatInterface';
import RankingModal from './components/RankingModal';
import { User, Historia, Message, GameState } from './types';

// Mock data for development when backend is not available
const MOCK_HISTORIAS: Historia[] = [
  {
    id: '1',
    titulo: 'O Mistério da Mansão Abandonada',
    resumo: 'Uma antiga mansão esconde segredos sombrios. Investigue os mistérios que rondam esta propriedade abandonada.',
    duracoes: ['curta', 'media', 'longa']
  },
  {
    id: '2',
    titulo: 'O Caso do Diamante Desaparecido',
    resumo: 'Um valioso diamante foi roubado do museu. Use suas habilidades de detetive para descobrir o culpado.',
    duracoes: ['curta', 'media', 'longa']
  },
  {
    id: '3',
    titulo: 'Assassinato no Expresso Noturno',
    resumo: 'Um crime foi cometido durante uma viagem de trem. Interrogue os passageiros e descubra a verdade.',
    duracoes: ['curta', 'media', 'longa']
  }
];

const HTTP_BACKEND_URL = '/api';
const WS_BACKEND_URL = '/api';

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
  const [backendAvailable, setBackendAvailable] = useState(false);

  // Check if backend is available
  const checkBackendAvailability = async () => {
    try {
      const response = await fetch(`${HTTP_BACKEND_URL}/historias`, {
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      if (response.ok) {
        setBackendAvailable(true);
        return true;
      }
    } catch (error) {
      console.log('Backend not available, using mock data');
      setBackendAvailable(false);
    }
    return false;
  };

  // Initialize socket connection only if backend is available
  useEffect(() => {
    const initializeSocket = async () => {
      const isBackendAvailable = await checkBackendAvailability();
      
      if (!isBackendAvailable) {
        console.log('Backend not available, skipping socket connection');
        return;
      }

      console.log('Connecting to backend:', WS_BACKEND_URL);
      const newSocket = io(WS_BACKEND_URL, {
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true
      });
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to server');
        setIsConnected(true);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('Disconnected from server:', reason);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setIsConnected(false);
      });

      newSocket.on('system_message', (data) => {
        console.log('System message received:', data);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'system',
          content: data.message,
          timestamp: new Date()
        }]);
      });

      newSocket.on('narrator_message', (data) => {
        console.log('Narrator message received:', data);
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
        console.log('Error message received:', data);
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'error',
          content: data.message,
          timestamp: new Date()
        }]);
      });

      newSocket.on('game_over', (data) => {
        console.log('Game over received:', data);
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'game_over',
          content: data.message,
          timestamp: new Date()
        }]);
        setTimeout(() => {
          setGameState('menu');
          setMessages([]);
        }, 3000);
      });

      newSocket.on('user_authenticated', (data) => {
        console.log('User authenticated:', data);
        setUser({ id: data.user_id, username: data.username });
      });
    };

    initializeSocket();

    return () => {
      if (socket) {
        console.log('Cleaning up socket connection');
        socket.close();
      }
    };
  }, []);

  // Check user authentication status
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (!backendAvailable) {
        console.log('Backend not available, skipping auth check');
        return;
      }

      try {
        console.log('Checking auth status...');
        const response = await fetch(`${HTTP_BACKEND_URL}/user_status`, {
          credentials: 'include'
        });
        const data = await response.json();
        console.log('Auth status response:', data);
        if (data.is_authenticated) {
          setUser({ id: data.user_id, username: data.username });
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };

    if (backendAvailable) {
      checkAuthStatus();
    }
  }, [backendAvailable]);

  // Load available stories
  useEffect(() => {
    const loadHistorias = async () => {
      try {
        if (!backendAvailable) {
          console.log('Using mock historias data');
          setHistorias(MOCK_HISTORIAS);
          return;
        }

        console.log('Loading historias from backend...');
        const response = await fetch(`${HTTP_BACKEND_URL}/historias`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        if (!text) {
          throw new Error('Empty response from server');
        }
        
        const data = JSON.parse(text);
        console.log('Historias loaded:', data);
        setHistorias(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error loading stories:', error);
        console.log('Falling back to mock data');
        setHistorias(MOCK_HISTORIAS);
      }
    };

    loadHistorias();
  }, [backendAvailable]);

  const handleLogin = async (username: string, password: string) => {
    if (!backendAvailable) {
      // Mock login for development
      console.log('Mock login for:', username);
      setUser({ id: '1', username });
      setShowAuthModal(false);
      return { success: true };
    }

    try {
      console.log('Attempting login for:', username);
      const response = await fetch(`${HTTP_BACKEND_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('Login response:', data);
      
      if (response.ok) {
        setUser({ id: data.user_id, username: data.username });
        setShowAuthModal(false);
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Erro no login' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  };

  const handleRegister = async (username: string, password: string) => {
    if (!backendAvailable) {
      // Mock registration for development
      console.log('Mock registration for:', username);
      setUser({ id: '1', username });
      setShowAuthModal(false);
      return { success: true };
    }

    try {
      console.log('Attempting registration for:', username);
      const response = await fetch(`${HTTP_BACKEND_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      console.log('Registration response:', data);
      
      if (response.ok) {
        // After successful registration, automatically login
        return await handleLogin(username, password);
      } else {
        return { success: false, error: data.message || 'Erro no registro' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Erro de conexão' };
    }
  };

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      if (backendAvailable) {
        await fetch(`${HTTP_BACKEND_URL}/logout`, {
          method: 'POST',
          credentials: 'include'
        });
      }
      setUser(null);
      setGameState('menu');
      setMessages([]);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const startGame = (historiaId: string, duracao: string) => {
    console.log('Starting game:', { historiaId, duracao, user, socket: !!socket });
    
    if (!user) {
      console.log('User not logged in, showing auth modal');
      setShowAuthModal(true);
      return;
    }

    if (!backendAvailable) {
      // Mock game start for development
      console.log('Starting mock game');
      setSelectedHistoria(historiaId);
      setGameState('playing');
      setMessages([{
        id: Date.now().toString(),
        type: 'system',
        content: 'Bem-vindo ao jogo! (Modo de demonstração - backend não disponível)',
        timestamp: new Date()
      }, {
        id: (Date.now() + 1).toString(),
        type: 'narrator',
        content: 'Você se encontra diante de um mistério intrigante. O que deseja fazer?',
        timestamp: new Date(),
        options: [
          { texto: 'Investigar', comando: 'investigar' },
          { texto: 'Procurar pistas', comando: 'procurar_pistas' },
          { texto: 'Falar com testemunhas', comando: 'falar_testemunhas' }
        ]
      }]);
      return;
    }
    
    if (!socket || !isConnected) {
      console.error('Socket not connected');
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'error',
        content: 'Não foi possível conectar ao servidor. Tente novamente.',
        timestamp: new Date()
      }]);
      return;
    }

    setSelectedHistoria(historiaId);
    setGameState('playing');
    setMessages([]);
    setIsTyping(true);

    console.log('Emitting start_game event');
    socket.emit('start_game', {
      historia_id: historiaId,
      duracao: duracao
    });
  };

  const sendMessage = (content: string, type: 'user_message' | 'contemplate_action' = 'user_message') => {
    if (!content.trim()) {
      console.warn('Empty message');
      return;
    }

    console.log('Sending message:', { content, type });

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    if (!backendAvailable) {
      // Mock response for development
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          type: 'narrator',
          content: `Interessante observação sobre "${content.trim()}". Continue investigando para descobrir mais pistas.`,
          timestamp: new Date(),
          options: [
            { texto: 'Continuar investigação', comando: 'continuar' },
            { texto: 'Examinar evidências', comando: 'examinar' },
            { texto: 'Fazer nova pergunta', comando: 'perguntar' }
          ]
        }]);
      }, 1000);
      return;
    }

    if (!socket || !isConnected) {
      console.error('Socket not connected');
      return;
    }

    setIsTyping(true);

    socket.emit('user_message', {
      content: content.trim(),
      type_original: type
    });
  };

  const endGame = () => {
    console.log('Ending game');
    if (socket && isConnected) {
      socket.emit('end_game');
    }
    setGameState('menu');
    setMessages([]);
    setIsTyping(false);
  };

  const showRanking = (historiaId: string) => {
    console.log('Showing ranking for:', historiaId);
    setSelectedHistoria(historiaId);
    setShowRankingModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-detective-900 to-detective-800 text-white">
      <Header 
        user={user}
        isConnected={backendAvailable ? isConnected : true}
        onLogin={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />

      <main className="container mx-auto px-4 py-8">
        {!backendAvailable && (
          <div className="mb-4 p-4 bg-yellow-600 bg-opacity-20 border border-yellow-500 rounded-lg">
            <p className="text-yellow-200">
              ⚠️ Modo de demonstração: Backend não disponível. Algumas funcionalidades podem estar limitadas.
            </p>
          </div>
        )}
        
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
          backendUrl={HTTP_BACKEND_URL}
          onClose={() => setShowRankingModal(false)}
        />
      )}
    </div>
  );
}

export default App;