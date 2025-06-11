import React, { useState, useEffect } from 'react';
import { X, Trophy, Clock, User } from 'lucide-react';
import { RankingEntry } from '../types';

interface RankingModalProps {
  historiaId: string;
  backendUrl: string;
  onClose: () => void;
}

const RankingModal: React.FC<RankingModalProps> = ({ historiaId, backendUrl, onClose }) => {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRanking = async () => {
      try {
        const response = await fetch(`${backendUrl}/ranking/${historiaId}`);
        const data = await response.json();
        
        if (response.ok) {
          setRanking(Array.isArray(data) ? data : []);
        } else {
          setError(data.message || 'Erro ao carregar ranking');
        }
      } catch (error) {
        setError('Erro de conexão');
      } finally {
        setLoading(false);
      }
    };

    loadRanking();
  }, [historiaId, backendUrl]);

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `${position}º`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-detective-800 rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 border border-detective-600 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Trophy className="w-6 h-6 mr-2 text-yellow-400" />
            Ranking do Mistério
          </h2>
          <button
            onClick={onClose}
            className="text-detective-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="text-detective-300">Carregando ranking...</div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="text-red-400">{error}</div>
          </div>
        ) : ranking.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-detective-300">
              Nenhum ranking disponível para este mistério ainda.
            </div>
            <div className="text-detective-400 text-sm mt-2">
              Seja o primeiro a resolver este caso!
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {ranking.map((entry, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  index < 3
                    ? 'bg-gradient-to-r from-detective-700 to-detective-600 border-yellow-500/30'
                    : 'bg-detective-700 border-detective-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl font-bold">
                      {getRankIcon(index + 1)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-detective-400" />
                        <span className="font-semibold text-white">
                          {entry.username}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-detective-300">
                        <div className="flex items-center space-x-1">
                          <Trophy className="w-3 h-3" />
                          <span>{entry.score} pontos</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{entry.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {index < 3 && (
                    <div className="text-yellow-400 font-bold text-lg">
                      TOP {index + 1}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center text-detective-400 text-sm">
          💡 Complete mistérios para aparecer no ranking!
        </div>
      </div>
    </div>
  );
};

export default RankingModal;