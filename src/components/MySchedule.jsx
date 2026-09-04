import { useState, useEffect } from 'react';
import api from '../scripts/apiClient';
import { useSeason } from '../hooks/useSeason';

export const MySchedule = () => {
  const { currentSeason, loading: seasonLoading } = useSeason();
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [teamInfo, setTeamInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (seasonLoading) return;
    const loadMySchedule = async () => {
      try {
        setLoading(true);

        // Get the player associated with this user
        const playerData = await api.get('/players/me').catch(() => null);

        if (!playerData) {
          setError('Could not find player information.');
          setLoading(false);
          return;
        }

        // Get the player's team
        const teamLink = await api.get('/players/me/team').catch(() => null);

        if (!teamLink || !teamLink.team) {
          setError('You are not currently assigned to any teams.');
          setLoading(false);
          return;
        }

        const team = teamLink.team;
        setTeamInfo([team]); // Keep as array for component compatibility

        // Get upcoming matches
        if (currentSeason) {
          const matchData = await api.get(`/matches?seasonId=${currentSeason.id}&teamId=${team.id}`);
          // Filter for upcoming (scheduled and date >= today)
          const today = new Date().toISOString().split('T')[0];
          const upcoming = (matchData || []).filter(m => 
            m.status === 'scheduled' && m.date >= today
          ).sort((a, b) => new Date(a.date) - new Date(b.date));
          
          setUpcomingMatches(upcoming);
        } else {
          setUpcomingMatches([]);
        }
      } catch (err) {
        setError('Error loading schedule: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadMySchedule();
  }, [currentSeason, seasonLoading]);

  if (loading) return <div className="my-schedule-loading">Loading your schedule...</div>;
  if (error) return <div className="my-schedule-error">{error}</div>;

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return 'TBD';
    return timeStr;
  };

  const isPlayerInLine = (line, playerId, isHomeTeam) => {
    if (isHomeTeam) {
      return line.home_player_1_id === playerId || line.home_player_2_id === playerId;
    } else {
      return line.away_player_1_id === playerId || line.away_player_2_id === playerId;
    }
  };

  const playerId = upcomingMatches.length > 0 ? 'current_player_id' : null;

  return (
    <div className="my-schedule">
      <h1>My Schedule</h1>

      {teamInfo && (
        <div className="my-teams-info">
          <h2>My Teams</h2>
          <ul>
            {teamInfo.map(team => (
              <li key={team.id}>
                Team {team.number} - {team.name} ({team.play_night})
              </li>
            ))}
          </ul>
        </div>
      )}

      {upcomingMatches.length > 0 ? (
        <div className="schedule-table-container">
          <h2>Upcoming Matches</h2>
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Opponent</th>
                <th>My Team</th>
                <th>Courts</th>
                <th>I'm Playing</th>
              </tr>
            </thead>
            <tbody>
              {upcomingMatches.map(match => {
                const isHomeTeam = teamInfo?.some(t => t.id === match.home_team.id);
                const opponent = isHomeTeam ? match.away_team : match.home_team;
                const myTeam = isHomeTeam ? match.home_team : match.away_team;

                const isPlaying = match.line_results?.some(line =>
                  isPlayerInLine(line, playerId, isHomeTeam)
                );

                return (
                  <tr key={match.id} className={isPlaying ? 'highlight' : ''}>
                    <td>{formatDate(match.date)}</td>
                    <td>{formatTime(match.time)}</td>
                    <td>Team {opponent.number} - {opponent.name}</td>
                    <td>Team {myTeam.number} - {myTeam.name}</td>
                    <td>{match.courts || 'TBD'}</td>
                    <td>
                      {isPlaying ? (
                        <span className="playing-badge">Yes</span>
                      ) : (
                        <span className="not-playing-badge">Not yet assigned</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-matches">
          <p>You have no upcoming matches scheduled.</p>
        </div>
      )}
    </div>
  );
};
