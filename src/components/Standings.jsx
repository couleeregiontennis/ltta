import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import api from '../scripts/apiClient';
import { useAuth } from '../context/AuthProvider';
import { useSeason } from '../hooks/useSeason';
import { EmptyState } from './EmptyState';
import '../styles/Style.css';
import '../styles/Standings.css';
import '../styles/Skeleton.css';

const StandingsSkeleton = () => (
  <div className="standings-table-card card">
    <div className="skeleton skeleton-row" style={{ height: '3.5rem', marginBottom: '1rem' }} />
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="skeleton skeleton-row" style={{ opacity: 1 - i * 0.15 }} />
    ))}
  </div>
);

const DisputeBadge = () => (
  <span className="dispute-badge" title="Disputed match results">
    <svg
      viewBox="0 0 24 24"
      width="13"
      height="13"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  </span>
);

const PlayoffStatusBadge = ({ team }) => {
  switch (team.playoffStatus) {
    case 'Clinched':
      return <span className="status-badge clinched">Clinched</span>;
    case 'Eliminated':
      return <span className="status-badge eliminated">Eliminated</span>;
    case 'Control Destiny':
      return <span className="status-badge control">Control Destiny</span>;
    case 'On the Hunt':
      return (
        <span className="status-badge hunt">
          Magic #: {team.magicNumber}
        </span>
      );
    default:
      return null;
  }
};

const StandingsCard = memo(({ team, index }) => {
  if (!team) return null;
  const rank = index + 1;

  return (
    <div className={`standings-mobile-card card ${index === 0 ? 'leader' : ''}`}>
      <div className="card-rank">{rank}</div>
      <div className="card-main">
        <div className="card-team-info">
          <span className="team-number">Team {team.number}</span>
          <span className="team-name">
            {team.name}
            {team.hasDisputes && <DisputeBadge />}
          </span>
        </div>
        <div className="card-stats-grid">
          <div className="stat-item">
            <span className="stat-label">Points</span>
            <span className="stat-value">{team.totalPoints}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Sets W-L</span>
            <span className="stat-value">{team.setsWon}-{team.setsLost}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Record</span>
            <span className="stat-value">
              {team.ties > 0
                ? `${team.wins}-${team.losses}-${team.ties}`
                : `${team.wins}-${team.losses}`}
            </span>
          </div>
        </div>
        <div className="card-status">
          <PlayoffStatusBadge team={team} />
          {team.playNight && <span className="card-night">{team.playNight}</span>}
        </div>
      </div>
    </div>
  );
});

const StandingsRow = memo(({ team, index }) => {
  if (!team) return null;
  const rank = index + 1;

  return (
    <tr className={index === 0 ? 'leader' : ''}>
      <td data-label="Rank" className="rank-cell">{rank}</td>
      <td data-label="Team">
        <div className="team-cell">
          <span className="team-name">{team.name}</span>
          <span className="team-sub">
            Team {team.number}
            {team.hasDisputes && <DisputeBadge />}
          </span>
        </div>
      </td>
      <td data-label="Night" className="night-cell">
        {team.playNight || 'TBA'}
      </td>
      <td data-label="Status">
        <PlayoffStatusBadge team={team} />
      </td>
      <td data-label="Matches" className="num-cell">{team.matchesPlayed}</td>
      <td data-label="Points" className="num-cell points-cell">{team.totalPoints}</td>
      <td data-label="Sets W-L" className="num-cell hide-mobile">
        {team.setsWon}-{team.setsLost}
      </td>
      <td data-label="Bonus" className="num-cell hide-mobile">
        {team.bonusPoints}
      </td>
    </tr>
  );
});

const Standings = () => {
  const { user, loading: authLoading } = useAuth();
  const { currentSeason, loading: seasonLoading } = useSeason();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [standings, setStandings] = useState([]);
  const [nightFilter, setNightFilter] = useState(() => {
    try {
      return localStorage.getItem('ltta-standings-filter') || 'All';
    } catch (err) {
      console.warn('Failed to access localStorage:', err);
      return 'All';
    }
  });
  const [nightOptions, setNightOptions] = useState(['All']);
  const [lastUpdated, setLastUpdated] = useState('');
  const [nightHighlights, setNightHighlights] = useState({ tuesday: null, wednesday: null });

  // User team state
  const [userTeamId, setUserTeamId] = useState(null);
  const [userTeamNumber, setUserTeamNumber] = useState(null);
  const [userTeamStanding, setUserTeamStanding] = useState(null);
  const [hasUserTeam, setHasUserTeam] = useState(false);

  const [leagueOverview, setLeagueOverview] = useState({
    totalMatches: 0,
    totalTeams: 0,
    totalPlayers: 0,
    avgMatchesPerTeam: 0,
    recentMatches: [],
    matchesByWeek: []
  });

  const fetchStandings = useCallback(async () => {
    if (!currentSeason) {
      console.log('Standings: No current season, skipping fetch');
      return;
    }
    try {
      setLoading(true);
      setError('');
      console.log('Standings: Fetching data for season:', currentSeason.id);

      const [
        standingsData,
        overviewData,
        recentMatchesData,
        disputedRes
      ] = await Promise.all([
        api.get('/standings'),
        api.get('/standings/overview'),
        api.get('/standings/recent-matches'),
        api.get('/matches?seasonId=' + currentSeason.id + '&disputed=true').catch(() => [])
      ]);

      const disputedTeamIds = new Set();
      if (disputedRes && Array.isArray(disputedRes)) {
        disputedRes.forEach(match => {
          if (match.home_team?.id) disputedTeamIds.add(match.home_team.id);
          if (match.away_team?.id) disputedTeamIds.add(match.away_team.id);
        });
      }

      // Process Standings
      const formattedStandings = (standingsData || []).map((team) => {
        return {
            id: team.team_id,
            number: team.team_number,
            name: team.team_name,
            playNight: team.play_night,
            totalPoints: team.total_points,
            matchesPlayed: team.matches_played,
            setsWon: team.total_sets_won,
            setsLost: team.total_sets_lost,
            wins: team.wins || 0,
            losses: team.losses || 0,
            ties: team.ties || 0,
            gamesWon: team.games_won || 0,
            gamesLost: team.games_lost || 0,
            winPercentage: team.win_percentage || 0,
            bonusPoints: team.total_bonus_points,
            playoffStatus: team.playoffStatus || '',
            magicNumber: team.magicNumber || 0,
            hasDisputes: disputedTeamIds.has(team.team_id)
          };
      });

      // Sort Standings by Total Points
      const sortedStandings = [...formattedStandings].sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        const setDiffA = a.setsWon - a.setsLost;
        const setDiffB = b.setsWon - b.setsLost;
        return setDiffB - setDiffA;
      });

      const uniqueNights = Array.from(
        new Set(sortedStandings.map((team) => team.playNight).filter(Boolean))
      ).sort((a, b) => a.localeCompare(b));

      const findTopTeamForNight = (night) =>
        sortedStandings.find(
          (team) => (team.playNight || '').toLowerCase() === night.toLowerCase()
        ) || null;

      setStandings(sortedStandings);
      setNightOptions(['All', ...uniqueNights]);
      setLastUpdated(new Date().toISOString());
      setNightHighlights({
        tuesday: findTopTeamForNight('tuesday'),
        wednesday: findTopTeamForNight('wednesday')
      });

      setLeagueOverview({
        totalMatches: overviewData?.totalMatches || 0,
        totalTeams: sortedStandings.length,
        totalPlayers: overviewData?.totalPlayers || 0,
        avgMatchesPerTeam: sortedStandings.length > 0 ? (overviewData?.totalMatches || 0) / sortedStandings.length : 0,
        recentMatches: recentMatchesData || [],
        matchesByWeek: overviewData?.matchesByWeek || []
      });

    } catch (err) {
      console.error('Error loading standings:', err);
      setError('Unable to load standings at this time.');
    } finally {
      setLoading(false);
    }
  }, [currentSeason]);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  useEffect(() => {
    let isMounted = true;

    const loadUserTeam = async () => {
      if (!user) {
        if (!isMounted) return;
        setHasUserTeam(false);
        setUserTeamId(null);
        setUserTeamNumber(null);
        return;
      }

      try {
        const teamLink = await api.get('/players/me/team').catch(() => null);

        if (!isMounted) return;

        if (teamLink?.team) {
          setUserTeamId(teamLink.team.id || null);
          setUserTeamNumber(teamLink.team.number ?? null);
          setHasUserTeam(true);
        } else {
          setHasUserTeam(false);
          setUserTeamId(null);
          setUserTeamNumber(null);
        }
      } catch (err) {
        console.error('Error loading user team:', err);
        if (isMounted) {
          setHasUserTeam(false);
          setUserTeamId(null);
          setUserTeamNumber(null);
        }
      }
    };

    if (!authLoading) {
      loadUserTeam();
    }

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  useEffect(() => {
    if (!standings.length || (!userTeamId && !userTeamNumber)) {
      setUserTeamStanding(null);
      return;
    }

    const match =
      standings.find((team) => team.id === userTeamId) ||
      standings.find(
        (team) =>
          userTeamNumber !== null && Number(team.number) === Number(userTeamNumber)
      ) ||
      null;

    setUserTeamStanding(match);
  }, [standings, userTeamId, userTeamNumber]);

  useEffect(() => {
    if (!loading && nightFilter !== 'All' && !nightOptions.includes(nightFilter)) {
      setNightFilter('All');
    }
  }, [nightOptions, nightFilter, loading]);

  useEffect(() => {
    try {
      localStorage.setItem('ltta-standings-filter', nightFilter);
    } catch (err) {
      console.warn('Failed to access localStorage:', err);
    }
  }, [nightFilter]);

  const filteredStandings = useMemo(() => {
    if (nightFilter === 'All') {
      return standings;
    }

    return standings.filter(
      (team) => (team.playNight || '').toLowerCase() === nightFilter.toLowerCase()
    );
  }, [standings, nightFilter]);

  const topTeam = standings[0];

  const formattedUpdatedAt = lastUpdated
    ? new Date(lastUpdated).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    : '';

  const shouldShowSpotlight =
    nightHighlights.tuesday ||
    nightHighlights.wednesday ||
    (!authLoading && user && hasUserTeam && userTeamStanding);

  const topTeamSnapshot = standings.slice(0, 5);
  const maxMatchCount = leagueOverview.matchesByWeek.reduce(
    (maxValue, week) => Math.max(maxValue, week.count),
    0
  ) || 1;

  const formatMatchDate = (value) => {
    if (!value) return 'TBA';
    return new Date(value).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatShortDate = (value) => {
    if (!value) return 'TBA';
    return new Date(value).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  };

  const formatStatus = (value) => {
    if (!value) return 'Scheduled';
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <main className="standings-page">
      <header className="standings-header">
        <p className="standings-eyebrow">{currentSeason?.name || 'League Season'}</p>
        <h1>Team Standings</h1>
        <p className="standings-lede">Live standings generated from recorded match results.</p>
      </header>

      {loading ? (
        <StandingsSkeleton />
      ) : error ? (
        <div className="error-state card">
          <p>{error}</p>
          <button type="button" className="refresh-btn" onClick={fetchStandings}>
            Try Again
          </button>
        </div>
      ) : (
        <>
          {shouldShowSpotlight && (
            <div className="standings-spotlight">
              {topTeam && (
                <article className="spotlight-card card league-leader">
                  <span className="spotlight-label">League Leader</span>
                  <div className="spotlight-team">
                    <span className="team-number">Team {topTeam.number}</span>
                    <span className="team-name">{topTeam.name}</span>
                  </div>
                  <div className="spotlight-meta">
                    {(topTeam.playNight || 'League')} · {topTeam.winPercentage.toFixed(1)}% win rate
                  </div>
                  <div className="spotlight-stats">
                    <span>Record {topTeam.wins}-{topTeam.losses}</span>
                    <span>Sets {topTeam.setsWon}-{topTeam.setsLost}</span>
                  </div>
                </article>
              )}
              {nightHighlights.tuesday && (
                <article className="spotlight-card card">
                  <span className="spotlight-label">Tuesday Leader</span>
                  <div className="spotlight-team">
                    <span className="team-number">Team {nightHighlights.tuesday.number}</span>
                    <span className="team-name">{nightHighlights.tuesday.name}</span>
                  </div>
                  <div className="spotlight-meta">
                    {nightHighlights.tuesday.winPercentage.toFixed(1)}% win rate · {nightHighlights.tuesday.wins}-{nightHighlights.tuesday.losses}
                  </div>
                  <div className="spotlight-stats">
                    <span>Sets {nightHighlights.tuesday.setsWon}-{nightHighlights.tuesday.setsLost}</span>
                    <span>Games {nightHighlights.tuesday.gamesWon}-{nightHighlights.tuesday.gamesLost}</span>
                  </div>
                </article>
              )}
              {nightHighlights.wednesday && (
                <article className="spotlight-card card">
                  <span className="spotlight-label">Wednesday Leader</span>
                  <div className="spotlight-team">
                    <span className="team-number">Team {nightHighlights.wednesday.number}</span>
                    <span className="team-name">{nightHighlights.wednesday.name}</span>
                  </div>
                  <div className="spotlight-meta">
                    {nightHighlights.wednesday.winPercentage.toFixed(1)}% win rate · {nightHighlights.wednesday.wins}-{nightHighlights.wednesday.losses}
                  </div>
                  <div className="spotlight-stats">
                    <span>Sets {nightHighlights.wednesday.setsWon}-{nightHighlights.wednesday.setsLost}</span>
                    <span>Games {nightHighlights.wednesday.gamesWon}-{nightHighlights.wednesday.gamesLost}</span>
                  </div>
                </article>
              )}
              {!authLoading && user && hasUserTeam && userTeamStanding && (
                <article className="spotlight-card card personal-team">
                  <span className="spotlight-label">Your Team</span>
                  <div className="spotlight-team">
                    <span className="team-number">Team {userTeamStanding.number}</span>
                    <span className="team-name">{userTeamStanding.name}</span>
                  </div>
                  <div className="spotlight-meta">
                    {userTeamStanding.playNight || 'League'} · {userTeamStanding.winPercentage.toFixed(1)}% win rate
                  </div>
                  <div className="spotlight-stats">
                    <span>Record {userTeamStanding.wins}-{userTeamStanding.losses}{userTeamStanding.ties > 0 ? `-${userTeamStanding.ties}` : ''}</span>
                    <span>Sets {userTeamStanding.setsWon}-{userTeamStanding.setsLost}</span>
                    <span>Games {userTeamStanding.gamesWon}-{userTeamStanding.gamesLost}</span>
                  </div>
                </article>
              )}
            </div>
          )}

          <section className="standings-controls card" aria-label="Standings filters">
            <div className="standings-controls-header">
              <div className="controls-copy">
                <h2 className="controls-title">League nights</h2>
                <p className="controls-subtitle">
                  {nightFilter === 'All'
                    ? 'Showing all teams'
                    : `Showing ${nightFilter} teams`}
                </p>
              </div>
              <div className="controls-actions">
                {formattedUpdatedAt && (
                  <span className="updated-at">Updated {formattedUpdatedAt}</span>
                )}
                <button
                  type="button"
                  className="refresh-btn"
                  onClick={fetchStandings}
                  aria-label="Refresh standings"
                >
                  Refresh
                </button>
              </div>
            </div>
            <div className="night-filter-group" role="group" aria-label="Filter by league night">
              {nightOptions.map((night) => (
                <button
                  key={night}
                  type="button"
                  className={`night-filter ${nightFilter === night ? 'active' : ''}`}
                  aria-pressed={nightFilter === night}
                  onClick={() => setNightFilter(night)}
                >
                  {night}
                </button>
              ))}
            </div>
          </section>

          <div className="standings-table-card card">
            <table className="standings-table hide-mobile-flex">
              <thead>
                <tr>
                  <th aria-label="Rank">#</th>
                  <th>Team</th>
                  <th>Night</th>
                  <th>Status</th>
                  <th className="num-cell">Matches</th>
                  <th className="num-cell">Points</th>
                  <th className="num-cell hide-mobile">Sets W-L</th>
                  <th className="num-cell hide-mobile">Bonus</th>
                </tr>
              </thead>
              <tbody>
                {filteredStandings.length === 0 ? (
                  <tr className="empty-row">
                    <td colSpan={8}>No results yet for this league night.</td>
                  </tr>
                ) : (
                  filteredStandings.map((team, index) => (
                    <StandingsRow key={team.id} team={team} index={index} />
                  ))
                )}
              </tbody>
            </table>

            {/* Mobile Card View */}
            <div className="standings-mobile-list show-mobile-only">
              {filteredStandings.length === 0 ? (
                <EmptyState
                  title="No results yet"
                  description="Standings will appear here once the season begins and match scores are submitted."
                />
              ) : (
                filteredStandings.map((team, index) => (
                  <StandingsCard key={team.id} team={team} index={index} />
                ))
              )}
            </div>
          </div>

          <div className="standings-legend">
            <h3>Tie-breaker Rules</h3>
            <p>If teams have the same win percentage, standings are calculated in the following priority order:</p>
            <ol>
              <li><strong>Set differential:</strong> total sets won minus total sets lost.</li>
              <li><strong>Game differential:</strong> total games won minus total games lost.</li>
              <li><strong>Team number:</strong> ascending team number.</li>
            </ol>
          </div>

          {(leagueOverview.totalMatches > 0 || leagueOverview.totalTeams > 0) && (
            <section className="league-metrics" aria-label="Season overview">
              <div className="metrics-grid card">
                <div className="metric-cell">
                  <p className="metrics-label">Total Matches</p>
                  <p className="metrics-value">{leagueOverview.totalMatches}</p>
                </div>
                <div className="metric-cell">
                  <p className="metrics-label">Active Teams</p>
                  <p className="metrics-value">{leagueOverview.totalTeams}</p>
                </div>
                <div className="metric-cell">
                  <p className="metrics-label">Registered Players</p>
                  <p className="metrics-value">{leagueOverview.totalPlayers}</p>
                </div>
                <div className="metric-cell">
                  <p className="metrics-label">Matches per Team</p>
                  <p className="metrics-value">
                    {leagueOverview.avgMatchesPerTeam > 0
                      ? leagueOverview.avgMatchesPerTeam.toFixed(1)
                      : '0.0'}
                  </p>
                </div>
              </div>

              <div className="metrics-panels">
                <article className="metrics-panel card">
                  <div className="panel-header">
                    <h2>Team Performance Snapshot</h2>
                    <p>Top teams based on win percentage.</p>
                  </div>
                  <table className="mini-standings">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Team</th>
                        <th className="num-cell">Record</th>
                        <th className="num-cell">Win %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topTeamSnapshot.map((team, index) => (
                        <tr key={team.id}>
                          <td>{index + 1}</td>
                          <td>
                            <span className="team-number">#{team.number}</span> {team.name}
                          </td>
                          <td className="num-cell">
                            {team.wins}-{team.losses}
                            {team.ties ? `-${team.ties}` : ''}
                          </td>
                          <td className="num-cell">{team.winPercentage.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </article>

                <article className="metrics-panel card">
                  <div className="panel-header">
                    <h2>Recent Matches</h2>
                    <p>Latest activity reported across the league.</p>
                  </div>
                  {leagueOverview.recentMatches.length === 0 ? (
                    <p className="empty-state">No recent matches recorded.</p>
                  ) : (
                    <ul className="recent-matches-list">
                      {leagueOverview.recentMatches.map((match) => (
                        <li key={match.id} className="recent-match">
                          <span className="recent-match-date">{formatShortDate(match.date)}</span>
                          <div className="recent-match-teams">
                            <span>{match.home_team_name}</span>
                            <span className="vs">vs</span>
                            <span>{match.away_team_name}</span>
                          </div>
                          <span className="recent-match-meta">
                            {match.time ? `${match.time} · ${formatStatus(match.status)}` : formatStatus(match.status)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              </div>

              <article className="metrics-panel card metrics-panel-wide">
                <div className="panel-header">
                  <h2>Match Activity</h2>
                  <p>Recorded matches per week over the last 8 weeks.</p>
                </div>
                {leagueOverview.matchesByWeek.length === 0 ? (
                  <p className="empty-state">No match activity data available.</p>
                ) : (
                  <div className="activity-bars" role="list" aria-label="Recorded matches per week">
                    {leagueOverview.matchesByWeek.map((week) => (
                      <div key={week.date} className="activity-bar" role="listitem">
                        <div className="bar-track" title={`${week.count} matches`}>
                          <div
                            className="bar-fill"
                            style={{
                              height: `${Math.max(
                                10,
                                (week.count / maxMatchCount) * 100
                              )}%`
                            }}
                          />
                        </div>
                        <span className="bar-label">{formatShortDate(week.date)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            </section>
          )}
        </>
      )}
    </main>
  );
};

export { Standings };
