import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../scripts/apiClient';
import { useAuth } from '../context/AuthProvider';
import { useSeason } from './useSeason';

/**
 * Custom hook for fetching and managing team statistics data
 * Handles authentication, data fetching, and processing for team stats
 */
export const useTeamStatsData = () => {
  const { currentSeason, loading: seasonLoading } = useSeason();
  const { user: authUser, currentPlayerData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [team, setTeam] = useState(null);
  const [roster, setRoster] = useState([]);
  const [error, setError] = useState('');

  const [teamRecord, setTeamRecord] = useState({ wins: 0, losses: 0 });
  const [teamLineStats, setTeamLineStats] = useState({ linesWon: 0, linesLost: 0, gamesWon: 0, gamesLost: 0 });
  const [recentMatches, setRecentMatches] = useState([]);
  const [playerStats, setPlayerStats] = useState([]);

  /**
   * Loads the team roster for a given team ID
   */
  const loadTeamRoster = useCallback(async (teamId) => {
    try {
      const rosterData = await api.get(`/teams/${teamId}/roster`);
      const players = (Array.isArray(rosterData) ? rosterData : []).map(p => ({
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        email: p.email,
        ranking: p.ranking,
        is_captain: p.is_captain,
        name: `${p.first_name} ${p.last_name}`
      }));
      setRoster(players);
      return players;
    } catch (err) {
      console.error('Error loading roster:', err);
      setError(prev => prev ? `${prev}\nRoster error: ${err.message}` : `Roster error: ${err.message}`);
      return [];
    }
  }, []);

  /**
   * Fetches all matches for a team in the current season
   */
  const fetchTeamMatches = useCallback(async (teamId, seasonId) => {
    if (!teamId || !seasonId) return [];

    try {
      const data = await api.get(`/matches?seasonId=${seasonId}&teamId=${teamId}`);
      return (data || []).map(m => ({
        ...m,
        home_team_name: m.home_team?.name || 'Unknown',
        home_team_number: m.home_team?.number || 0,
        away_team_name: m.away_team?.name || 'Unknown',
        away_team_number: m.away_team?.number || 0,
        home_team_id: m.home_team?.id,
        away_team_id: m.away_team?.id
      }));
    } catch (err) {
      console.error('Error fetching team matches:', err);
      setError(prev => prev ? `${prev}\nMatches error: ${err.message}` : `Matches error: ${err.message}`);
      return [];
    }
  }, []);

  /**
   * Fetches match scores for given match IDs
   */
  const fetchMatchScores = useCallback(async (matchIds) => {
    if (!matchIds || matchIds.length === 0) return [];

    try {
      const data = await api.post('/matches/batch-scores', { matchIds });
      return data || [];
    } catch (err) {
      console.warn('Match scores missing, falling back:', err);
      return [];
    }
  }, []);

  /**
   * Fetches line results for given match IDs
   */
  const fetchLineResults = useCallback(async (matchIds) => {
    if (!matchIds || matchIds.length === 0) return [];

    try {
      const data = await api.post('/matches/batch-line-results', { matchIds });
      return data || [];
    } catch (err) {
      console.error('Error fetching line results:', err);
      setError(prev => prev ? `${prev}\nLine results error: ${err.message}` : `Line results error: ${err.message}`);
      return [];
    }
  }, []);

  /**
   * Calculates team record from match scores
   */
  const loadTeamRecordFromScores = useCallback((matches, matchScores, teamId) => {
    if (!matches || !matchScores || !teamId) return;

    const scoreMap = new Map(matchScores.map((score) => [score.match_id, score]));
    let wins = 0;
    let losses = 0;

    matches.forEach((match) => {
      const score = scoreMap.get(match.id);
      if (!score) return;

      const isHome = match.home_team_id === teamId;
      let teamWon;
      if (typeof score.home_won === 'boolean' || score.home_won === 0 || score.home_won === 1) {
        teamWon = isHome ? !!score.home_won : !score.home_won;
      } else {
        const teamLines = isHome ? (score.home_lines_won ?? 0) : (score.away_lines_won ?? 0);
        const oppLines = isHome ? (score.away_lines_won ?? 0) : (score.home_lines_won ?? 0);
        if (teamLines === oppLines) return;
        teamWon = teamLines > oppLines;
      }

      if (teamWon) wins += 1;
      else losses += 1;
    });

    setTeamRecord({ wins, losses });
  }, []);

  /**
   * Calculates team line statistics from match scores
   */
  const loadTeamLineStatsFromScores = useCallback((matchScores, matches, teamId) => {
    if (!matchScores || !matches || !teamId) return;

    const matchMap = new Map(matches.map((match) => [match.id, match]));
    let linesWon = 0, linesLost = 0, gamesWon = 0, gamesLost = 0;

    matchScores.forEach((score) => {
      const match = matchMap.get(score.match_id);
      if (!match) return;

      const isHome = match.home_team_id === teamId;
      if (isHome) {
        linesWon += score.home_lines_won || 0;
        linesLost += score.away_lines_won || 0;
        gamesWon += score.home_total_games || 0;
        gamesLost += score.away_total_games || 0;
      } else {
        linesWon += score.away_lines_won || 0;
        linesLost += score.home_lines_won || 0;
        gamesWon += score.away_total_games || 0;
        gamesLost += score.home_total_games || 0;
      }
    });

    setTeamLineStats({ linesWon, linesLost, gamesWon, gamesLost });
  }, []);

  /**
   * Processes recent matches with score data
   */
  const loadRecentMatchesFromList = useCallback((matches, matchScores, teamId) => {
    if (!matches || !matchScores || !teamId) return;

    const scoreMap = new Map(matchScores.map((score) => [score.match_id, score]));
    const recent = matches.slice(0, 10).map((match) => {
      const score = scoreMap.get(match.id);

      let teamLines = null, opponentLines = null, teamGames = null, opponentGames = null, teamWon = null;

      if (score) {
        const isHome = match.home_team_id === teamId;
        teamLines = isHome ? score.home_lines_won ?? null : score.away_lines_won ?? null;
        opponentLines = isHome ? score.away_lines_won ?? null : score.home_lines_won ?? null;
        teamGames = isHome ? score.home_total_games ?? null : score.away_total_games ?? null;
        opponentGames = isHome ? score.away_total_games ?? null : score.home_total_games ?? null;

        if (typeof score.home_won === 'boolean' || score.home_won === 0 || score.home_won === 1) {
          teamWon = isHome ? !!score.home_won : !score.home_won;
        } else if (teamLines !== null && opponentLines !== null && teamLines !== opponentLines) {
          teamWon = teamLines > opponentLines;
        } else if (teamGames !== null && opponentGames !== null && teamGames !== opponentGames) {
          teamWon = teamGames > opponentGames;
        }
      }

      return { ...match, teamLines, opponentLines, teamGames, opponentGames, teamWon };
    });

    setRecentMatches(recent);
  }, []);

  /**
   * Calculates player statistics from line results
   */
  const loadPlayerStatsFromLines = useCallback((rosterData, matches, lineResults, teamId) => {
    if (!rosterData || !matches || !lineResults || !teamId) return;

    const matchMap = new Map(matches.map((match) => [match.id, match]));
    const playerStatsMap = new Map();

    rosterData.forEach((player) => {
      playerStatsMap.set(player.id, {
        ...player,
        matchesPlayed: 0, wins: 0, losses: 0,
        setsWon: 0, setsLost: 0, gamesWon: 0, gamesLost: 0,
        singlesRecord: { wins: 0, losses: 0 },
        doublesRecord: { wins: 0, losses: 0 }
      });
    });

    lineResults.forEach((line) => {
      const match = matchMap.get(line.match_id);
      if (!match) return;

      const isHomeTeam = match.home_team_id === teamId;
      const playerIds = [];

      if (isHomeTeam) {
        if (line.home_player_1_id) playerIds.push(line.home_player_1_id);
        if (line.home_player_2_id) playerIds.push(line.home_player_2_id);
      } else {
        if (line.away_player_1_id) playerIds.push(line.away_player_1_id);
        if (line.away_player_2_id) playerIds.push(line.away_player_2_id);
      }

      const sets = [
        { home: line.home_set_1, away: line.away_set_1 },
        { home: line.home_set_2, away: line.away_set_2 },
        { home: line.home_set_3, away: line.away_set_3 }
      ].filter((set) =>
        set.home !== null && set.home !== undefined &&
        set.away !== null && set.away !== undefined
      );

      let setsWon = 0, setsLost = 0, gamesWon = 0, gamesLost = 0;

      sets.forEach((set) => {
        if (isHomeTeam) {
          gamesWon += set.home || 0;
          gamesLost += set.away || 0;
          if ((set.home || 0) > (set.away || 0)) setsWon++;
          else setsLost++;
        } else {
          gamesWon += set.away || 0;
          gamesLost += set.home || 0;
          if ((set.away || 0) > (set.home || 0)) setsWon++;
          else setsLost++;
        }
      });

      let teamWon;
      if (typeof line.home_won === 'boolean' || line.home_won === 0 || line.home_won === 1) {
        teamWon = isHomeTeam ? !!line.home_won : !line.home_won;
      } else if (gamesWon !== gamesLost) {
        teamWon = gamesWon > gamesLost;
      } else {
        teamWon = setsWon > setsLost;
      }

      playerIds.forEach((playerId) => {
        const stats = playerStatsMap.get(playerId);
        if (!stats) return;

        stats.matchesPlayed += 1;
        stats.setsWon += setsWon;
        stats.setsLost += setsLost;
        stats.gamesWon += gamesWon;
        stats.gamesLost += gamesLost;

        if (teamWon) stats.wins += 1;
        else stats.losses += 1;

        if (line.match_type === 'singles') {
          if (teamWon) stats.singlesRecord.wins += 1;
          else stats.singlesRecord.losses += 1;
        } else {
          if (teamWon) stats.doublesRecord.wins += 1;
          else stats.doublesRecord.losses += 1;
        }
      });
    });

    setPlayerStats(Array.from(playerStatsMap.values()));
  }, []);

  /**
   * Main data loading function that orchestrates all data fetching
   */
  const loadTeamStatsData = useCallback(async () => {
    if (seasonLoading || !currentSeason) return;

    try {
      setLoading(true);
      setError('');

      if (!authUser) {
        throw new Error('Not authenticated. Please log in to view team statistics.');
      }
      setUser(authUser);

      if (!currentPlayerData) {
        throw new Error('Player profile not found for this user.');
      }

      if (!currentPlayerData.is_captain) {
        throw new Error('Access denied: Captain privileges required to view team statistics.');
      }

      // Get team link
      const teamLink = await api.get('/players/me/team');
      if (!teamLink) {
        throw new Error('You are not currently assigned to a team.');
      }

      const teamId = teamLink.team || teamLink.id;
      const teamData = await api.get(`/teams/${teamId}`);
      setTeam(teamData);

      // Load all data in parallel where possible
      const [rosterData, matches] = await Promise.all([
        loadTeamRoster(teamData.id),
        fetchTeamMatches(teamData.id, currentSeason.id)
      ]);

      const matchIds = matches.map((match) => match.id);

      // Fetch scores and line results in parallel
      const [matchScores, lineResults] = await Promise.all([
        fetchMatchScores(matchIds),
        fetchLineResults(matchIds)
      ]);

      // Process all stats
      loadTeamRecordFromScores(matches, matchScores, teamData.id);
      loadTeamLineStatsFromScores(matchScores, matches, teamData.id);
      loadRecentMatchesFromList(matches, matchScores, teamData.id);
      loadPlayerStatsFromLines(rosterData, matches, lineResults, teamData.id);

    } catch (err) {
      console.error('Error loading team stats data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [
    seasonLoading, currentSeason, authUser, currentPlayerData,
    loadTeamRoster, fetchTeamMatches, fetchMatchScores, fetchLineResults,
    loadTeamRecordFromScores, loadTeamLineStatsFromScores,
    loadRecentMatchesFromList, loadPlayerStatsFromLines
  ]);

  useEffect(() => {
    loadTeamStatsData();
  }, [loadTeamStatsData]);

  const winPercentage = useMemo(() => {
    const total = teamRecord.wins + teamRecord.losses;
    if (total === 0) return '0.0';
    return ((teamRecord.wins / total) * 100).toFixed(1);
  }, [teamRecord.wins, teamRecord.losses]);

  const lineWinPercentage = useMemo(() => {
    const total = teamLineStats.linesWon + teamLineStats.linesLost;
    if (total === 0) return '0.0';
    return ((teamLineStats.linesWon / total) * 100).toFixed(1);
  }, [teamLineStats.linesWon, teamLineStats.linesLost]);

  const gamesWinPercentage = useMemo(() => {
    const total = teamLineStats.gamesWon + teamLineStats.gamesLost;
    if (total === 0) return '0.0';
    return ((teamLineStats.gamesWon / total) * 100).toFixed(1);
  }, [teamLineStats.gamesWon, teamLineStats.gamesLost]);

  return {
    loading: loading || seasonLoading,
    error,
    user,
    team,
    roster,
    teamRecord,
    teamLineStats,
    recentMatches,
    playerStats,
    winPercentage,
    lineWinPercentage,
    gamesWinPercentage,
    refresh: loadTeamStatsData
  };
};
