import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronDown, ChevronUp, Info, Search } from 'lucide-react';
import PlayerDetailModal from './PlayerDetailModal';

interface PlayerStat {
  id: string;
  name: string;
  hands: number;
  vpip: number;
  pfr: number;
  three_bet: number;
  fold_to_3bet: number;
  c_bet: number;
  fold_to_cbet: number;
  af: number;
  wtsd: number;
  wtsd_won: number;
  // ... other stats
  position_stats: any; // Just pass through
  four_bet: number;
  fold_to_4bet: number;
  five_bet: number;
  fold_to_5bet: number;
}

interface StatsTableProps {
  refreshTrigger: number;
}

const StatsTable: React.FC<StatsTableProps> = ({ refreshTrigger }) => {
  const [stats, setStats] = useState<PlayerStat[]>([]);
  const [sortField, setSortField] = useState<keyof PlayerStat>('hands');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStat | null>(null);

  useEffect(() => {
    fetchStats();
  }, [refreshTrigger]);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:8000/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSort = (field: keyof PlayerStat) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedStats = [...stats].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    return 0;
  });

  const getVpipColor = (vpip: number) => {
    if (vpip > 40) return 'text-green-600 dark:text-green-400 font-bold'; // Loose
    if (vpip < 20) return 'text-red-500 dark:text-red-400 font-bold'; // Tight
    return 'text-gray-900 dark:text-gray-100';
  };

  const getAfColor = (af: number) => {
    if (af > 3) return 'text-red-600 dark:text-red-400 font-bold'; // Aggressive
    if (af < 1) return 'text-gray-400 dark:text-gray-500'; // Passive
    return 'text-blue-600 dark:text-blue-400';
  };

  const TH = ({ field, label, tooltip }: { field: keyof PlayerStat, label: string, tooltip?: string }) => (
    <th 
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors select-none group"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {sortField === field && (
          sortDirection === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
        )}
        {tooltip && (
            <div className="group relative ml-1" onClick={(e) => e.stopPropagation()}>
                 <Info size={12} className="text-gray-400 dark:text-gray-500" />
                 <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:block w-48 p-2 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded shadow-lg z-[9999] normal-case font-normal pointer-events-none whitespace-normal break-words">
                     {tooltip}
                 </div>
            </div>
        )}
      </div>
    </th>
  );

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Player Statistics</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Click on a player to view detailed positional analysis</p>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Players: {stats.length}
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/80">
              <tr>
                <TH field="name" label="Player" />
                <TH field="hands" label="Hands" />
                
                {/* Preflop */}
                <TH field="vpip" label="VPIP" tooltip="Voluntarily Put In Pot %" />
                <TH field="pfr" label="PFR" tooltip="Pre-Flop Raise %" />
                <TH field="three_bet" label="3-Bet" tooltip="3-Bet % (Re-raise preflop)" />
                <TH field="fold_to_3bet" label="F3B" tooltip="Fold to 3-Bet %" />
                
                {/* Postflop */}
                <TH field="c_bet" label="C-Bet" tooltip="Continuation Bet %" />
                <TH field="fold_to_cbet" label="FCB" tooltip="Fold to C-Bet %" />
                <TH field="af" label="AF" tooltip="Aggression Factor (Post-flop)" />
                
                {/* Showdown */}
                <TH field="wtsd" label="WTSD" tooltip="Went to Showdown %" />
                <TH field="wtsd_won" label="W$SD" tooltip="Won Money at Showdown %" />
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {sortedStats.map((stat) => (
                <tr 
                  key={stat.id} 
                  className="hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
                  onClick={() => setSelectedPlayer(stat)}
                >
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs mr-3">
                        {stat.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{stat.name}</div>
                        <div className="text-xs text-gray-400 hidden">{stat.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">{stat.hands}</td>
                  
                  <td className={`px-4 py-4 whitespace-nowrap text-sm font-mono ${getVpipColor(stat.vpip)}`}>{stat.vpip}%</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-mono">{stat.pfr}%</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-mono">{stat.three_bet}%</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">{stat.fold_to_3bet}%</td>
                  
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-mono">{stat.c_bet}%</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 font-mono">{stat.fold_to_cbet}%</td>
                  <td className={`px-4 py-4 whitespace-nowrap text-sm font-mono ${getAfColor(stat.af)}`}>{stat.af}</td>
                  
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-mono">{stat.wtsd}%</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-mono">{stat.wtsd_won}%</td>
                </tr>
              ))}
              {stats.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50">
                    <Info className="mx-auto mb-2 text-gray-400 dark:text-gray-500" size={24} />
                    <p>No data available. Please upload a log file to begin analysis.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPlayer && (
        <PlayerDetailModal 
          player={selectedPlayer} 
          onClose={() => setSelectedPlayer(null)} 
        />
      )}
    </>
  );
};

export default StatsTable;