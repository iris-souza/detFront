export interface User {
  id: number;
  username: string;
}

export interface Historia {
  id: string;
  titulo: string;
  resumo: string;
  duracoes: string[];
}

export interface Message {
  id: string;
  type: 'user' | 'narrator' | 'system' | 'error' | 'game_over';
  content: string;
  timestamp: Date;
  options?: Array<{
    texto: string;
    comando: string;
  }>;
}

export interface RankingEntry {
  username: string;
  score: number;
  duration: string;
  start_time: string;
  end_time?: string;
}

export type GameState = 'menu' | 'playing';

export interface AuthResult {
  success: boolean;
  error?: string;
}