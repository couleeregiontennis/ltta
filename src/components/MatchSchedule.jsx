import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../scripts/supabaseClient';
import { useAuth } from '../context/AuthProvider';
import { useSeason } from '../hooks/useSeason';
import { LoadingSpinner } from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import '../styles/MatchSchedule.css';

// OPTIMIZATION: Move static helpers outside component to avoid recreation
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const formatTime = (timeString) => {
  return timeString || 'TBD';
};

const getMatchStatus = (match) => {
  if (match.status === 'rain_cancellation') {
    return 'rain-canceled';
  }
  if (match.status === 'heat_cancellation') {
    return 'heat-canceled';
  }
  if (match.status === 'cancelled') {
    return 'canceled';
  }

  const matchDate = new Date(match.date);
  const now = new Date();

  if (match.status === 'completed') {
    return 'completed';
  } else if (matchDate < now && match.status === 'scheduled') {
    return 'pending-result';
  } else {
    return 'upcoming';
  }
};

const getStatusBadge = (status) => {
  const badges = {
    'upcoming': { text: 'Upcoming', class: 'status-upcoming' },
    'completed': { text: 'Completed', class: 'status-completed' },
    'pending-result': { text: 'Pending Result', class: 'status-pending' },
    'canceled': { text: 'Cancelled', class: 'status-canceled' },
    'rain-canceled': { text: 'Rained Out', class: 'status-canceled' },
    'heat-canceled': { text: 'Heat Cancellation', class: 'status-warning' }
  };
  return badges[status] || badges['upcoming'];
};

const groupMatchesByDate = (matches) => {
  const grouped = {};
  matches.forEach(match => {
    const dateKey = new Date(match.date).toDateString();
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(match);
  });
  return grouped;
};

export const MatchSchedule = () => {
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('list');
  const [selectedTeam, setSelectedTeam] = useState('all');

  const { currentSeason, loading: seasonLoading } = useSeason();

  const fetchAllData = async () => {
    if (!currentSeason) return;
    try {
      setLoading(true);
      setError(null);

      const { data: matchesData, error: matchesError } = await supabase
        .from('team_match')
        .select(`
          id, 
          date, 
          time, 
          status, 
          courts, 
          is_disputed,
          home_team:home_team_id (id, name, number), 
          away_team:away_team_id (id, name, number),
          line_results (
            home_won
          )
        `)
        .eq('season_id', currentSeason.id)
        .order('date', { ascending: true });

      const { data: teamsData, error: teamsError } = await supabase
        .from('team')
        .select('id, name, number')
        .order('name');

      if (matchesError) throw matchesError;
      if (teamsError) throw teamsError;

      const flattenedMatches = (matchesData || []).map(m => ({
        ...m,
        home_team_name: m.home_team?.name || 'Unknown',
        home_team_number: m.home_team?.number || 0,
        away_team_name: m.away_team?.name || 'Unknown',
        away_team_number: m.away_team?.number || 0,
        home_points: m.line_results?.filter(lr => lr.home_won).length || 0,
        away_points: m.line_results?.filter(lr => !lr.home_won && lr.home_won !== null).length || 0
      }));

      setMatches(flattenedMatches);
      setTeams(Array.isArray(teamsData) ? teamsData : []);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load schedule data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!seasonLoading) {
      if (currentSeason) {
        fetchAllData();
      } else {
        setLoading(false);
      }
    }
  }, [currentSeason, seasonLoading]);

  const handleToggleRainout = async (matchId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'rain_cancellation' ? 'scheduled' : 'rain_cancellation';
      const { error } = await supabase
        .from('team_match')
        .update({ status: newStatus })
        .eq('id', matchId);

      if (error) throw error;
      fetchAllData();
    } catch (err) {
      console.error('Error toggling rainout status:', err);
    }
  };

  const handleFlagScore = async (matchId) => {
    try {
      const { error } = await supabase.rpc('flag_match_score', { match_id: matchId });
      if (error) throw error;

      setMatches(prevMatches => prevMatches.map(m =>
        m.id === matchId ? { ...m, is_disputed: true } : m
      ));
    } catch (err) {
      console.error('Error flagging match score:', err);
    }
  };

  const filteredMatches = useMemo(() => {
    let filtered = matches;
    if (selectedTeam !== 'all') {
      const selectedTeamData = teams.find(t => t.id === selectedTeam);
      if (selectedTeamData) {
        filtered = filtered.filter(match =>
          match.home_team_number === selectedTeamData.number ||
          match.away_team_number === selectedTeamData.number
        );
      }
    }

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    if (viewMode === 'month') {
      filtered = filtered.filter(match => {
        const matchDate = new Date(match.date);
        return matchDate >= startOfMonth && matchDate <= endOfMonth;
      });
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      filtered = filtered.filter(match => {
        const matchDate = new Date(match.date);
        return matchDate >= startOfWeek && matchDate <= endOfWeek;
      });
    }
    return filtered;
  }, [matches, teams, selectedTeam, viewMode, currentDate]);

  const groupedMatches = useMemo(() => groupMatchesByDate(filteredMatches), [filteredMatches]);

  const counts = useMemo(() => {
    return {
      completed: filteredMatches.filter(m => getMatchStatus(m) === 'completed').length,
      upcoming: filteredMatches.filter(m => getMatchStatus(m) === 'upcoming').length,
      pending: filteredMatches.filter(m => getMatchStatus(m) === 'pending-result').length
    };
  }, [filteredMatches]);

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === 'month') newDate.setMonth(currentDate.getMonth() + direction);
    else if (viewMode === 'week') newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const getDateRangeText = () => {
    if (viewMode === 'month') return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return 'All Matches';
  };

  if (loading) return <div className="match-schedule"><div className="loading"><LoadingSpinner size="md" /></div></div>;

  return (
    <div className="match-schedule">
      <div className="schedule-header">
        <h1>Match Schedule</h1>
        <p>Plan lineups, track results, and stay informed on weekly match activity.</p>
        <div className="policy-banner" style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-card-hover)', borderLeft: '4px solid var(--error)', borderRadius: '4px' }}>
          <strong>2026 Weather Policy:</strong> Rain/Heat cancellations go off 'Feels Like' temperature. 95°F = optional; 104°F = automatic.
        </div>
      </div>

      <div className="schedule-controls card card--interactive card--overlay">
        <div className="control-row">
          <div className="view-toggle">
            <button className={`view-btn ${viewMode === 'month' ? 'active' : ''}`} onClick={() => setViewMode('month')}>Month</button>
            <button className={`view-btn ${viewMode === 'week' ? 'active' : ''}`} onClick={() => setViewMode('week')}>Week</button>
            <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}>List</button>
          </div>
          <div className="date-navigation">
            <button onClick={() => navigateDate(-1)} className="nav-btn">←</button>
            <span className="date-range">{getDateRangeText()}</span>
            <button onClick={() => navigateDate(1)} className="nav-btn">→</button>
          </div>
          <div className="filter-controls">
            <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)} className="team-filter">
              <option value="all">All Teams</option>
              {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="schedule-content">
        {Object.keys(groupedMatches).length > 0 ? (
          <div className={`matches-container ${viewMode}`}>
            {Object.entries(groupedMatches)
              .sort(([a], [b]) => new Date(a) - new Date(b))
              .map(([dateKey, dayMatches]) => (
                <section key={dateKey} className="day-section">
                  <header className="day-header">
                    <div className="day-title">{formatDate(dateKey)}</div>
                  </header>
                  <div className="day-matches">
                    {dayMatches.map(match => {
                      const status = getMatchStatus(match);
                      const statusBadge = getStatusBadge(status);
                      return (
                        <article key={match.id} className={`match-card card card--interactive card--overlay ${status}`}>
                          <div className="match-meta">
                            <span className="match-time">{formatTime(match.time)}</span>
                            <span className={`status-badge ${statusBadge.class}`}>{statusBadge.text}</span>
                          </div>
                          <div className="match-teams">
                            <div className="team home-team"><strong>{match.home_team_name}</strong></div>
                            <span className="vs">vs</span>
                            <div className="team away-team"><strong>{match.away_team_name}</strong></div>
                          </div>
                          <div className="match-details">
                            <span>Courts: {match.courts || 'TBD'}</span>
                          </div>
                          {status === 'completed' && (
                            <div className="match-score-summary" style={{ textAlign: 'center', margin: '1rem 0', padding: '0.5rem', backgroundColor: 'var(--bg-card)', borderRadius: '6px' }}>
                              <div>Points Won: {match.home_points} - {match.away_points}</div>
                              {match.is_disputed ? (
                                <div className="dispute-badge" style={{ marginTop: '0.5rem', color: 'var(--warning)', fontWeight: 'bold' }}>
                                  Score Disputed ⚠️
                                </div>
                              ) : (
                                <button
                                  className="flag-score-btn"
                                  onClick={(e) => { e.stopPropagation(); handleFlagScore(match.id); }}
                                  style={{ marginTop: '0.5rem', padding: '0.25rem 0.75rem', fontSize: '0.8rem', backgroundColor: 'transparent', border: '1px solid var(--warning)', color: 'var(--warning)', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                  Flag Score
                                </button>
                              )}
                            </div>
                          )}
                          {(userRole?.isAdmin || userRole?.isCaptain) && status !== 'completed' && (
                            <div className="match-actions" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px' }}>
                              <button
                                className="edit-result-btn"
                                onClick={(e) => { e.stopPropagation(); handleToggleRainout(match.id, match.status); }}
                                style={match.status === 'rain_cancellation' ? { backgroundColor: 'var(--text-secondary)' } : { backgroundColor: 'var(--error)' }}
                              >
                                {match.status === 'rain_cancellation' ? 'Undo Rainout' : 'Mark Rainout'}
                              </button>

                              {userRole?.isAdmin && (
                                <button
                                  className="edit-result-btn"
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    const newStatus = match.status === 'heat_cancellation' ? 'scheduled' : 'heat_cancellation';
                                    await supabase.from('team_match').update({ status: newStatus }).eq('id', match.id);
                                    fetchAllData();
                                  }}
                                  style={match.status === 'heat_cancellation' ? { backgroundColor: 'var(--text-secondary)' } : { backgroundColor: 'var(--warning)', color: 'black' }}
                                >
                                  {match.status === 'heat_cancellation' ? 'Undo Heat' : 'Mark Heat'}
                                </button>
                              )}
                            </div>
                          )}

                          {userRole?.isAdmin && (
                            <div className="admin-actions" style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px dashed var(--border-color)' }}>
                              <button
                                className="edit-result-btn"
                                onClick={(e) => { e.stopPropagation(); navigate(`/add-score?matchId=${match.id}`); }}
                                style={{ width: '100%', backgroundColor: 'var(--primary)', color: 'white' }}
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </section>
              ))}
          </div>
        ) : <EmptyState title="No matches found" description="Adjust your filters or check back later." />}
      </div>
    </div>
  );
};
