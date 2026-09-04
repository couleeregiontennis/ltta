import React, { useState, useEffect } from 'react';
import api from '../scripts/apiClient';
import { useAuth } from '../context/AuthProvider';
import { LoadingSpinner } from './LoadingSpinner';
import '../styles/SubBoard.css';

export const SubBoard = () => {
    const { user, userRole } = useAuth();
    const [activeTab, setActiveTab] = useState('available'); // 'available' or 'my_requests'
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form State for Captains
    const [showForm, setShowForm] = useState(false);
    const [teams, setTeams] = useState([]);
    const [locations, setLocations] = useState([]);
    const [formData, setFormData] = useState({
        team_id: '',
        match_date: '',
        match_time: '',
        location_id: '',
        required_ranking: 3,
        notes: ''
    });

    useEffect(() => {
        if (user) {
            fetchRequests();
            if (userRole?.isCaptain) {
                fetchFormData();
            }
        }
    }, [user, activeTab]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const data = await api.get('/sub-requests' + (activeTab === 'my_requests' ? '?captainId=' + user.id : ''));
            setRequests(data || []);
        } catch(error) {
            console.error('Error fetching sub requests:', error);
            setError('Failed to load substitute requests');
        }
        setLoading(false);
    };

    const fetchFormData = async () => {
        // Fetch Teams the captain belongs to (assuming we can just fetch all teams for now if admin, or user's teams)
        // For simplicity, fetch all teams
        const teamsData = await api.get('/teams');
        if (teamsData) setTeams(teamsData);

        const locData = await api.get('/locations');
        if (locData) setLocations(locData);
    };

    const handleCreateRequest = async (e) => {
        e.preventDefault();
        setLoading(true);
        await api.post('/sub-requests', {
            captain_user_id: user.id,
            team_id: formData.team_id,
            match_date: formData.match_date,
            match_time: formData.match_time,
            location_id: formData.location_id || null,
            required_ranking: parseInt(formData.required_ranking),
            notes: formData.notes
        });
        const insertError = null;

        if (insertError) {
            setError('Failed to create sub request. Make sure you are a captain.');
        } else {
            setShowForm(false);
            setFormData({ team_id: '', match_date: '', match_time: '', location_id: '', required_ranking: 3, notes: '' });
            fetchRequests();
        }
        setLoading(false);
    };

    const handleAcceptRequest = async (requestId) => {
        setLoading(true);
        try {
            await api.patch('/sub-requests/' + requestId + '/claim');
            fetchRequests();
        } catch (updateError) {
            setError('Failed to accept request. It may have already been filled.');
        }
        setLoading(false);
    };

    const handleCancelRequest = async (requestId) => {
        setLoading(true);
        try {
            await api.patch('/sub-requests/' + requestId + '/cancel');
            fetchRequests();
        } catch (deleteError) {
            setError('Failed to cancel request.');
        }
        setLoading(false);
    };

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
                            <button className="primary-button" onClick={() => setShowForm(true)}>+ Create New Sub Request</button>
                        ) : (
                            <form className="sub-request-form card" onSubmit={handleCreateRequest}>
                                <h3>Create Sub Request</h3>
                                <div className="form-group">
                                    <label>Team</label>
                                    <select required value={formData.team_id} onChange={e => setFormData({ ...formData, team_id: e.target.value })}>
                                        <option value="">Select Team</option>
                                        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Date</label>
                                        <input type="date" required value={formData.match_date} onChange={e => setFormData({ ...formData, match_date: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label>Time</label>
                                        <input type="time" required value={formData.match_time} onChange={e => setFormData({ ...formData, match_time: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Location</label>
                                        <select value={formData.location_id} onChange={e => setFormData({ ...formData, location_id: e.target.value })}>
                                            <option value="">Select Location</option>
                                            {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Required Skill Rating</label>
                                        <select value={formData.required_ranking} onChange={e => setFormData({ ...formData, required_ranking: e.target.value })}>
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
                                    <button type="button" className="secondary-button" onClick={() => setShowForm(false)}>Cancel</button>
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
                        {requests.map(req => (
                            <div key={req.id} className={`request-card card ${req.status}`}>
                                <div className="request-card-header">
                                    <span className="team-name">{req.team?.name || 'Unknown Team'}</span>
                                    <span className={`status-badge ${req.status}`}>{req.status.toUpperCase()}</span>
                                </div>
                                <div className="request-card-body">
                                    <p><strong>Date:</strong> {new Date(req.match_date).toLocaleDateString()} at {req.match_time}</p>
                                    <p><strong>Location:</strong> {req.location?.name || 'TBD'}</p>
                                    <p><strong>Required Skill:</strong> {req.required_ranking}.0+</p>
                                    {req.notes && <p className="request-notes">"{req.notes}"</p>}
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
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
