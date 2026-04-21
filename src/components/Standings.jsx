import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { supabase } from '../scripts/supabaseClient';
import { useAuth } from '../context/AuthProvider';
import { useSeason } from '../hooks/useSeason';
import { EmptyState } from './EmptyState';
import '../styles/Style.css';
import '../styles/Standings.css';

const StandingsCard = memo(({ team, index }) => {
  if (!team) return null;
  const rank = index + 1;
  const record =
    team.ties > 0
      ? `${team.wins}-${team.losses}-${team.ties}`
      : `${team.wins}-${team.losses}`;

  return (
    <div className={`standings-mobile-card card card--interactive ${index === 0 ? 'leader' : ''}`}>
      <div className="card-rank">#{rank}</div>
      <div className="card-main">
        <div className="card-team-info">
           {team.hasDisputes && <span className="dispute-badge" title="Disputed match results">⚠️</span>}
           <span className="team-number">Team {team.number}</span>
           <span className="team-name">{team.name}</span>
         </div>
        <div className="card-stats-grid">
          <div className="stat-item">
            <span className="stat-label">Points</span>
            <span className="stat-value">{team.totalPoints}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Sets (W-L)</span>
            <span className="stat-value">{team.setsWon}-{team.setsLost}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Bonus</span>
            <span className="stat-value">{team.bonusPoints}</span>
          </div>
        </div>
        <div className="card-status">
          {team.playoffStatus === 'Clinched' && <span className="status-badge clinched" title="Clinched 1st Place">🏆 Clinched</span>}
          {team.playoffStatus === 'Eliminated' && <span className="status-badge eliminated">Eliminated</span>}
          {team.playoffStatus === 'Control Destiny' && <span className="status-badge control">Control Destiny</span>}
          {team.playoffStatus === 'On the Hunt' && <span className="status-badge hunt" title="Magic Number to Clinch">Magic #: {team.magicNumber}</span>}
          {!team.playoffStatus && team.playNight && <span className="status-badge">—</span>}
        </div>
      </div>
    </div>
  );
});

  const StandingsRow = memo(({ team, index }) => {
    if (!team) return null;
    const rank = index + 1;
    const record =
      team.ties > 0
        ? `${team.wins}-${team.losses}-${team.ties}`
        : `${team.wins}-${team.losses}`;

    return (
      <tr
        className={index === 0 ? 'leader' : index < 3 ? 'top-three' : ''}
      >
        <td data-label="Rank">{rank}</td>
        <td data-label="Team">
          <div className="team-cell">
            {team.hasDisputes && <span className="dispute-badge" title="Disputed match results">⚠️</span>}
            <span className="team-number">Team {team.number}</span>
            <span className="team-name">{team.name}</span>
          </div>
        </td>
        <td data-label="Night">{team.playNight || '—'}</td>
        <td data-label="Status">
          {team.playoffStatus === 'Clinched' && <span className="status-badge clinched" title="Clinched 1st Place">🏆 Clinched</span>}
          {team.playoffStatus === 'Eliminated' && <span className="status-badge eliminated">Eliminated</span>}
          {team.playoffStatus === 'Control Destiny' && <span className="status-badge control">Control Destiny</span>}
          {team.playoffStatus === 'On the Hunt' && <span className="status-badge hunt" title="Magic Number to Clinch">Magic #: {team.magicNumber}</span>}
          {!team.playoffStatus && <span className="status-badge">—</span>}
        </td>
        <td data-label="Matches">{team.matchesPlayed}</td>
        <td data-label="Points"><strong>{team.totalPoints}</strong></td>
        <td data-label="Sets (W-L)" className="hide-mobile">
          {team.setsWon} - {team.setsLost}
        </td>
        <td data-label="Bonus" className="hide-mobile">
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

      // Use allSettled to ensure one failing call doesn't block the whole page
      const results = await Promise.allSettled([
        supabase.from('standings_2026_view').select('*'),
        supabase.from('player').select('*', { count: 'exact', head: true }),
        supabase.from('team_match').select(`
          id, date, time, status, 
          home_team:home_team_id (name), 
          away_team:away_team_id (name)
        `).order('date', { ascending: false }).limit(6),
        supabase.from('team_match').select('date'),
        supabase.functions.invoke('playoff-scenarios'),
        supabase.from('team_match').select('home_team_id, away_team_id').eq('is_disputed', true)
      ]);

      const [
        standingsRes,
        playerCountRes,
        recentMatchesRes,
        allDatesRes,
        playoffRes,
        disputedRes
      ] = results;

      if (standingsRes.status === 'rejected' || standingsRes.value.error) {
        console.error('Standings: Error loading standings_2026_view:', standingsRes.reason || standingsRes.value.error);
        throw standingsRes.reason || standingsRes.value.error;
      }

      const standingsData = standingsRes.value.data;
      const playerCount = playerCountRes.status === 'fulfilled' ? playerCountRes.value.count : 0;
      const recentMatchesData = recentMatchesRes.status === 'fulfilled' ? recentMatchesRes.value.data : [];
      const allMatchDates = allDatesRes.status === 'fulfilled' ? allDatesRes.value.data : [];
      const playoffData = playoffRes.status === 'fulfilled' ? playoffRes.value.data : null;
      const disputedMatches = disputedRes.status === 'fulfilled' ? disputedRes.value.data : [];

      console.log('Standings: Data loaded successfully', { 
        standingsCount: standingsData?.length,
        recentCount: recentMatchesData?.length 
      });

      const disputedTeamIds = new Set();
      if (disputedMatches) {
        disputedMatches.forEach(match => {
          if (match.home_team_id) disputedTeamIds.add(match.home_team_id);
          if (match.away_team_id) disputedTeamIds.add(match.away_team_id);
        });
      }

      // Process Standings
      const formattedStandings = (standingsData || []).map((team) => {
        const scenarios = (playoffData && typeof playoffData === 'object') ? playoffData[team.team_number] : null;
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
            playoffStatus: scenarios?.status || '',
            magicNumber: scenarios?.magicNumber || 0,
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

      // League Overview
      const totalMatches = allMatchDates?.length ?? 0;
      const totalTeams = standingsData?.length ?? 0;
      const totalPlayers = playerCount ?? 0;
      const avgMatchesPerTeam = totalTeams > 0 ? totalMatches / totalTeams : 0;

      const matchesByWeekMap = (allMatchDates || []).reduce((acc, match) => {
        if (!match?.date) return acc;
        const weekKey = new Date(match.date).toISOString().split('T')[0];
        acc[weekKey] = (acc[weekKey] || 0) + 1;
        return acc;
      }, {});

      const matchesByWeek = Object.entries(matchesByWeekMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(-8);

      // Process recent matches
      const formattedMatches = (recentMatchesData || []).map(m => ({
        ...m,
        home_team_name: m.home_team?.name || 'Unknown',
        away_team_name: m.away_team?.name || 'Unknown'
      }));

      setLeagueOverview({
        totalMatches,
        totalTeams,
        totalPlayers,
        avgMatchesPerTeam,
        recentMatches: formattedMatches,
        matchesByWeek
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
        const { data: teamLink, error: teamLinkError } = await supabase
          .from('player_to_team')
          .select('team ( id, number )')
          .eq('player', user.id)
          .maybeSingle();

        if (teamLinkError) throw teamLinkError;

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

  return (
    <main className="standings-page">
      <div className="standings-header">
        <h1>Team Standings</h1>
        <p>Live standings generated from recorded match results.</p>
      </div>

      {loading ? (
        <div className="loading-state card card--interactive">
          <p>Loading standings...</p>
        </div>
      ) : error ? (
        <div className="error-state card card--interactive">
          <p>{error}</p>
          <button type="button" className="refresh-btn" onClick={fetchStandings}>
            Try Again
          </button>
        </div>
      ) : (
        <>
          <div className="standings-overview">
            {topTeam && (
              <div className="overview-card card card--interactive card--overlay">
                <span className="overview-label">Top Team</span>
                <span className="overview-value">
                  {topTeam.number} · {topTeam.name}
                </span>
                <span className="overview-subtitle">
                  {(topTeam.playNight || 'League').toString()} · {topTeam.winPercentage.toFixed(1)}% win rate
                </span>
              </div>
            )}
          </div>

          {shouldShowSpotlight && (
            <div className="standings-spotlight">
              {nightHighlights.tuesday && (
                <div className="spotlight-card card card--interactive card--overlay">
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
                </div>
              )}
              {nightHighlights.wednesday && (
                <div className="spotlight-card card card--interactive card--overlay">
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
                </div>
              )}
              {!authLoading && user && hasUserTeam && userTeamStanding && (
                <div className="spotlight-card card card--interactive card--overlay personal-team">
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
                </div>
              )}
            </div>
          )}

          <div className="standings-controls card card--interactive">
            <div className="standings-controls-header">
              <div className="controls-copy">
                <span className="controls-title">Filter by league night</span>
                <span className="controls-subtitle">
                  {nightFilter === 'All'
                    ? 'Showing all teams'
                    : `Showing ${nightFilter} teams`}
                </span>
              </div>
              <button
                type="button"
                className="refresh-btn"
                onClick={fetchStandings}
                aria-label="Refresh standings"
              >
                Refresh Standings
              </button>
            </div>
            <div className="night-filter-group">
              {nightOptions.map((night) => (
                <button
                  key={night}
                  type="button"
                  className={`night-filter ${nightFilter === night ? 'active' : ''}`}
                  onClick={() => setNightFilter(night)}
                >
                  {night}
                </button>
              ))}
            </div>
            {formattedUpdatedAt && (
              <div className="updated-at">Last updated {formattedUpdatedAt}</div>
            )}
          </div>

          <div className="standings-table-card card card--interactive">
            <table className="standings-table hide-mobile-flex">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Team</th>
                  <th>Night</th>
                  <th>Status</th>
                  <th>Matches</th>
                  <th>Points</th>
                  <th className="hide-mobile">Sets (W-L)</th>
                  <th className="hide-mobile">Bonus</th>
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

          <div className="standings-legend card card--interactive">
            <h3>Tie-breaker Rules</h3>
            <p>If teams have the same Win Percentage, standings are calculated in the following CRTA priority order:</p>
            <ol>
              <li><strong>Set Differential:</strong> The difference between total sets won and total sets lost.</li>
              <li><strong>Game Differential:</strong> The difference between total games won and total games lost.</li>
              <li><strong>Team Number:</strong> Ascending team number (e.g. Team 1 vs Team 2).</li>
            </ol>
          </div>

          {(leagueOverview.totalMatches > 0 || leagueOverview.totalTeams > 0) && (
            <section className="league-metrics">
              <div className="metrics-grid">
                <article className="metrics-card card card--interactive card--overlay">
                  <p className="metrics-label">Total Matches</p>
                  <p className="metrics-value">{leagueOverview.totalMatches}</p>
                </article>
                <article className="metrics-card card card--interactive card--overlay">
                  <p className="metrics-label">Active Teams</p>
                  <p className="metrics-value">{leagueOverview.totalTeams}</p>
                </article>
                <article className="metrics-card card card--interactive card--overlay">
                  <p className="metrics-label">Registered Players</p>
                  <p className="metrics-value">{leagueOverview.totalPlayers}</p>
                </article>
                <article className="metrics-card card card--interactive card--overlay">
                  <p className="metrics-label">Avg Matches / Team</p>
                  <p className="metrics-value">
                    {leagueOverview.avgMatchesPerTeam > 0
                      ? leagueOverview.avgMatchesPerTeam.toFixed(1)
                      : '0.0'}
                  </p>
                </article>
              </div>

              <div className="metrics-panels">
                <article className="metrics-panel card card--interactive">
                  <div className="panel-header">
                    <h2>Team Performance Snapshot</h2>
                    <p>Top teams based on win percentage.</p>
                  </div>
                  <table className="mini-standings">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Team</th>
                        <th>Record</th>
                        <th>Win %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topTeamSnapshot.map((team, index) => (
                        <tr key={team.id}>
                          <td>{index + 1}</td>
                          <td>
                            <span className="team-number">#{team.number}</span> {team.name}
                          </td>
                          <td>
                            {team.wins}-{team.losses}
                            {team.ties ? `-${team.ties}` : ''}
                          </td>
                          <td>{team.winPercentage.toFixed(1)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </article>

                <article className="metrics-panel card card--interactive">
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
                          <div className="recent-match-date">{formatMatchDate(match.date)}</div>
                          <div className="recent-match-teams">
                            <span>{match.home_team_name}</span>
                            <span className="vs">vs</span>
                            <span>{match.away_team_name}</span>
                          </div>
                          <div className="recent-match-meta">
                            {match.time || 'Time TBA'} · {match.status || 'Scheduled'}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              </div>

              <article className="metrics-panel card card--interactive">
                <div className="panel-header">
                  <h2>Match Activity (Last 8 Weeks)</h2>
                  <p>Volume of recorded matches per week.</p>
                </div>
                {leagueOverview.matchesByWeek.length === 0 ? (
                  <p className="empty-state">No match activity data available.</p>
                ) : (
                  <div className="activity-bars" role="list">
                    {leagueOverview.matchesByWeek.map((week) => (
                      <div key={week.date} className="activity-bar" role="listitem">
                        <div
                          className="bar-fill"
                          style={{
                            height: `${Math.max(
                              10,
                              (week.count / maxMatchCount) * 100
                            )}%`
                          }}
                          title={`${week.count} matches`}
                        />
                        <span className="bar-label">{formatMatchDate(week.date)}</span>
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
