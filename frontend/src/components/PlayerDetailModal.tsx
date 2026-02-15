import React from 'react';
import { X } from 'lucide-react';

interface Stats {
  hands: number;
  vpip: number;
  pfr: number;
  three_bet: number;
  fold_to_3bet: number;
  four_bet: number;
  fold_to_4bet: number;
  five_bet: number;
  fold_to_5bet: number;
  c_bet: number;
  fold_to_cbet: number;
  af: number;
  wtsd: number;
  wtsd_won: number;
}

interface PlayerDetail extends Stats {
  id: string;
  name: string;
  position_stats: Record<string, Stats>;
}

interface PlayerDetailModalProps {
  player: PlayerDetail;
  onClose: () => void;
}

const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({ player, onClose }) => {
  const positions = ['SB', 'BB', 'UTG', 'UTG+1', 'UTG+2', 'LJ', 'HJ', 'CO', 'BTN'];

  // Helper to safely access position stats
  const getPosStat = (pos: string) => player.position_stats[pos] || {
    hands: 0, vpip: 0, pfr: 0, three_bet: 0, fold_to_3bet: 0, 
    four_bet: 0, fold_to_4bet: 0, five_bet: 0, fold_to_5bet: 0,
    c_bet: 0, fold_to_cbet: 0, af: 0, wtsd: 0, wtsd_won: 0
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-gray-100 dark:border-gray-800">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
              {player.name.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{player.name}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Hands: {player.hands}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X size={24} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-auto p-6 flex-1 bg-white dark:bg-gray-900">
          
          {/* Advanced Stats Grid */}
          <div className="mb-8">
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Advanced Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <StatBox label="4-Bet %" value={player.four_bet} />
              <StatBox label="Fold to 4-Bet" value={player.fold_to_4bet} />
              <StatBox label="5-Bet %" value={player.five_bet} />
              <StatBox label="Fold to 5-Bet" value={player.fold_to_5bet} />
              <StatBox label="Fold to 3-Bet" value={player.fold_to_3bet} />
              <StatBox label="WTSD Won %" value={player.wtsd_won} />
            </div>
          </div>

          {/* Positional Breakdown */}
          <div>
            <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-gray-200">Positional Breakdown</h3>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-gray-500 dark:text-gray-400">Position</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-400">Hands</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800">VPIP</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800">PFR</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800">3-Bet</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-400">F3B</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-400">4-Bet</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-400">F4B</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-400">C-Bet</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-400">FCB</th>
                    <th className="px-3 py-2 text-right font-medium text-gray-500 dark:text-gray-400">AF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {positions.map(pos => {
                    const stats = getPosStat(pos);
                    if (stats.hands === 0) return null; // Skip empty positions
                    return (
                      <tr key={pos} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                        <td className="px-3 py-2 font-bold text-gray-700 dark:text-gray-300">{pos}</td>
                        <td className="px-3 py-2 text-right text-gray-500 dark:text-gray-400">{stats.hands}</td>
                        <td className={`px-3 py-2 text-right font-bold ${getColor(stats.vpip, 40, 20)}`}>{stats.vpip}%</td>
                        <td className="px-3 py-2 text-right text-gray-900 dark:text-gray-200">{stats.pfr}%</td>
                        <td className="px-3 py-2 text-right text-gray-900 dark:text-gray-200">{stats.three_bet}%</td>
                        <td className="px-3 py-2 text-right text-gray-500 dark:text-gray-400">{stats.fold_to_3bet}%</td>
                        <td className="px-3 py-2 text-right text-gray-500 dark:text-gray-400">{stats.four_bet}%</td>
                        <td className="px-3 py-2 text-right text-gray-500 dark:text-gray-400">{stats.fold_to_4bet}%</td>
                        <td className="px-3 py-2 text-right text-gray-500 dark:text-gray-400">{stats.c_bet}%</td>
                        <td className="px-3 py-2 text-right text-gray-500 dark:text-gray-400">{stats.fold_to_cbet}%</td>
                        <td className="px-3 py-2 text-right text-gray-500 dark:text-gray-400">{stats.af}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value }: { label: string, value: string | number }) => (
  <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-100 dark:border-gray-700 text-center">
    <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{label}</div>
    <div className="text-lg font-bold text-gray-900 dark:text-white">{value}%</div>
  </div>
);

const getColor = (val: number, high: number, low: number) => {
  if (val > high) return 'text-green-600 dark:text-green-400';
  if (val < low) return 'text-red-500 dark:text-red-400';
  return 'text-gray-900 dark:text-gray-200';
};

export default PlayerDetailModal;
