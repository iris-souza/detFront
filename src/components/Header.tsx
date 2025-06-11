import React from 'react';
import { User, LogIn, LogOut, Wifi, WifiOff } from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  user: UserType | null;
  isConnected: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, isConnected, onLogin, onLogout }) => {
  return (
    <header className="bg-detective-800 border-b border-detective-600 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold font-detective text-white">
            🕵️ Detetive Generativo
          </h1>
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <Wifi className="w-5 h-5 text-green-400" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-400" />
            )}
            <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-detective-300" />
                <span className="text-detective-200">{user.username}</span>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center space-x-2 btn-secondary"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center space-x-2 btn-primary"
            >
              <LogIn className="w-4 h-4" />
              <span>Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;