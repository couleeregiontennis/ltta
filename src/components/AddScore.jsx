import { useState, useEffect } from 'react';
import { supabase } from '../scripts/supabaseClient';
import { useVoiceScoreInput } from '../hooks/useVoiceScoreInput';
import { LoadingSpinner } from './LoadingSpinner';
import { useToast } from '../context/ToastContext';
import '../styles/AddScore.css';

const STANDARD_SET_MIN_WIN = 6;
// League uses a match tiebreak to 7 (win by 2)
const MATCH_TIEBREAK_TARGET = 7;
const MAX_NOTES_LENGTH = 500;
const LINES_PER_MATCH = 4;

const parseInteger = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const isEmptyValue = (value) => value === null || value === undefined || value === '';

const isStandardSetValid = (home, away) => {
  if (!Number.isInteger(home) || !Number.isInteger(away)) return false;
  if (home < 0 || away < 0) return false;
  if (home === away) return false;

  const winner = Math.max(home, away);
  const loser = Math.min(home, away);

  if (winner < STANDARD_SET_MIN_WIN) return false;
  if (winner === STANDARD_SET_MIN_WIN) {
    return loser <= STANDARD_SET_MIN_WIN - 2;
  }

  if (winner === STANDARD_SET_MIN_WIN + 1) {
    return loser === STANDARD_SET_MIN_WIN - 1 || loser === STANDARD_SET_MIN_WIN;
  }

  return false;
};

const isMatchTiebreakValid = (home, away) => {
  if (home === 0 && away === 0) {
    return true; // Not played
  }

  if (!Number.isInteger(home) || !Number.isInteger(away)) return false;
  if (home < 0 || away < 0) return false;
  if (home === away) return false;

  const winner = Math.max(home, away);
  const loser = Math.min(home, away);

  if (winner < MATCH_TIEBREAK_TARGET) return false;

  if (winner === MATCH_TIEBREAK_TARGET) {
    return winner - loser >= 2;
  }

  return winner - loser === 2;
};

const collectScoreSnapshot = (row) => {
  if (!row) return null;
  return {
    match_id: row.match_id,
    line_number: row.line_number,
    match_type: row.match_type,
    home_player_1_id: row.home_player_1_id ?? null,
    home_player_2_id: row.home_player_2_id ?? null,
    away_player_1_id: row.away_player_1_id ?? null,
    away_player_2_id: row.away_player_2_id ?? null,
    home_set_1: row.home_set_1 ?? null,
    away_set_1: row.away_set_1 ?? null,
    home_set_2: row.home_set_2 ?? null,
    away_set_2: row.away_set_2 ?? null,
    home_set_3: row.home_set_3 ?? null,
    away_set_3: row.away_set_3 ?? null,
    home_won: row.home_won ?? null,
    notes: row.notes ?? ''
  };
};

const arePlayersUnique = (players) => {
  const filtered = players.filter(Boolean);
  const uniqueSet = new Set(filtered.map((name) => name.toLowerCase()));
  return uniqueSet.size === filtered.length;
};

const normalizePlayerSelections = (matchType, players) => {
  if (matchType === 'singles') {
    return [players[0] ?? '', ''];
  }
  return players.map((player) => player ?? '');
};

const buildScorePayload = ({
  matchId,
  lineNumber,
  matchType,
  homeSet1,
  homeSet2,
  homeSet3,
  awaySet1,
  awaySet2,
  awaySet3,
  homePlayers,
  awayPlayers,
  notes
}, playerIdMap, userId, winner) => {
  const home_player_1_id = playerIdMap[homePlayers[0]] || null;
  const home_player_2_id = matchType === 'doubles' ? playerIdMap[homePlayers[1]] || null : null;
  const away_player_1_id = playerIdMap[awayPlayers[0]] || null;
  const away_player_2_id = matchType === 'doubles' ? playerIdMap[awayPlayers[1]] || null : null;

  return {
    match_id: matchId,
    line_number: Number(lineNumber),
    match_type: matchType,
    home_player_1_id,
    home_player_2_id,
    away_player_1_id,
    away_player_2_id,
    home_set_1: parseInteger(homeSet1),
    away_set_1: parseInteger(awaySet1),
    home_set_2: parseInteger(homeSet2),
    away_set_2: parseInteger(awaySet2),
    home_set_3: isEmptyValue(homeSet3) ? null : parseInteger(homeSet3),
    away_set_3: isEmptyValue(awaySet3) ? null : parseInteger(awaySet3),
    home_won: winner === 'home',
    submitted_by: userId,
    notes: notes?.trim() || '',
    submitted_at: new Date().toISOString()
  };
};

const isPayloadUnchanged = (existing, payload) => {
  if (!existing) return false;
  return (
    existing.match_type === payload.match_type &&
    (existing.home_player_1_id ?? null) === payload.home_player_1_id &&
    (existing.home_player_2_id ?? null) === payload.home_player_2_id &&
    (existing.away_player_1_id ?? null) === payload.away_player_1_id &&
    (existing.away_player_2_id ?? null) === payload.away_player_2_id &&
    (existing.home_set_1 ?? null) === payload.home_set_1 &&
    (existing.home_set_2 ?? null) === payload.home_set_2 &&
    (existing.home_set_3 ?? null) === payload.home_set_3 &&
    (existing.away_set_1 ?? null) === payload.away_set_1 &&
    (existing.away_set_2 ?? null) === payload.away_set_2 &&
    (existing.away_set_3 ?? null) === payload.away_set_3 &&
    Boolean(existing.home_won) === Boolean(payload.home_won) &&
    (existing.notes ?? '').trim() === (payload.notes ?? '').trim()
  );
};

export const AddScore = () => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [player, setPlayer] = useState(null);
  const [teams, setTeams] = useState([]);
  const [userTeam, setUserTeam] = useState(null);
  const [availableMatches, setAvailableMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [homeTeamRoster, setHomeTeamRoster] = useState([]);
  const [awayTeamRoster, setAwayTeamRoster] = useState([]);
  const [playerIdMap, setPlayerIdMap] = useState({});
  const [existingScores, setExistingScores] = useState([]);
  const [formData, setFormData] = useState({
    matchId: '',
    lineNumber: 1,
    matchType: 'doubles',
    homePlayers: ['', ''],
    awayPlayers: ['', ''],
    homeSet1: '',
    awaySet1: '',
    homeSet2: '',
    awaySet2: '',
    homeSet3: '',
    awaySet3: '',
    notes: '',
    fullRosterPresent: false
  });

  const {
    isListening,
    transcript,
    recognitionError,
    aiProcessing,
    aiSuccess,
    aiError,
    startListening,
    stopListening,
    isSpeechRecognitionSupported
  } = useVoiceScoreInput((parsedData) => {
    const sanitizedLineNumber = parseInteger(parsedData?.lineNumber) || formData.lineNumber;
    const sanitizedMatchType = parsedData?.matchType === 'singles' || parsedData?.matchType === 'doubles'
      ? parsedData.matchType
      : formData.matchType;

    const nextForm = {
      ...formData,
      lineNumber: sanitizedLineNumber,
      matchType: sanitizedMatchType,
      homeSet1: parsedData?.homeSet1 != null ? parseInteger(parsedData.homeSet1) : null,
      awaySet1: parsedData?.awaySet1 != null ? parseInteger(parsedData.awaySet1) : null,
      homeSet2: parsedData?.homeSet2 != null ? parseInteger(parsedData.homeSet2) : null,
      awaySet2: parsedData?.awaySet2 != null ? parseInteger(parsedData.awaySet2) : null,
      homeSet3: parsedData?.homeSet3 != null ? parseInteger(parsedData.homeSet3) : null,
      awaySet3: parsedData?.awaySet3 != null ? parseInteger(parsedData.awaySet3) : null,
      notes: parsedData?.notes?.trim?.() || formData.notes
    };

    const set1Home = parseInteger(nextForm.homeSet1);
    const set1Away = parseInteger(nextForm.awaySet1);
    const set2Home = parseInteger(nextForm.homeSet2);
    const set2Away = parseInteger(nextForm.awaySet2);
    const set3Home = parseInteger(nextForm.homeSet3);
    const set3Away = parseInteger(nextForm.awaySet3);

    const hasThirdSet = !isEmptyValue(nextForm.homeSet3) || !isEmptyValue(nextForm.awaySet3);
    const invalid =
      !isStandardSetValid(set1Home, set1Away) ||
      !isStandardSetValid(set2Home, set2Away) ||
      (hasThirdSet && !isMatchTiebreakValid(set3Home, set3Away));

    if (invalid) {
      setError('AI parsed an invalid score. Please correct the values and try again.');
      return;
    }

    const matchOrLineChanged = sanitizedMatchType !== formData.matchType || sanitizedLineNumber !== formData.lineNumber;
    setFormData((prev) => ({
      ...prev,
      lineNumber: sanitizedLineNumber,
      matchType: sanitizedMatchType,
      homePlayers: matchOrLineChanged ? ['', ''] : prev.homePlayers,
      awayPlayers: matchOrLineChanged ? ['', ''] : prev.awayPlayers,
      homeSet1: nextForm.homeSet1?.toString() || '',
      awaySet1: nextForm.awaySet1?.toString() || '',
      homeSet2: nextForm.homeSet2?.toString() || '',
      awaySet2: nextForm.awaySet2?.toString() || '',
      homeSet3: nextForm.homeSet3?.toString() || '',
      awaySet3: nextForm.awaySet3?.toString() || '',
      notes: nextForm.notes
    }));
    setError('');
    addToast('Transcript parsed successfully by AI!', 'success');
  });

  useEffect(() => {
    const loadInitialData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUser(user);

      const { data: playerData, error: playerError } = await supabase
        .from('player')
        .select('*')
        .eq('id', user.id)
        .single();

      if (playerError || !playerData) return;
      setPlayer(playerData);

      const { data: teamLink, error: teamLinkError } = await supabase
        .from('player_to_team')
        .select('team')
        .eq('player', playerData.id)
        .single();

      if (teamLinkError || !teamLink) return;

      const { data: teamData, error: teamError } = await supabase
        .from('team')
        .select('*')
        .eq('id', teamLink.team)
        .single();

      if (teamError || !teamData) return;
      setUserTeam(teamData);
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (!userTeam) return;

    const loadMatches = async () => {
      try {
        const { data: matches, error } = await supabase
          .from('team_match')
          .select(`
            id, date, time, courts, status,
            home_team:home_team_id (id, name, number, play_night),
            away_team:away_team_id (id, name, number, play_night)
          `)
          .or(`home_team_id.eq.${userTeam.id},away_team_id.eq.${userTeam.id}`)
          .eq('status', 'scheduled')
          .order('date', { ascending: true });

        if (error) throw error;
        
        const flattenedMatches = (matches || []).map(m => ({
          id: m.id,
          date: m.date,
          time: m.time,
          status: m.status,
          courts: m.courts,
          home_team_name: m.home_team?.name,
          home_team_number: m.home_team?.number,
          home_team_night: m.home_team?.play_night,
          away_team_name: m.away_team?.name,
          away_team_number: m.away_team?.number,
          away_team_night: m.away_team?.play_night
        }));

        setAvailableMatches(flattenedMatches);
      } catch (err) {
        console.error('Error loading matches:', err);
      }
    };

    loadMatches();
  }, [userTeam]);

  const getEligiblePlayers = (roster, lineNumber) => {
    if (!roster || roster.length === 0) return [];
    return roster; // 2026 rule: Line 3 players can mix and match. No restrictions.
  };

  const loadExistingScores = async (matchId) => {
    try {
      const { data: scores, error } = await supabase
        .from('line_results')
        .select(`
          *,
          home_player_1:player!home_player_1_id(first_name, last_name),
          home_player_2:player!home_player_2_id(first_name, last_name),
          away_player_1:player!away_player_1_id(first_name, last_name),
          away_player_2:player!away_player_2_id(first_name, last_name)
        `)
        .eq('match_id', matchId)
        .order('line_number');

      if (error) throw error;

      setExistingScores(scores || []);

      // Also load full roster status
      const { data: matchData } = await supabase
        .from('team_match')
        .select('home_full_roster, away_full_roster, home_team_id')
        .eq('id', matchId)
        .single();

      if (matchData && userTeam) {
        const isHome = matchData.home_team_id === userTeam.id;
        setFormData(prev => ({
          ...prev,
          fullRosterPresent: isHome ? matchData.home_full_roster : matchData.away_full_roster
        }));
      }

      const currentLineScore = scores?.find(s => s.line_number === formData.lineNumber);
      if (currentLineScore) {
        populateFormWithExistingScore(currentLineScore);
      }
    } catch (err) {
      console.error('Error loading existing scores:', err);
    }
  };

  const populateFormWithExistingScore = (score) => {
    const homePlayers = [
      score.home_player_1 ? `${score.home_player_1.first_name} ${score.home_player_1.last_name}` : '',
      score.home_player_2 ? `${score.home_player_2.first_name} ${score.home_player_2.last_name}` : ''
    ];

    const awayPlayers = [
      score.away_player_1 ? `${score.away_player_1.first_name} ${score.away_player_1.last_name}` : '',
      score.away_player_2 ? `${score.away_player_2.first_name} ${score.away_player_2.last_name}` : ''
    ];

    setFormData(prev => ({
      ...prev,
      matchType: score.match_type,
      homePlayers,
      awayPlayers,
      homeSet1: score.home_set_1?.toString() || '',
      awaySet1: score.away_set_1?.toString() || '',
      homeSet2: score.home_set_2?.toString() || '',
      awaySet2: score.away_set_2?.toString() || '',
      homeSet3: score.home_set_3?.toString() || '',
      awaySet3: score.away_set_3?.toString() || '',
      notes: score.notes || ''
    }));
  };

  const getDisplayPlayers = (roster, lineNumber) => {
    const eligiblePlayers = getEligiblePlayers(roster, lineNumber);
    return eligiblePlayers.map(p => ({ ...p, name: p.name }));
  };

  const autoSelectPlayers = (homeRoster, awayRoster, lineNumber, matchType) => {
    const existingScore = existingScores.find(s => s.line_number === parseInt(lineNumber));
    if (existingScore) return;

    // No auto-select logic for now, simpler to pick
  };

  const setLineFocus = (lineValue, matchTypeOverride) => {
    const numericLine = typeof lineValue === 'number' ? lineValue : parseInt(lineValue, 10);
    if (!Number.isFinite(numericLine)) return;

    const effectiveMatchType = matchTypeOverride ?? formData.matchType;

    setFormData(prev => ({
      ...prev,
      lineNumber: numericLine
    }));

    setTimeout(() => {
      const existingScore = existingScores.find((score) => score.line_number === numericLine);
      if (existingScore) {
        populateFormWithExistingScore(existingScore);
        return;
      }

      setFormData(prev => ({
        ...prev,
        homePlayers: ['', ''],
        awayPlayers: ['', ''],
        homeSet1: '',
        awaySet1: '',
        homeSet2: '',
        awaySet2: '',
        homeSet3: '',
        awaySet3: '',
        notes: ''
      }));
    }, 0);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === 'lineNumber') {
      setLineFocus(value);
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePlayerChange = (team, position, value) => {
    setFormData(prev => ({
      ...prev,
      [`${team}Players`]: prev[`${team}Players`].map((p, i) =>
        i === position ? value : p
      )
    }));
  };

  const handleScoreChange = (team, set, value) => {
    const scoreValue = value === '' ? '' : value.replace(/[^0-9]/g, '');
    setFormData(prev => ({
      ...prev,
      [`${team}Set${set}`]: scoreValue
    }));
  };

  const generateScoreOptions = () => {
    const options = [];
    for (let i = 0; i <= 7; i++) {
      options.push(<option key={i} value={i}>{i}</option>);
    }
    return options;
  };

  const generateTiebreakOptions = () => {
    const options = [];
    for (let i = 0; i <= 30; i++) {
      options.push(<option key={i} value={i}>{i}</option>);
    }
    return options;
  };

  const calculateMatchWinner = () => {
    const homeSet1 = parseInt(formData.homeSet1) || 0;
    const awaySet1 = parseInt(formData.awaySet1) || 0;
    const homeSet2 = parseInt(formData.homeSet2) || 0;
    const awaySet2 = parseInt(formData.awaySet2) || 0;
    const homeSet3 = parseInt(formData.homeSet3) || 0;
    const awaySet3 = parseInt(formData.awaySet3) || 0;

    let homeSetsWon = 0;
    let awaySetsWon = 0;

    if (homeSet1 > awaySet1 && (homeSet1 >= 6 && (homeSet1 - awaySet1 >= 2 || homeSet1 === 7))) homeSetsWon++;
    else if (awaySet1 > homeSet1 && (awaySet1 >= 6 && (awaySet1 - homeSet1 >= 2 || awaySet1 === 7))) awaySetsWon++;

    if (homeSet2 > awaySet2 && (homeSet2 >= 6 && (homeSet2 - awaySet2 >= 2 || homeSet2 === 7))) homeSetsWon++;
    else if (awaySet2 > homeSet2 && (awaySet2 >= 6 && (awaySet2 - homeSet2 >= 2 || awaySet2 === 7))) awaySetsWon++;

    if (homeSet3 && awaySet3) {
      if (homeSet3 >= MATCH_TIEBREAK_TARGET && homeSet3 - awaySet3 >= 2) homeSetsWon++;
      else if (awaySet3 >= MATCH_TIEBREAK_TARGET && awaySet3 - homeSet3 >= 2) awaySetsWon++;
    }

    if (homeSetsWon > awaySetsWon) return 'home';
    if (awaySetsWon > homeSetsWon) return 'away';
    return null;
  };

  const getPlayerDisplayNames = () => {
    let homeNames, awayNames;
    if (formData.matchType === 'singles') {
      homeNames = formData.homePlayers[0] || '';
      awayNames = formData.awayPlayers[0] || '';
    } else {
      homeNames = formData.homePlayers.filter(p => p).join(' / ');
      awayNames = formData.awayPlayers.filter(p => p).join(' / ');
    }
    return { homeNames, awayNames };
  };

  const loadTeamRoster = async (teamNumber, night) => {
    if (!teamNumber || !night) return [];
    try {
      const { data: team, error: teamError } = await supabase
        .from('team')
        .select('id')
        .eq('number', teamNumber)
        .eq('play_night', night.toLowerCase())
        .single();

      if (teamError || !team) {
        return [];
      }

      const { data: playerLinks, error: linksError } = await supabase
        .from('player_to_team')
        .select(`
          player:player (
            id,
            first_name,
            last_name,
            ranking
          )
        `)
        .eq('team', team.id);

      if (linksError) {
        throw linksError;
      }

      const idMap = {};
      const roster = (playerLinks || [])
        .map(link => link.player)
        .filter(Boolean)
        .sort((a, b) => a.ranking - b.ranking)
        .map(p => {
          const fullName = `${p.first_name} ${p.last_name}`;
          idMap[fullName] = p.id;
          return { name: fullName, position: p.ranking };
        });

      setPlayerIdMap(prev => ({ ...prev, ...idMap }));
      return roster;
    } catch (err) {
      console.error(`Error loading roster:`, err);
      return [];
    }
  };

  const handleMatchSelect = async (matchId) => {
    console.log('AddScore: Selected matchId:', matchId);
    const match = availableMatches.find(m => m.id === matchId);
    if (match) {
      const { data: teamMatchData } = await supabase
        .from('team_match')
        .select('is_disputed, home_full_roster, away_full_roster, home_team_id')
        .eq('id', matchId)
        .single();

      const isDisputed = teamMatchData?.is_disputed || false;
      
      setSelectedMatch({ ...match, is_disputed: isDisputed });
      
      const isHome = teamMatchData?.home_team_id === userTeam.id;
      setFormData(prev => ({
        ...prev,
        matchId: matchId,
        homePlayers: ['', ''],
        awayPlayers: ['', ''],
        fullRosterPresent: isHome ? (teamMatchData?.home_full_roster || false) : (teamMatchData?.away_full_roster || false)
      }));

      const [homeRoster, awayRoster] = await Promise.all([
        loadTeamRoster(match.home_team_number, match.home_team_night),
        loadTeamRoster(match.away_team_number, match.away_team_night)
      ]);

      setHomeTeamRoster(homeRoster);
      setAwayTeamRoster(awayRoster);
      await loadExistingScores(matchId);
    }
  };

  const validateForm = () => {
    if (!formData.matchId) {
      setError('Please select a match');
      return false;
    }

    const normalizedHomePlayers = normalizePlayerSelections(formData.matchType, formData.homePlayers);
    const normalizedAwayPlayers = normalizePlayerSelections(formData.matchType, formData.awayPlayers);

    if (!normalizedHomePlayers[0] || !normalizedAwayPlayers[0]) {
      setError('Select at least one player for each team');
      return false;
    }

    if (!arePlayersUnique([...normalizedHomePlayers, ...normalizedAwayPlayers])) {
      setError('Players cannot appear on both sides of the net');
      return false;
    }

    const set1Home = parseInteger(formData.homeSet1);
    const set1Away = parseInteger(formData.awaySet1);
    const set2Home = parseInteger(formData.homeSet2);
    const set2Away = parseInteger(formData.awaySet2);
    const set3Home = parseInteger(formData.homeSet3);
    const set3Away = parseInteger(formData.awaySet3);

    if (!isStandardSetValid(set1Home, set1Away) || !isStandardSetValid(set2Home, set2Away)) {
      setError('Sets 1 and 2 must be valid tennis scores (win by 2, 6-4/7-5/7-6 etc.)');
      return false;
    }

    if (!isEmptyValue(formData.homeSet3) || !isEmptyValue(formData.awaySet3)) {
      if (!isMatchTiebreakValid(set3Home, set3Away)) {
        setError('Third set must be a valid tiebreak (first to 7, win by 2) or blank');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (!selectedMatch) throw new Error('No match selected');

      const normalizedHomePlayers = normalizePlayerSelections(formData.matchType, formData.homePlayers);
      const normalizedAwayPlayers = normalizePlayerSelections(formData.matchType, formData.awayPlayers);

      const winner = calculateMatchWinner();
      if (!winner) {
        setError('Unable to determine a winner from the provided scores. Check set results.');
        return;
      }

      const payload = buildScorePayload({
        matchId: selectedMatch.id,
        lineNumber: formData.lineNumber,
        matchType: formData.matchType,
        homeSet1: formData.homeSet1,
        homeSet2: formData.homeSet2,
        homeSet3: formData.homeSet3,
        awaySet1: formData.awaySet1,
        awaySet2: formData.awaySet2,
        awaySet3: formData.awaySet3,
        homePlayers: normalizedHomePlayers,
        awayPlayers: normalizedAwayPlayers,
        notes: formData.notes
      }, playerIdMap, user.id, winner);

      const existingScore = existingScores.find(s => s.line_number === Number(formData.lineNumber));

      if (existingScore) {
        const { error: lineError } = await supabase
          .from('line_results')
          .update(payload)
          .eq('id', existingScore.id);
        if (lineError) throw lineError;
      } else {
        const { error: lineError } = await supabase
          .from('line_results')
          .insert([payload]);
        if (lineError) throw lineError;
      }

      // Update participation bonus and resolve dispute
      const isHome = selectedMatch.home_team_number === userTeam.number;
      const updateData = { is_disputed: false };
      if (isHome) updateData.home_full_roster = formData.fullRosterPresent;
      else updateData.away_full_roster = formData.fullRosterPresent;

      await supabase
        .from('team_match')
        .update(updateData)
        .eq('id', selectedMatch.id);

      addToast('Scores submitted successfully!', 'success');
      await loadExistingScores(selectedMatch.id);
    } catch (err) {
      setError('Error submitting scores: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const lineNumbers = Array.from({ length: LINES_PER_MATCH }, (_, index) => index + 1);
  const activeLineNumber = parseInt(formData.lineNumber, 10) || 1;
  const hasMatchSelected = Boolean(selectedMatch);
  const linesRecorded = hasMatchSelected ? existingScores.length : 0;
  const matchProgress = hasMatchSelected
    ? Math.min(100, Math.round((linesRecorded / LINES_PER_MATCH) * 100))
    : 0;

  return (
    <div className="add-score-page">
      <div className="add-score-header">
        <h1>Submit Match Scores</h1>
        <p>Record results for 2026 Season (4 Lines of Doubles).</p>
      </div>

      {userTeam && (
        <div className="team-banner card card--interactive card--overlay">
          <div className="team-icon">🛡️</div>
          <div className="team-banner-content">
            <span className="team-label">Submitting scores for</span>
            <span className="team-name">{userTeam.name}</span>
          </div>
        </div>
      )}

      <div className="score-overview">
        <div className="overview-card card card--interactive card--overlay">
          <div className="card-label">Match Progress</div>
          <div className="card-value">{hasMatchSelected ? `${Math.round(matchProgress)}%` : 'Select match'}</div>
          <div className="card-subtitle">{linesRecorded} of 4 lines recorded</div>
        </div>
        <div className="overview-card card card--interactive card--overlay">
          <div className="card-label">Current Focus</div>
          <div className="card-value">Line {activeLineNumber}</div>
        </div>
      </div>

      {selectedMatch?.is_disputed && (
        <div className="dispute-banner" style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--error)', borderRadius: '4px' }}>
          <h3 style={{ color: 'var(--error)', margin: 0 }}>⚠️ Score Disputed</h3>
          <p style={{ margin: '0.5rem 0 0', color: 'var(--text-primary)' }}>A player has flagged this match score for review. Submitting new scores will resolve this dispute.</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="score-form" noValidate>
        <div className="score-section card card--interactive">
          <h2>Select Match</h2>
          <select
            name="matchId"
            value={formData.matchId}
            onChange={(e) => handleMatchSelect(e.target.value)}
            required
          >
            <option value="">Select a match...</option>
            {availableMatches.map(match => (
              <option key={match.id} value={match.id}>
                {match.home_team_name} vs {match.away_team_name} - {match.date}
              </option>
            ))}
          </select>
        </div>

        <div className="score-section card card--interactive">
          <h2>Line & Roster Status</h2>
          <div className="participation-bonus">
             <label className="checkbox-label">
                <input 
                  type="checkbox" 
                  name="fullRosterPresent"
                  checked={formData.fullRosterPresent}
                  onChange={handleInputChange}
                />
                <span className="checkmark"></span>
                <strong>Full Roster (8 players) Present</strong>
                <p className="helper-text">Checking this awards your team 1 bonus participation point in the standings.</p>
             </label>
          </div>

          <div className="line-switcher-buttons" style={{ marginTop: '1rem' }}>
            {lineNumbers.map((line) => (
              <button
                key={line}
                type="button"
                className={`line-switcher-button${activeLineNumber === line ? ' is-active' : ''}`}
                onClick={() => setLineFocus(line)}
              >
                Line {line}
              </button>
            ))}
          </div>
        </div>

        <div className="score-section card card--interactive">
          <h2>Line {activeLineNumber} Scores</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Match Type</label>
              <select name="matchType" value={formData.matchType} onChange={handleInputChange}>
                <option value="doubles">Doubles</option>
                <option value="singles">Singles</option>
              </select>
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label>Home Players</label>
              <select
                value={formData.homePlayers[0]}
                onChange={(e) => handlePlayerChange('home', 0, e.target.value)}
              >
                <option value="">Player 1</option>
                {homeTeamRoster.map((p, i) => <option key={i} value={p.name}>{p.name}</option>)}
              </select>
              {formData.matchType === 'doubles' && (
                <select
                  value={formData.homePlayers[1]}
                  onChange={(e) => handlePlayerChange('home', 1, e.target.value)}
                >
                  <option value="">Player 2</option>
                  {homeTeamRoster.map((p, i) => <option key={i} value={p.name}>{p.name}</option>)}
                </select>
              )}
            </div>
            <div className="form-group">
              <label>Away Players</label>
              <select
                value={formData.awayPlayers[0]}
                onChange={(e) => handlePlayerChange('away', 0, e.target.value)}
              >
                <option value="">Player 1</option>
                {awayTeamRoster.map((p, i) => <option key={i} value={p.name}>{p.name}</option>)}
              </select>
              {formData.matchType === 'doubles' && (
                <select
                  value={formData.awayPlayers[1]}
                  onChange={(e) => handlePlayerChange('away', 1, e.target.value)}
                >
                  <option value="">Player 2</option>
                  {awayTeamRoster.map((p, i) => <option key={i} value={p.name}>{p.name}</option>)}
                </select>
              )}
            </div>
          </div>

          <div className="score-row">
            <div className="score-group">
              <label>Set 1</label>
              <div className="score-inputs">
                <select value={formData.homeSet1} onChange={(e) => handleScoreChange('home', 1, e.target.value)} required>
                  <option value="">H</option>{generateScoreOptions()}
                </select>
                <span>-</span>
                <select value={formData.awaySet1} onChange={(e) => handleScoreChange('away', 1, e.target.value)} required>
                  <option value="">A</option>{generateScoreOptions()}
                </select>
              </div>
            </div>
            <div className="score-group">
              <label>Set 2</label>
              <div className="score-inputs">
                <select value={formData.homeSet2} onChange={(e) => handleScoreChange('home', 2, e.target.value)} required>
                  <option value="">H</option>{generateScoreOptions()}
                </select>
                <span>-</span>
                <select value={formData.awaySet2} onChange={(e) => handleScoreChange('away', 2, e.target.value)} required>
                  <option value="">A</option>{generateScoreOptions()}
                </select>
              </div>
            </div>
            <div className="score-group">
              <label>Tiebreak</label>
              <div className="score-inputs">
                <select value={formData.homeSet3} onChange={(e) => handleScoreChange('home', 3, e.target.value)}>
                  <option value="">H</option>{generateTiebreakOptions()}
                </select>
                <span>-</span>
                <select value={formData.awaySet3} onChange={(e) => handleScoreChange('away', 3, e.target.value)}>
                  <option value="">A</option>{generateTiebreakOptions()}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="score-section card card--interactive">
          <h2>Notes (Optional)</h2>
          <div className="form-group">
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Add any notes about this line (e.g. sub names, tiebreak score, disputes)..."
              maxLength={MAX_NOTES_LENGTH}
              aria-describedby="notes-counter"
            ></textarea>
            <div id="notes-counter" className="character-counter">
              {formData.notes.length} / {MAX_NOTES_LENGTH} characters
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Submitting...' : 'Save Line Results'}
        </button>
      </form>
    </div>
  );
};
