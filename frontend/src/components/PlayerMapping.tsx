import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Edit2, Save, X, Search, User, ArrowRight, Wand2, Check } from 'lucide-react';

interface Player {
  id: string;
  original_name: string;
  current_alias: string;
}

interface MergeCandidate {
  target_name: string;
  players: { id: string; name: string }[];
}

interface PlayerMappingProps {
  onMappingUpdate: () => void;
}

const PlayerMapping: React.FC<PlayerMappingProps> = ({ onMappingUpdate }) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [aliasInput, setAliasInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Merge Modal State
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [candidates, setCandidates] = useState<MergeCandidate[]>([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchPlayers();
  }, [onMappingUpdate]);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/players');
      setPlayers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const startEdit = (player: Player) => {
    setEditingId(player.id);
    setAliasInput(player.current_alias || player.original_name);
  };

  const saveMapping = async (playerId: string) => {
    setLoading(true);
    try {
      await axios.post('http://localhost:8000/mapping', {
        player_id: playerId,
        alias: aliasInput
      });
      setEditingId(null);
      fetchPlayers();
      onMappingUpdate();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const scanForMerges = async () => {
    setScanning(true);
    try {
      const response = await axios.post('http://localhost:8000/scan-merge?threshold=0.8');
      setCandidates(response.data);
      setShowMergeModal(true);
    } catch (error) {
      console.error(error);
    } finally {
      setScanning(false);
    }
  };

  const applyMerge = async (candidate: MergeCandidate, targetName: string) => {
    try {
      const merges = candidate.players.map(p => ({
        player_id: p.id,
        alias: targetName
      }));
      
      await axios.post('http://localhost:8000/bulk-merge', { merges });
      
      // Remove applied candidate
      setCandidates(prev => prev.filter(c => c !== candidate));
      fetchPlayers();
      onMappingUpdate();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredPlayers = players.filter(p => 
    p.original_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.current_alias && p.current_alias.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      {/* Search Bar & Actions */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search players by name or ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:text-white transition-all text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600"
          />
        </div>
        <button
          onClick={scanForMerges}
          disabled={scanning}
          className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl transition-colors disabled:opacity-50 text-sm font-medium whitespace-nowrap"
        >
          <Wand2 size={16} className="mr-2" />
          {scanning ? 'Scanning...' : 'Auto Merge'}
        </button>
      </div>

      {/* Merge Modal */}
      {showMergeModal && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border border-gray-100 dark:border-gray-800">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Suggested Merges</h3>
              <button onClick={() => setShowMergeModal(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
                <X size={20} className="text-gray-500 dark:text-gray-400" />
              </button>
            </div>
            
            <div className="overflow-auto p-6 space-y-6">
              {candidates.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No similar players found.
                </div>
              ) : (
                candidates.map((candidate, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Merge Group</h4>
                        <div className="space-y-1">
                          {candidate.players.map(p => (
                            <div key={p.id} className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                                {p.name.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="text-gray-900 dark:text-gray-200 font-medium">{p.name}</span>
                              <span className="text-xs text-gray-400 font-mono">{p.id}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <input 
                        type="text" 
                        defaultValue={candidate.target_name}
                        className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                        id={`merge-name-${idx}`}
                      />
                      <button 
                        onClick={() => {
                          const input = document.getElementById(`merge-name-${idx}`) as HTMLInputElement;
                          applyMerge(candidate, input.value);
                        }}
                        className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <Check size={16} className="mr-1.5" />
                        Merge
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto max-h-[600px] bg-white dark:bg-gray-900">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-800/50 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
              <th className="px-6 py-4 text-left">Original Identity</th>
              <th className="px-6 py-4 text-left">Mapped Alias</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredPlayers.map((player) => (
              <tr key={player.id} className="group hover:bg-gray-50/80 dark:hover:bg-gray-800/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 dark:text-gray-400 font-bold text-xs">
                      {player.original_name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">{player.original_name}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">{player.id}</div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  {editingId === player.id ? (
                    <div className="flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                      <input 
                        type="text" 
                        value={aliasInput}
                        onChange={(e) => setAliasInput(e.target.value)}
                        className="border border-indigo-300 dark:border-indigo-600 rounded-lg px-3 py-1.5 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveMapping(player.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {player.current_alias ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800">
                          {player.current_alias}
                        </span>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-600 text-sm italic flex items-center gap-1 opacity-50">
                          No alias <ArrowRight size={12} />
                        </span>
                      )}
                    </div>
                  )}
                </td>

                <td className="px-6 py-4 text-right">
                  {editingId === player.id ? (
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => saveMapping(player.id)}
                        disabled={loading}
                        className="p-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors"
                        title="Save"
                      >
                        <Save size={16} />
                      </button>
                      <button 
                        onClick={() => setEditingId(null)}
                        className="p-1.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Cancel"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => startEdit(player)}
                      className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0"
                      title="Edit Alias"
                    >
                      <Edit2 size={16} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {filteredPlayers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-900">
                  <div className="flex flex-col items-center justify-center">
                    <Search className="text-gray-300 dark:text-gray-600 mb-3" size={32} />
                    <p>No players found matching your search.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PlayerMapping;