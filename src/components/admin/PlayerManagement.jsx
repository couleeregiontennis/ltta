import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../scripts/supabaseClient';
import { useAuth } from '../../context/AuthProvider';
import '../../styles/PlayerManagement.css';

const getDefaultAvailability = () => ({
  monday: false,
  tuesday: false,
  wednesday: false,
  thursday: false,
  friday: false,
  saturday: false,
  sunday: false
});

export const PlayerManagement = () => {
  const { user, userRole, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (user && userRole.isAdmin) {
      setIsAdmin(true);
      fetchPlayers();
      fetchTeams();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [authLoading, user, userRole]);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('team')
        .select('id, name, number, play_night')
        .order('name', { ascending: true });
      if (error) throw error;
      setTeams(data || []);
    } catch (err) {
      console.error('Error fetching teams:', err);
    }
  };

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('player')
        .select('*, player_to_team(id, team, status)')
        .order('last_name', { ascending: true });

      if (error) throw error;
      setPlayers(data || []);
    } catch (err) {
      console.error('Error fetching players:', err);
      setError('Failed to load players.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (player) => {
    const availability = typeof player.day_availability === 'object' && player.day_availability
      ? { ...getDefaultAvailability(), ...player.day_availability }
      : getDefaultAvailability();

    const activeTeamLink = player.player_to_team?.find(pt => pt.status === 'active');
    
    const playerToEdit = {
      ...player,
      active_team: activeTeamLink?.team || '',
      day_availability: availability
    };

    setSelectedPlayer(playerToEdit);
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleInputChange = (field, value) => {
    if (field.startsWith('day_availability.')) {
      const day = field.split('.')[1];
      setSelectedPlayer(prev => ({
        ...prev,
        day_availability: {
          ...prev.day_availability,
          [day]: value
        }
      }));
    } else {
      setSelectedPlayer(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const { id, player_to_team, active_team, ...updates } = selectedPlayer;

      const dataToUpdate = {
        first_name: updates.first_name,
        last_name: updates.last_name,
        email: updates.email,
        phone: updates.phone,
        emergency_contact: updates.emergency_contact,
        emergency_phone: updates.emergency_phone,
        ranking: Number(updates.ranking),
        is_captain: Boolean(updates.is_captain),
        is_active: Boolean(updates.is_active),
        day_availability: updates.day_availability,
        notes: updates.notes
      };

      const { error: playerUpdateError } = await supabase
        .from('player')
        .update(dataToUpdate)
        .eq('id', id);

      if (playerUpdateError) throw playerUpdateError;

      const currentActiveTeam = players.find(p => p.id === id)?.player_to_team?.find(pt => pt.status === 'active')?.team;
      
      if (active_team !== currentActiveTeam) {
        if (currentActiveTeam) {
          await supabase.from('player_to_team').delete().eq('player', id).eq('team', currentActiveTeam);
        }
        if (active_team) {
          await supabase.from('player_to_team').insert({ player: id, team: active_team, status: 'active' });
        }
      }

      await fetchPlayers();
      setSuccess('Player updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setIsEditing(false);
      setSelectedPlayer(null);

    } catch (err) {
      console.error('Error updating player:', err);
      setError('Failed to update player: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const filteredPlayers = players.filter(player => {
    const search = searchTerm.toLowerCase();
    const fullName = `${player.first_name || ''} ${player.last_name || ''}`.toLowerCase();
    const email = (player.email || '').toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  if (loading || authLoading) {
    return <div className="player-management loading">Loading player management...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="player-management no-access">
        <h2>Access Denied</h2>
        <p>You do not have permission to access player management.</p>
        <Link to="/">← Return to Home</Link>
      </div>
    );
  }

  return (
    <div className="player-management">
      <div className="header">
        <h1>Player Management</h1>
        <p className="description">Manage player profiles, permissions, and availability.</p>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="controls">
        <input
          id="search-players"
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input form-control"
          style={{ marginBottom: '1rem', maxWidth: '300px' }}
        />
      </div>

      <div className="player-table-container">
        <table className="player-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Team</th>
              <th>Ranking</th>
              <th>Captain</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map(player => {
              const activeTeamLink = player.player_to_team?.find(pt => pt.status === 'active');
              const teamName = activeTeamLink ? teams.find(t => t.id === activeTeamLink.team)?.name || 'Loading...' : 'None';
              
              return (
                <tr key={player.id}>
                  <td>{player.last_name}, {player.first_name}</td>
                  <td>{player.email}</td>
                  <td>{teamName}</td>
                  <td>{player.ranking}</td>
                  <td>{player.is_captain ? '✅' : '❌'}</td>
                  <td>{player.is_active ? '✅' : '❌'}</td>
                  <td>
                    <button className="edit-btn" onClick={() => handleEditClick(player)} title="Edit Player">✏️</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {isEditing && selectedPlayer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Player: {selectedPlayer.first_name} {selectedPlayer.last_name}</h2>
              <button className="close-btn" onClick={() => setIsEditing(false)}>×</button>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="edit-first-name">First Name</label>
                <input id="edit-first-name" type="text" value={selectedPlayer.first_name || ''} onChange={e => handleInputChange('first_name', e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="edit-last-name">Last Name</label>
                <input id="edit-last-name" type="text" value={selectedPlayer.last_name || ''} onChange={e => handleInputChange('last_name', e.target.value)} />
              </div>
              <div className="form-group full-width">
                <label htmlFor="edit-email">Email</label>
                <input id="edit-email" type="email" value={selectedPlayer.email || ''} onChange={e => handleInputChange('email', e.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="edit-ranking">Ranking</label>
                <select id="edit-ranking" value={selectedPlayer.ranking} onChange={e => handleInputChange('ranking', e.target.value)}>
                  {[1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="edit-team">Team Assignment</label>
                <select id="edit-team" value={selectedPlayer.active_team} onChange={e => handleInputChange('active_team', e.target.value)}>
                  <option value="">None (Free Agent)</option>
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name} ({t.play_night})</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
