import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../scripts/supabaseClient';
import { useTeamStatsData } from '../hooks/useTeamStatsData';
import { useAuth } from '../context/AuthProvider';
import '../styles/CaptainDashboard.css';

export const CaptainDashboard = () => {
  const { currentPlayerData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [roster, setRoster] = useState([]);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [seasonWins, setSeasonWins] = useState(0);
  const [seasonLosses, setSeasonLosses] = useState(0);
  const [playersAvailable, setPlayersAvailable] = useState(0);
  const [rosterManagerOpen, setRosterManagerOpen] = useState(false);
  const [rosterManagerLoading, setRosterManagerLoading] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState([]);
  const [pendingRoster, setPendingRoster] = useState([]);
  const [invitedRoster, setInvitedRoster] = useState([]);
  const [lineupManagerOpen, setLineupManagerOpen] = useState(false);
  const [lineupManagerLoading, setLineupManagerLoading] = useState(false);
  const [selectedMatchForLineup, setSelectedMatchForLineup] = useState(null);
  const [availableSubs, setAvailableSubs] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Hook for detailed statistics
  const {
    loading: statsLoading,
    error: statsError,
    teamRecord,
    teamLineStats,
    recentMatches,
    playerStats,
    winPercentage,
    lineWinPercentage,
    gamesWinPercentage,
    roster: statsRoster,
    refresh: refreshStats
  } = useTeamStatsData();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      if (!currentPlayerData) {
        setLoading(false);
        return;
      }

      const { data: teamLink, error: teamLinkError } = await supabase
        .from('player_to_team')
        .select('team')
        .eq('player', currentPlayerData.id)
        .eq('status', 'active')
        .maybeSingle();

      if (teamLinkError) throw teamLinkError;
      
      if (!teamLink) {
        setLoading(false);
        return;
      }

      const { data: teamData, error: teamError } = await supabase
        .from('team')
        .select('*')
        .eq('id', teamLink.team)
        .single();

      if (teamError) throw teamError;
      setTeam(teamData);

      // Load team roster
      await loadTeamRoster(teamData.id);

      // Load season record
      await loadSeasonRecord(teamData.number);

      // Load upcoming matches
      await loadUpcomingMatches(teamData.number, teamData.play_night);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveRequest = async (playerId) => {
    try {
      setError('');
      const { error } = await supabase
        .from('player_to_team')
        .update({ status: 'active' })
        .eq('player', playerId)
        .eq('team', team.id);
      
      if (error) throw error;
      setSuccess('Player request approved.');
      loadTeamRoster(team.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDenyRequest = async (playerId) => {
    try {
      setError('');
      const { error } = await supabase
        .from('player_to_team')
        .delete()
        .eq('player', playerId)
        .eq('team', team.id);
      
      if (error) throw error;
      setSuccess('Player request denied.');
      loadTeamRoster(team.id);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleInvitePlayer = async (playerId) => {
    try {
      setError('');
      const { error } = await supabase
        .from('player_to_team')
        .insert({ player: playerId, team: team.id, status: 'invited' });
      
      if (error) throw error;
      setSuccess('Player invited.');
      loadTeamRoster(team.id);
      setAvailablePlayers(prev => prev.filter(p => p.id !== playerId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEmailTeam = () => {
    const emails = roster.map(player => player.email).filter(Boolean);

    if (emails.length === 0) {
      setError('No email addresses found for your roster.');
      setTimeout(() => setError(''), 4000);
      return;
    }

    const subject = team
      ? `LTTA Team ${team.number}${team.name ? ` · ${team.name}` : ''}`
      : 'LTTA Team Update';

    window.location.href = `mailto:${emails.join(',')}?subject=${encodeURIComponent(subject)}`;
  };

  const openRosterManager = async () => {
    setRosterManagerOpen(true);
    setRosterManagerLoading(true);
    try {
      // Find active players not currently on this team
      const { data: activePlayers, error: playersError } = await supabase
        .from('player')
        .select('*')
        .eq('is_active', true);

      if (playersError) throw playersError;

      // Filter out players already on this team
      const currentRosterIds = new Set(roster.map(p => p.id));
      const filtered = activePlayers.filter(p => !currentRosterIds.has(p.id));

      setAvailablePlayers(filtered);
    } catch (err) {
      console.error('Error loading available players:', err);
      setError('Failed to load player list');
    } finally {
      setRosterManagerLoading(false);
    }
  };

  const closeRosterManager = () => {
    setRosterManagerOpen(false);
    setAvailablePlayers([]);
  };

  const openLineupManager = async (match) => {
    setSelectedMatchForLineup(match);
    setLineupManagerOpen(true);
    setLineupManagerLoading(true);
    try {
      // Load potential substitutes (active players not on this roster)
      const { data: subs, error: subsError } = await supabase
        .from('player')
        .select('*')
        .eq('is_active', true)
        .eq('is_captain', false); // Simple filter for now

      if (subsError) throw subsError;

      const currentRosterIds = new Set(roster.map(p => p.id));
      const filtered = subs.filter(p => !currentRosterIds.has(p.id));

      setAvailableSubs(filtered);
    } catch (err) {
      console.error('Error loading substitutes:', err);
      setError('Failed to load sub board');
    } finally {
      setLineupManagerLoading(false);
    }
  };

  const closeLineupManager = () => {
    setLineupManagerOpen(false);
    setSelectedMatchForLineup(null);
  };

  const confirmRankingChange = (player, newRanking) => {
    setPendingAction({
      type: 'RANKING_CHANGE',
      title: 'Update Player Ranking',
      message: `Confirm changing ${player.first_name}'s ranking from ${player.ranking} to ${newRanking}? This affects lineup eligibility.`,
      confirmLabel: 'Update Ranking',
      payload: { playerId: player.id, ranking: newRanking }
    });
  };

  const handleConfirmAction = async () => {
    if (confirmLoading) return;
    setConfirmLoading(true);
    try {
      if (pendingAction.type === 'RANKING_CHANGE') {
        const { error: updateError } = await supabase
          .from('player')
          .update({ ranking: pendingAction.payload.ranking })
          .eq('id', pendingAction.payload.playerId);

        if (updateError) throw updateError;
        setSuccess('Ranking updated successfully.');
        await loadTeamRoster(team.id);
      }
      // Add other action handlers here
    } catch (err) {
      setError(`Action failed: ${err.message}`);
    } finally {
      setConfirmLoading(false);
      setPendingAction(null);
      setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
    }
  };

  const closeConfirmation = () => {
    if (!confirmLoading) setPendingAction(null);
  };

  const loadTeamRoster = async (teamId) => {
    try {
      const { data: teamPlayers, error: rosterError } = await supabase
        .from('player_to_team')
        .select(`
          status,
          player:player(*)
        `)
        .eq('team', teamId);

      if (rosterError) throw rosterError;

      const activePlayers = [];
      const pending = [];
      const invited = [];

      (teamPlayers || []).forEach(tp => {
        if (!tp.player) return;
        const p = { ...tp.player, teamStatus: tp.status || 'active' };
        if (p.teamStatus === 'pending') pending.push(p);
        else if (p.teamStatus === 'invited') invited.push(p);
        else activePlayers.push(p);
      });

      activePlayers.sort((a, b) => a.ranking - b.ranking);
      
      setRoster(activePlayers);
      setPendingRoster(pending);
      setInvitedRoster(invited);

      const activeCount = activePlayers.filter(p => p.is_active).length;
      setPlayersAvailable(activeCount);
    } catch (err) {
      console.error('Error loading roster:', err);
    }
  };

  const loadUpcomingMatches = async (teamNumber, playNight) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: matches, error: matchesError } = await supabase
        .from('matches')
        .select('*')
        .or(`home_team_number.eq.${teamNumber},away_team_number.eq.${teamNumber}`)
        .gte('date', today)
        .order('date', { ascending: true })
        .limit(5);

      if (matchesError) throw matchesError;
      setUpcomingMatches(matches || []);
    } catch (err) {
      console.error('Error loading matches:', err);
    }
  };

  const loadSeasonRecord = async (teamNumber) => {
    try {
      const { data: scores, error: scoresError } = await supabase
        .from('match_scores')
        .select('*, match:matches!inner(*)')
        .or(`match.home_team_number.eq.${teamNumber},match.away_team_number.eq.${teamNumber}`);

      if (scoresError) throw scoresError;

      let wins = 0;
      let losses = 0;

      scores.forEach(score => {
        const isHome = score.match.home_team_number === teamNumber;
        let teamWon;

        if (score.home_won !== null) {
          teamWon = isHome ? score.home_won : !score.home_won;
        } else {
          const teamLines = isHome ? score.home_lines_won : score.away_lines_won;
          const oppLines = isHome ? score.away_lines_won : score.home_lines_won;
          teamWon = teamLines > oppLines;
        }

        if (teamWon) wins++; else losses++;
      });

      setSeasonWins(wins);
      setSeasonLosses(losses);
    } catch (err) {
      console.error('Error loading season record:', err);
    }
  };

  if (loading) {
    return <div className="captain-dashboard loading">Loading captain dashboard...</div>;
  }

  if (error && !user) {
    return <div className="captain-dashboard error">{error}</div>;
  }

  return (
    <div className="captain-dashboard">
      <div className="captain-header">
        <h1>Captain Dashboard</h1>
        <p>Manage your roster, monitor upcoming matches, and access captain tools at a glance.</p>
      </div>

      {team && (
        <div className="captain-team-banner card card--interactive card--overlay">
          <div className="team-emblem">🎾</div>
          <div className="team-meta-block">
            <span className="team-meta-label">Team Overview</span>
            <span className="team-meta-name">Team {team.number} · {team.name}</span>
            <span className="team-meta-info">{team.play_night} Night League • {roster.length} Active Players</span>
          </div>
        </div>
      )}

      <div className="captain-overview">
        <div className="overview-card card card--interactive card--overlay">
          <div className="card-label">Season Record</div>
          <div className="card-value">{teamRecord.wins ?? seasonWins} - {teamRecord.losses ?? seasonLosses}</div>
          <div className="card-subtitle">Wins · Losses</div>
        </div>
        <div className="overview-card card card--interactive card--overlay">
          <div className="card-label">Upcoming Matches</div>
          <div className="card-value">{upcomingMatches.length}</div>
          <div className="card-subtitle">Next 30 days</div>
        </div>
        <div className="overview-card card card--interactive card--overlay">
          <div className="card-label">Roster Availability</div>
          <div className="card-value">{statsRoster.length || playersAvailable}</div>
          <div className="card-subtitle">Players cleared for play</div>
        </div>
        <div className="overview-card card card--interactive card--overlay">
          <div className="card-label">Recent Activity</div>
          <div className="card-value">{success ? 'Updated' : error ? 'Attention' : 'Stable'}</div>
          <div className="card-subtitle">Team updates this week</div>
        </div>
      </div>

      <div className="dashboard-sections">
        <section className="captain-section card card--interactive">
          <div className="section-header">
            <div>
              <h2>Upcoming Matches</h2>
              <p>Plan lineups, assign captains, and prepare for match night.</p>
            </div>
            <button
              type="button"
              className="section-action"
              onClick={() => openLineupManager(upcomingMatches[0] || null)}
              disabled={upcomingMatches.length === 0}
            >
              Manage Lineups
            </button>
          </div>
          <div className="matches-timeline">
            {upcomingMatches.length === 0 ? (
              <div className="empty-state card card--flat">
                <h3>No upcoming matches scheduled</h3>
                <p>Once new matches are scheduled they will appear here.</p>
              </div>
            ) : (
              upcomingMatches.map((match) => (
                <div key={match.id} className="match-card card card--interactive card--overlay">
                  <div className="match-card-header">
                    <div className="match-date">
                      {new Date(match.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                    <span className="match-tag">{match.time} • Court {match.courts}</span>
                  </div>
                  <div className="match-teams">
                    <span className="team-home">{match.home_team_name}</span>
                    <span className="vs-label">vs</span>
                    <span className="team-away">{match.away_team_name}</span>
                  </div>
                  <div className="match-meta">
                    <span>Match ID: {match.id}</span>
                    <span>{match.home_team_number === team.number ? 'Home Match' : 'Away Match'}</span>
                  </div>
                  <div className="match-actions">
                    <button className="btn-small">Send Reminder</button>
                    <button className="btn-small">View Details</button>
                    <button
                      type="button"
                      className="btn-small"
                      onClick={() => openLineupManager(match)}
                    >
                      Manage Lineup
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="captain-section card card--interactive">
          <div className="section-header">
            <div>
              <h2>Team Roster Management</h2>
              <p>Maintain player details, rankings, and contact information.</p>
            </div>
            <div className="section-actions">
              <button type="button" className="section-action" onClick={openRosterManager}>
                Manage Roster
              </button>
              <button type="button" className="section-action">Export Roster</button>
            </div>
          </div>
          {pendingRoster.length > 0 && (
            <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-md)' }}>
              <h3 style={{ color: 'var(--color-warning)', marginBottom: '1rem' }}>Pending Join Requests</h3>
              <div className="roster-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Ranking</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRoster.map((player) => (
                      <tr key={player.id}>
                        <td>{player.first_name} {player.last_name}</td>
                        <td>{player.email}</td>
                        <td>{player.ranking}</td>
                        <td>
                          <button className="btn-small" onClick={() => handleApproveRequest(player.id)}>Approve</button>
                          <button className="btn-small btn-text-danger" style={{ marginLeft: '0.5rem' }} onClick={() => handleDenyRequest(player.id)}>Deny</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="roster-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Ranking</th>
                  <th>Captain</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roster.map((player) => (
                  <tr key={player.id}>
                    <td>{player.first_name} {player.last_name}</td>
                    <td>{player.email}</td>
                    <td>{player.phone || 'Not provided'}</td>
                    <td>
                      <select
                        value={player.ranking}
                        onChange={(e) => confirmRankingChange(player, parseInt(e.target.value, 10))}
                      >
                        {[1, 2, 3, 4, 5].map(rank => (
                          <option key={rank} value={rank}>{rank}</option>
                        ))}
                      </select>
                    </td>
                    <td>{player.is_captain ? '👑' : ''}</td>
                    <td>
                      <button className="btn-small">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="captain-section card card--interactive">
        <div className="section-header">
          <div>
            <h2>Team Performance</h2>
            <p>Deep dive your roster, match record, and recent form without leaving the dashboard.</p>
          </div>
          <div className="section-actions">
            <button type="button" className="section-action" onClick={refreshStats} disabled={statsLoading}>
              {statsLoading ? 'Refreshing…' : 'Refresh Data'}
            </button>
          </div>
        </div>

        {statsError && <div className="card card--flat error-message">{statsError}</div>}

        {statsLoading ? (
          <div className="card card--flat">Loading team performance…</div>
        ) : (
          <div className="team-performance-grid">
            <div className="team-performance-overview">
              <div className="stat-card card card--interactive card--overlay">
                <div className="stat-label">Match Record</div>
                <div className="stat-value">{teamRecord.wins} - {teamRecord.losses}</div>
                <div className="stat-subtitle">{winPercentage}% Match Win Rate</div>
              </div>
              <div className="stat-card card card--interactive card--overlay">
                <div className="stat-label">Line Record</div>
                <div className="stat-value">{teamLineStats.linesWon} - {teamLineStats.linesLost}</div>
                <div className="stat-subtitle">{lineWinPercentage}% Lines Won</div>
              </div>
              <div className="stat-card card card--interactive card--overlay">
                <div className="stat-label">Games Record</div>
                <div className="stat-value">{teamLineStats.gamesWon} - {teamLineStats.gamesLost}</div>
                <div className="stat-subtitle">{gamesWinPercentage}% Games Won</div>
              </div>
              <div className="stat-card card card--interactive card--overlay">
                <div className="stat-label">Matches Played</div>
                <div className="stat-value">{(teamRecord.wins || 0) + (teamRecord.losses || 0)}</div>
                <div className="stat-subtitle">This Season</div>
              </div>
            </div>

            <div className="player-performance card card--flat">
              <div className="section-header compact">
                <div>
                  <h3>Player Performance</h3>
                  <p>Individual records sorted by win percentage.</p>
                </div>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Matches</th>
                      <th>Record</th>
                      <th>Win %</th>
                      <th>Singles</th>
                      <th>Doubles</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerStats.map((p) => {
                      const total = p.wins + p.losses;
                      const pct = total > 0 ? ((p.wins / total) * 100).toFixed(1) : '0.0';
                      return (
                        <tr key={p.id}>
                          <td>
                            <div className="player-name">
                              {p.first_name} {p.last_name}
                              {p.is_captain && <span className="captain-badge">👑</span>}
                            </div>
                          </td>
                          <td>{p.matchesPlayed}</td>
                          <td>{p.wins} - {p.losses}</td>
                          <td>{pct}%</td>
                          <td>{p.singlesRecord.wins} - {p.singlesRecord.losses}</td>
                          <td>{p.doublesRecord.wins} - {p.doublesRecord.losses}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="recent-history card card--flat">
              <div className="section-header compact">
                <div>
                  <h3>Recent Match History</h3>
                  <p>Latest 10 results to keep tabs on momentum.</p>
                </div>
              </div>
              <div className="recent-matches">
                {recentMatches.length === 0 ? (
                  <div className="empty-state">No match history available.</div>
                ) : (
                  recentMatches.map((matchEntry) => {
                    const matchDate = matchEntry.date
                      ? new Date(matchEntry.date).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })
                      : 'Date TBA';

                    let resultLabel = 'Pending';
                    if (matchEntry.teamLines !== null && matchEntry.opponentLines !== null) {
                      resultLabel = `${matchEntry.teamLines} - ${matchEntry.opponentLines} Lines`;
                    } else if (matchEntry.teamGames !== null && matchEntry.opponentGames !== null) {
                      resultLabel = `${matchEntry.teamGames} - ${matchEntry.opponentGames} Games`;
                    }

                    const statusClass = matchEntry.teamWon === null
                      ? 'result-pending'
                      : matchEntry.teamWon
                        ? 'result-win'
                        : 'result-loss';

                    return (
                      <article key={matchEntry.id} className="match-history-card card card--subtle">
                        <div className="match-date">{matchDate}</div>
                        <div className="match-teams">
                          <span>{matchEntry.home_team_name}</span>
                          <span className="vs-label">vs</span>
                          <span>{matchEntry.away_team_name}</span>
                        </div>
                        <div className={`match-result ${statusClass}`}>{resultLabel}</div>
                      </article>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="captain-section card card--interactive">
        <div className="section-header">
          <div>
            <h2>Captain Tools</h2>
            <p>Quick access to core actions that keep your team organized.</p>
          </div>
        </div>
        <div className="tools-grid">
            <button
              type="button"
              className="tool-card card card--interactive"
              onClick={handleEmailTeam}
              disabled={roster.every(player => !player.email)}
            >
              <div className="tool-icon">📧</div>
              <h3>Send Team Email</h3>
              <p>Send announcements to all team members.</p>
            </button>
            <button className="tool-card card card--interactive">
              <div className="tool-icon">🔄</div>
              <h3>Request Substitutes</h3>
              <p>Find subs for upcoming matches.</p>
            </button>
            <button
              type="button"
              className="tool-card card card--interactive"
              onClick={() => document.querySelector('.team-performance-grid')?.scrollIntoView({ behavior: 'smooth' })}
            >
              <div className="tool-icon">📊</div>
              <h3>View Team Performance</h3>
              <p>Jump to the analytics section on this page.</p>
            </button>
            {user && (
              <Link
                to="/admin/schedule-generator"
                className="tool-card card card--interactive tool-card-link"
              >
                <div className="tool-icon">⚙️</div>
                <h3>Schedule Generator</h3>
                <p>Generate new schedule for upcoming season.</p>
              </Link>
            )}
        </div>
      </section>

      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}

      {rosterManagerOpen && (
        <div className="roster-manager-overlay" role="dialog" aria-modal="true">
          <div className="roster-manager-modal card card--interactive">
            <div className="roster-manager-header">
              <div>
                <h3>Manage Team Roster</h3>
                <p>Add active free agents or remove players from your lineup.</p>
              </div>
              <button type="button" className="btn-small" onClick={closeRosterManager}>
                Close
              </button>
            </div>

            <div className="roster-manager-columns">
              <div className="roster-column">
                <h4>Current Roster</h4>
                {roster.length === 0 ? (
                  <p>No players assigned to this team.</p>
                ) : (
                  <div className="mini-roster-list">
                    {roster.map(p => (
                      <div key={p.id} className="mini-player-card">
                        <span>{p.first_name} {p.last_name}</span>
                        <button className="btn-text-danger">Remove</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="roster-column">
                <h4>Available Players</h4>
                {rosterManagerLoading ? (
                  <p>Loading available players…</p>
                ) : availablePlayers.length === 0 ? (
                  <p>No other active players found.</p>
                ) : (
                  <div className="mini-roster-list">
                    {availablePlayers.map(p => (
                      <div key={p.id} className="mini-player-card">
                        <span>{p.first_name} {p.last_name} (Rank: {p.ranking})</span>
                        <button className="btn-text-primary" onClick={() => handleInvitePlayer(p.id)}>Invite to Team</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {lineupManagerOpen && (
        <div className="lineup-manager-overlay" role="dialog" aria-modal="true">
          <div className="lineup-manager-modal card card--interactive">
            <div className="lineup-manager-header">
              <div>
                <h3>Lineup for Match #{selectedMatchForLineup?.id?.substring(0, 8)}</h3>
                <p>Assign players to lines and manage substitute requests.</p>
              </div>
              <button type="button" className="btn-small" onClick={closeLineupManager}>
                Done
              </button>
            </div>

            <div className="lineup-editor">
               <p>Lineup management interface is being updated for the 2026 season rules.</p>
               {lineupManagerLoading && <p>Loading substitutes…</p>}
            </div>
          </div>
        </div>
      )}

      {pendingAction && (
        <div className="confirm-overlay" role="dialog" aria-modal="true">
          <div className={`confirm-dialog card card--interactive ${pendingAction.intent === 'danger' ? 'confirm-danger' : ''}`}>
            <div className="confirm-header">
              <h3>{pendingAction.title}</h3>
              <button type="button" className="btn-icon-labeled" onClick={closeConfirmation} aria-label="Close confirmation" disabled={confirmLoading}>
                ✕ <span className="btn-label-text">Close</span>
              </button>
            </div>
            <p className="confirm-message">{pendingAction.message}</p>
            <div className="confirm-actions">
              <button
                type="button"
                className="btn-small btn-secondary"
                onClick={closeConfirmation}
                disabled={confirmLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                className={`btn-small ${pendingAction.intent === 'danger' ? 'btn-danger' : ''}`}
                onClick={handleConfirmAction}
                disabled={confirmLoading}
              >
                {confirmLoading ? 'Processing…' : pendingAction.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
