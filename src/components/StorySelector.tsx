import React from 'react';
import { Play, Trophy, Clock, BookOpen } from 'lucide-react';
import { Historia, User } from '../types';

interface StorySelectorProps {
  historias: Historia[];
  onStartGame: (historiaId: string, duracao: string) => void;
  onShowRanking: (historiaId: string) => void;
  user: User | null;
}

const StorySelector: React.FC<StorySelectorProps> = ({ 
  historias, 
  onStartGame, 
  onShowRanking, 
  user 
}) => {
  const getDurationLabel = (duracao: string) => {
    switch (duracao) {
      case 'curta': return 'Curta (3-5 min)';
      case 'media': return 'Média (10-15 min)';
      case 'longa': return 'Longa (20-30 min)';
      default: return duracao;
    }
  };

  const getDurationIcon = (duracao: string) => {
    switch (duracao) {
      case 'curta': return '⚡';
      case 'media': return '🔍';
      case 'longa': return '🕵️';
      default: return '📖';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold font-detective mb-4 text-white">
          Escolha Seu Mistério
        </h2>
        <p className="text-detective-300 text-lg max-w-2xl mx-auto">
          Cada caso é uma experiência única gerada por inteligência artificial. 
          Investigue, questione e desvende os segredos mais sombrios.
        </p>
        {!user && (
          <div className="mt-4 p-4 bg-detective-700 rounded-lg border border-detective-600 max-w-md mx-auto">
            <p className="text-detective-200 text-sm">
              💡 <strong>Dica:</strong> Faça login para salvar seu progresso e competir no ranking!
            </p>
          </div>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-1">
        {historias.map((historia) => (
          <div
            key={historia.id}
            className="bg-detective-800 rounded-lg shadow-xl border border-detective-600 overflow-hidden hover:shadow-2xl transition-all duration-300"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-white mb-2 font-detective">
                    {historia.titulo}
                  </h3>
                  <p className="text-detective-300 leading-relaxed">
                    {historia.resumo}
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-detective-400 ml-4 flex-shrink-0" />
              </div>

              <div className="mb-6">
                <h4 className="text-detective-200 font-semibold mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Durações Disponíveis:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {historia.duracoes.map((duracao) => (
                    <button
                      key={duracao}
                      onClick={() => onStartGame(historia.id, duracao)}
                      className="flex items-center justify-center space-x-2 p-3 bg-detective-700 hover:bg-blue-600 border border-detective-600 hover:border-blue-500 rounded-lg transition-all duration-200 group"
                    >
                      <span className="text-lg">{getDurationIcon(duracao)}</span>
                      <div className="text-left">
                        <div className="text-white font-medium group-hover:text-white">
                          {getDurationLabel(duracao)}
                        </div>
                      </div>
                      <Play className="w-4 h-4 text-detective-400 group-hover:text-white" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-detective-600">
                <div className="text-detective-400 text-sm">
                  Mistério gerado por IA • Experiência única
                </div>
                <button
                  onClick={() => onShowRanking(historia.id)}
                  className="flex items-center space-x-2 text-detective-300 hover:text-white transition-colors"
                >
                  <Trophy className="w-4 h-4" />
                  <span className="text-sm">Ver Ranking</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {historias.length === 0 && (
        <div className="text-center py-12">
          <div className="text-detective-400 text-lg">
            Carregando mistérios disponíveis...
          </div>
        </div>
      )}
    </div>
  );
};

export default StorySelector;