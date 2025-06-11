import React, { useState } from 'react';
import { X, User, Lock, AlertCircle } from 'lucide-react';
import { AuthResult } from '../types';

interface AuthModalProps {
  onClose: () => void;
  onLogin: (username: string, password: string) => Promise<AuthResult>;
  onRegister: (username: string, password: string) => Promise<AuthResult>;
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose, onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = isLogin 
        ? await onLogin(username, password)
        : await onRegister(username, password);

      if (!result.success) {
        setError(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      setError('Erro de conexão');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-detective-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 border border-detective-600">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">
            {isLogin ? 'Entrar' : 'Criar Conta'}
          </h2>
          <button
            onClick={onClose}
            className="text-detective-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-detective-200 text-sm font-medium mb-2">
              Nome de usuário
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-detective-400" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-detective-700 border border-detective-600 rounded-lg text-white placeholder-detective-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite seu nome de usuário"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-detective-200 text-sm font-medium mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-detective-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-detective-700 border border-detective-600 rounded-lg text-white placeholder-detective-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite sua senha"
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2 text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary"
          >
            {isLoading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setUsername('');
              setPassword('');
            }}
            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
          >
            {isLogin ? 'Não tem conta? Criar uma' : 'Já tem conta? Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;