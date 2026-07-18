import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../scripts/supabaseClient';
import { useAuth } from '../context/AuthProvider';
import { LoadingSpinner } from './LoadingSpinner';
import '../styles/SubBoard.css';

export const SubBoard = () => {
    const { user, userRole, currentPlayerData } = useAuth();
    const [activeTab, setActiveTab] = useState('available'); // 'available' or 'my_requests'
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form State for Captains
    const [showForm, setShowForm] = useState(false);
    const [teams, setTeams] = useState([]);
    const [locations, setLocations] = useState([]);
    // Upcoming matches for the captain's teams (quick-select suggestions)
    const [upcomingMatches, setUpcomingMatches] = useState([]);
    const [formData, setFormData] = useState({
        team_id: '',
        match_date: '',
        match_time: '',
        location_id: '',
        required_ranking: 3,
        notes: ''
    });

    const defaultRanking = currentPlayerData?.ranking || 3;

    useEffect(() => {
        if (user) {
            fetchRequests();
            if (userRole?.isCaptain) {
                fetchFormData();
            }
        }
    }, [user, activeTab, currentPlayerData?.id, userRole?.isCaptain]);

    useEffect(() => {
        // Auto-set default ranking when currentPlayerData loads
        if (currentPlayerData?.ranking) {
            setFormData(prev => ({ ...prev, required_ranking: currentPlayerData.ranking }));
        }
    }, [currentPlayerData?.ranking]);

    const fetchRequests = async () => {
        setLoading(true);
        let query = supabase
            .from('sub_request')
            .select(`
        *,
        team:team_id(name),
        location:location_id(name)
      `)
            .order('match_date', { ascending: true });

        if (activeTab === 'my_requests') {
            query = query.eq('captain_user_id', user.id);
        } else {
            query = query.eq('status', 'open');
        }

        const { data, error: fetchError } = await query;
        if (fetchError) {
            setError('Failed to load sub requests.');
        } else {
            setRequests(data || []);
        }
        setLoading(false);
    };

    const fetchFormData = async () => {
        if (!currentPlayerData?.id) return;

        // 1. Fetch only the teams the captain belongs to (active status)
        const { data: teamLinks, error: teamLinksError } = await supabase
            .from('player_to_team')
            .select('team')
            .eq('player', currentPlayerData.id)
            .eq('status', 'active');

        if (!teamLinksError && teamLinks && teamLinks.length > 0) {
            const teamIds = teamLinks.map(link => link.team);
            const { data: teamsData } = await supabase
                .from('team')
                .select('*')
                .in('id', teamIds)
                .order('name');
            if (teamsData) {
                setTeams(teamsData);
                // Auto-select if captain has exactly one team
                if (teamsData.length === 1) {
                    setFormData(prev => ({ ...prev, team_id: teamsData[0].id }));
                }
            }

            // 2. Fetch upcoming matches for these teams (quick-select suggestions)
            const today = new Date().toISOString().split('T')[0];
            const { data: matchesData } = await supabase
                .from('team_match')
                .select(`
                    id, date, time, courts, status,
                    location_id,
                    home_team:home_team_id(id, name),
                    away_team:away_team_id(id, name)
                `)
                .or(`home_team_id.in.(${teamIds.join(',')}),away_team_id.in.(${teamIds.join(',')})`)
                .gte('date', today)
                .eq('status', 'scheduled')
                .order('date', { ascending: true })
                .limit(10);

            if (matchesData) {
                setUpcomingMatches(matchesData);
            }
        }

        // 3. Fetch locations
        const { data: locData } = await supabase.from('location').select('*').order('name');
        if (locData) setLocations(locData);
    };

    const parseTimeToInput = (timeStr) => {
        if (!timeStr) return '';
        // Already 24-hour HH:MM or H:MM
        if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
            return timeStr.padStart(5, '0');
        }
        // Parse 12-hour strings like "6:00 PM" or "7:30AM"
        const match = String(timeStr).match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
        if (!match) return '';
        let hours = parseInt(match[1], 10);
        const minutes = match[2];
        const period = match[3].toUpperCase();
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        return `${String(hours).padStart(2, '0')}:${minutes}`;
    };

    const handleSelectUpcomingMatch = (match) => {
        setFormData(prev => ({
            ...prev,
            match_date: match.date,
            match_time: parseTimeToInput(match.time) || '',
            location_id: match.location_id || prev.location_id
        }));
    };

    const handleCreateRequest = async (e) => {
        e.preventDefault();
        setLoading(true);
        const { error: insertError } = await supabase.from('sub_request').insert([{
            captain_user_id: user.id,
            team_id: formData.team_id,
            match_date: formData.match_date,
            match_time: formData.match_time,
            location_id: formData.location_id || null,
            required_ranking: parseInt(formData.required_ranking),
            notes: formData.notes
        }]);

        if (insertError) {
            setError('Failed to create sub request. Make sure you are a captain.');
        } else {
            setShowForm(false);
            setFormData({ team_id: teams.length === 1 ? teams[0].id : '', match_date: '', match_time: '', location_id: '', required_ranking: defaultRanking, notes: '' });
            setUpcomingMatches([]);
            fetchRequests();
        }
        setLoading(false);
    };

    const handleAcceptRequest = async (requestId) => {
        setLoading(true);
        const { error: updateError } = await supabase
            .from('sub_request')
            .update({ status: 'filled', sub_user_id: user.id })
            .eq('id', requestId)
            .eq('status', 'open');

        if (updateError) {
            setError('Failed to accept request. It may have already been filled.');
        } else {
            fetchRequests();
        }
        setLoading(false);
    };

    const handleCancelRequest = async (requestId) => {
        setLoading(true);
        const { error: deleteError } = await supabase
            .from('sub_request')
            .delete()
            .eq('id', requestId);

        if (deleteError) {
            setError('Failed to cancel request.');
        } else {
            fetchRequests();
        }
        setLoading(false);
    };

    const handleShowForm = () => {
        setFormData(prev => ({
            ...prev,
            team_id: teams.length === 1 ? teams[0].id : '',
            required_ranking: defaultRanking
        }));
        setShowForm(true);
    };

    // Determine if a request matches the current player's profile (team or ranking)
    const getRequestMatchInfo = useMemo(() => (req) => {
        if (!currentPlayerData) return { matchesTeam: false, matchesRanking: false };
        const playerRanking = currentPlayerData.ranking || 3;
        return {
            matchesTeam: teams.some(t => t.id === req.team_id),
            matchesRanking: playerRanking >= req.required_ranking
        };
    }, [currentPlayerData, teams]);

    if (!user) {
        return <div className="sub-board-container"><p>Please log in to view the Sub Board.</p></div>;
    }

    return (
        <div className="sub-board-page">
            <div className="sub-board-container">
                <header className="sub-board-header">
                    <h1>Sub Board</h1>
                    <p>Find a sub for your team, or volunteer to play for a team in need.</p>
                </header>

                {/* Player Profile Card */}
                {currentPlayerData && (
                    <div className="player-profile-card card" data-testid="player-profile-card">
                        <div className="player-profile-card-content">
                            <span className="player-name">
                                {currentPlayerData.first_name} {currentPlayerData.last_name}
                            </span>
                            <span className="player-ranking-badge" data-testid="player-ranking">
                                Rating: {currentPlayerData.ranking || 3}.0
                            </span>
                            {teams.length > 0 && (
                                <span className="player-teams" data-testid="player-teams">
                                    Team{teams.length > 1 ? 's' : ''}: {teams.map(t => t.name).join(', ')}
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {userRole?.isCaptain && (
                    <div className="sub-board-tabs">
                        <button
                            className={`tab-button ${activeTab === 'available' ? 'active' : ''}`}
                            onClick={() => setActiveTab('available')}
                        >
                            Available Requests
                        </button>
                        <button
                            className={`tab-button ${activeTab === 'my_requests' ? 'active' : ''}`}
                            onClick={() => setActiveTab('my_requests')}
                        >
                            My Requests
                        </button>
                    </div>
                )}

                {error && <div className="error-message">{error}</div>}

                {activeTab === 'my_requests' && (
                    <div className="captain-actions">
                        {!showForm ? (
                            <button className="primary-button" onClick={handleShowForm}>+ Create New Sub Request</button>
                        ) : (
                            <form className="sub-request-form card" onSubmit={handleCreateRequest} data-testid="sub-request-form">
                                <h3>Create Sub Request</h3>

                                {/* Upcoming Match Quick-Select */}
                                {upcomingMatches.length > 0 && (
                                    <div className="match-suggestions" data-testid="match-suggestions">
                                        <label>Quick-Select Upcoming Match</label>
                                        <div className="match-suggestions-list">
                                            {upcomingMatches.map(match => {
                                                const opponent = match.home_team?.id && teams.find(t => t.id === match.home_team.id)
                                                    ? match.away_team
                                                    : match.home_team;
                                                return (
                                                    <button
                                                        key={match.id}
                                                        type="button"
                                                        className="match-suggestion-btn"
                                                        data-testid="match-suggestion-btn"
                                                        onClick={() => handleSelectUpcomingMatch(match)}
                                                    >
                                                        <span className="match-suggestion-date">
                                                            {new Date(match.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </span>
                                                        <span className="match-suggestion-time">{match.time}</span>
                                                        <span className="match-suggestion-vs">vs {opponent?.name || 'TBD'}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="form-group">
                                    <label>Team</label>
                                    <select required value={formData.team_id} onChange={e => setFormData({ ...formData, team_id: e.target.value })} data-testid="team-select">
                                        <option value="">Select Team</option>
                                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Date</label>
                                        <input type="date" required value={formData.match_date} onChange={e => setFormData({ ...formData, match_date: e.target.value })} data-testid="match-date-input" />
                                    </div>
                                    <div className="form-group">
                                        <label>Time</label>
                                        <input type="time" required value={formData.match_time} onChange={e => setFormData({ ...formData, match_time: e.target.value })} data-testid="match-time-input" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Location</label>
                                        <select value={formData.location_id} onChange={e => setFormData({ ...formData, location_id: e.target.value })} data-testid="location-select">
                                            <option value="">Select Location</option>
                                            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Required Skill Rating</label>
                                        <select value={formData.required_ranking} onChange={e => setFormData({ ...formData, required_ranking: e.target.value })} data-testid="ranking-select">
                                            {[1, 2, 3, 4, 5].map(r => <option key={r} value={r}>{r}.0</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Notes (Optional)</label>
                                    <textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="e.g. Need a strong baseline player." />
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="primary-button">Submit Request</button>
                                    <button type="button" className="secondary-button" onClick={() => { setShowForm(false); setUpcomingMatches([]); }}>Cancel</button>
                                </div>
                            </form>
                        )}
                    </div>
                )}

                {loading && !requests.length ? (
                    <LoadingSpinner />
                ) : requests.length === 0 ? (
                    <div className="empty-state card">
                        <p>{activeTab === 'available' ? 'No open sub requests at this time.' : 'You have not created any sub requests.'}</p>
                    </div>
                ) : (
                    <div className="requests-grid">
                        {requests.map(req => {
                            const matchInfo = getRequestMatchInfo(req);
                            const isHighlighted = activeTab === 'available' && (matchInfo.matchesTeam || matchInfo.matchesRanking);
                            return (
                                <div key={req.id} className={`request-card card ${req.status}${isHighlighted ? ' highlighted' : ''}`} data-testid="request-card">
                                    <div className="request-card-header">
                                        <span className="team-name">{req.team?.name || 'Unknown Team'}</span>
                                        <span className={`status-badge ${req.status}`}>{req.status.toUpperCase()}</span>
                                    </div>
                                    <div className="request-card-body">
                                        <p><strong>Date:</strong> {new Date(req.match_date).toLocaleDateString()} at {req.match_time}</p>
                                        <p><strong>Location:</strong> {req.location?.name || 'TBD'}</p>
                                        <p><strong>Required Skill:</strong> {req.required_ranking}.0+</p>
                                        {req.notes && <p className="request-notes">"{req.notes}"</p>}
                                        {isHighlighted && (
                                            <div className="match-indicator" data-testid="match-indicator">
                                                {matchInfo.matchesTeam && <span className="match-tag team-match">Your Team</span>}
                                                {matchInfo.matchesRanking && <span className="match-tag ranking-match">Matches Your Rating</span>}
                                            </div>
                                        )}
                                    </div>
                                    <div className="request-card-footer">
                                        {activeTab === 'available' && req.captain_user_id !== user.id && req.status === 'open' && (
                                            <button className="primary-button accept-btn" onClick={() => handleAcceptRequest(req.id)}>
                                                Accept Spot
                                            </button>
                                        )}
                                        {activeTab === 'my_requests' && (
                                            <button className="danger-button" onClick={() => handleCancelRequest(req.id)}>
                                                Delete Request
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
