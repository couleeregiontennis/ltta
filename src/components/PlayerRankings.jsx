import { useState, useEffect } from 'react';
import api from '../scripts/apiClient';

export const PlayerRankings = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedNight, setSelectedNight] = useState('all');

  useEffect(() => {
    const loadPlayerRankings = async () => {
      try {
        setLoading(true);

        const playerData = await api.get('/players?active=true');

        // Calculate team night for each player (handle multiple teams if applicable)
        const rankedPlayers = (playerData || []).map(player => {
          let playNight = 'TBD';
          if (player.player_to_team && player.player_to_team.length > 0) {
            // Get unique nights
            const nights = [...new Set(player.player_to_team.map(ptt => ptt.team?.play_night).filter(n => n))];
            playNight = nights.length > 1 ? 'Multiple' : (nights[0] || 'TBD');
          }

          return {
            id: player.id,
            name: `${player.first_name} ${player.last_name}`,
            ranking: player.ranking || 3,
            isActive: player.is_active,
            playNight: playNight
          };
        });

        // The API returns all players (active and inactive) based on query. 
        // Wait, the original queried all players and filtered active/inactive on client side.
        // Let's assume the API without ?active=true returns all, or we fetch active=true. 
        // Actually, the user instruction says: "supabase.from('player').select(...) -> api.get('/players?active=true')". 
        // We'll follow the instruction, but active/inactive split is done in UI, so maybe the UI just won't show inactive players if they aren't returned.
        setPlayers(rankedPlayers);
      } catch (err) {
        setError('Error loading player rankings: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPlayerRankings();
  }, []);

  const filteredPlayers = selectedNight === 'all'
    ? players
    : players.filter(p => p.playNight === selectedNight || (selectedNight === 'N/A' && p.playNight === 'TBD'));

  if (loading) return <div className="player-rankings-loading">Loading player rankings...</div>;
  if (error) return <div className="player-rankings-error">{error}</div>;

  const activePlayers = filteredPlayers.filter(p => p.isActive);
  const inactivePlayers = filteredPlayers.filter(p => !p.isActive);

  const RankingBody = ({ players: playersList }) => (
    <tbody>
      {playersList.map((player, index) => (
        <tr key={player.id} className={index % 2 === 0 ? 'even' : 'odd'}>
          <td>{index + 1}</td>
          <td>{player.name}</td>
          <td>{player.ranking}</td>
          <td>{player.playNight}</td>
        </tr>
      ))}
    </tbody>
  );

  return (
    <div className="player-rankings">
      <h1>Player Rankings</h1>

      <div className="rankings-filters">
        <label htmlFor="night-filter">Filter by Play Night:</label>
        <select
          id="night-filter"
          value={selectedNight}
          onChange={(e) => setSelectedNight(e.target.value)}
        >
          <option value="all">All Players</option>
          <option value="tuesday">Tuesday</option>
          <option value="wednesday">Wednesday</option>
          <option value="N/A">No Night Assigned</option>
        </select>
      </div>

      <div className="rankings-table-container">
        <h2>Active Players</h2>
        <table className="rankings-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Skill Rating</th>
              <th>Play Night</th>
            </tr>
          </thead>
          <RankingBody players={activePlayers} />
        </table>
      </div>

      {inactivePlayers.length > 0 && (
        <div className="rankings-table-container">
          <h2>Inactive Players</h2>
          <table className="rankings-table inactive-players">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Skill Rating</th>
                <th>Play Night</th>
              </tr>
            </thead>
            <RankingBody players={inactivePlayers} />
          </table>
        </div>
      )}
    </div>
  );
};
