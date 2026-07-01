import React, { useState, useEffect } from 'react';
import { supabase } from '../../scripts/supabaseClient';
import '../../styles/TeamManagement.css';
import { useToast } from '../../context/ToastContext';

export const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [roster, setRoster] = useState([]);
  const [unassignedPlayers, setUnassignedPlayers] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [editTeamName, setEditTeamName] = useState('');
  const [editTeamNight, setEditTeamNight] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    fetchTeams();
    fetchUnassignedPlayers();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchRoster(selectedTeam.id);
    } else {
      setRoster([]);
    }
  }, [selectedTeam]);

  const fetchTeams = async () => {
    setLoadingTeams(true);
    const { data, error } = await supabase.from('team').select('*').order('number');
    if (error) {
      addToast('Error fetching teams: ' + error.message, 'error');
    } else {
      setTeams(data || []);
    }
    setLoadingTeams(false);
  };

  const fetchUnassignedPlayers = async () => {
    const { data: allPlayers, error: allErr } = await supabase.from('player').select('id, first_name, last_name, is_active').eq('is_active', true);
    const { data: pttData, error: pttErr } = await supabase.from('player_to_team').select('player');

    if (allErr || pttErr) {
      addToast('Error fetching players', 'error');
      return;
    }

    const assignedIds = new Set(pttData.map(r => r.player));
    const unassigned = (allPlayers || []).filter(p => !assignedIds.has(p.id));
    setUnassignedPlayers(unassigned || []);
  };

  const fetchRoster = async (teamId) => {
    setLoadingRoster(true);
    const { data, error } = await supabase
      .from('player_to_team')
      .select(`
        id,
        team,
        player,
        player_table:player( id, first_name, last_name, is_captain )
      `)
      .eq('team', teamId);

    if (error) {
      addToast('Error fetching roster: ' + error.message, 'error');
      setRoster([]);
    } else {
      setRoster(data || []);
    }
    setLoadingRoster(false);
  };

  const handleAddPlayer = async (playerId) => {
    if (!selectedTeam) return;

    const { error } = await supabase
      .from('player_to_team')
      .insert({ player: playerId, team: selectedTeam.id });

    if (error) {
      addToast('Error adding player: ' + error.message, 'error');
    } else {
      addToast('Player added successfully', 'success');
      fetchRoster(selectedTeam.id);
      fetchUnassignedPlayers();
    }
  };

  const handleRemovePlayer = async (pttId, playerId) => {
    const { error } = await supabase
      .from('player_to_team')
      .delete()
      .eq('id', pttId);

    if (error) {
      addToast('Error removing player: ' + error.message, 'error');
    } else {
      addToast('Player removed successfully', 'success');
      await supabase.from('player').update({ is_captain: false }).eq('id', playerId);
      fetchRoster(selectedTeam.id);
      fetchUnassignedPlayers();
    }
  };

  const handleToggleCaptain = async (playerId, currentCaptainStatus) => {
    const newStatus = !currentCaptainStatus;

    const { error: playerErr } = await supabase
      .from('player')
      .update({ is_captain: newStatus })
      .eq('id', playerId);

    if (playerErr) {
      addToast('Error updating captain status: ' + playerErr.message, 'error');
      return;
    }

    addToast('Captain status updated', 'success');
    fetchRoster(selectedTeam.id);
  };

  const handleUpdateTeamDetails = async (teamId) => {
    const { error } = await supabase
      .from('team')
      .update({ name: editTeamName, play_night: editTeamNight })
      .eq('id', teamId);

    if (error) {
      addToast('Error updating team: ' + error.message, 'error');
    } else {
      addToast('Team updated successfully', 'success');
      setEditingTeam(null);
      fetchTeams();
      if(selectedTeam && selectedTeam.id === teamId) {
          setSelectedTeam({...selectedTeam, name: editTeamName, play_night: editTeamNight});
      }
    }
  };

  const startEditingTeam = (team) => {
    setEditingTeam(team.id);
    setEditTeamName(team.name || '');
    setEditTeamNight(team.play_night || 'Tuesday');
  };

  return (
    <div className="team-management-container">
      <h2>Team Management</h2>
      <div className="team-management-layout">
        <div className="left-column">
          <h3>Teams</h3>
          {loadingTeams ? (
            <p>Loading teams...</p>
          ) : (
            <ul className="team-list">
              {teams.map(team => (
                <li key={team.id} className={selectedTeam?.id === team.id ? 'selected' : ''}>
                  {editingTeam === team.id ? (
                      <div className="edit-team-form">
                          <input
                              type="text"
                              className="edit-team-name"
                              value={editTeamName}
                              onChange={e => setEditTeamName(e.target.value)}
                              placeholder="Team Name"
                          />
                          <select className="edit-team-night" value={editTeamNight} onChange={e => setEditTeamNight(e.target.value)}>
                              <option value="Tuesday">Tuesday</option>
                              <option value="Wednesday">Wednesday</option>
                          </select>
                          <button onClick={() => handleUpdateTeamDetails(team.id)}>Save</button>
                          <button onClick={() => setEditingTeam(null)}>Cancel</button>
                      </div>
                  ) : (
                      <>
                        <div className="team-info">
                            <span className="team-name">{team.name || `Team ${team.number}`}</span>
                            <span className="team-night">{team.play_night}</span>
                        </div>
                        <div className="team-actions">
                            <button onClick={() => setSelectedTeam(team)}>Select</button>
                            <button onClick={() => startEditingTeam(team)}>Edit</button>
                        </div>
                      </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="right-column">
          {selectedTeam ? (
            <>
              <h3>Roster for {selectedTeam.name || `Team ${selectedTeam.number}`}</h3>
              {loadingRoster ? (
                <p>Loading roster...</p>
              ) : (
                <>
                  <ul className="roster-list">
                    {roster.map(r => (
                      <li key={r.id}>
                        <div>
                          {r.player_table?.first_name} {r.player_table?.last_name}
                          {r.player_table?.is_captain && <span className="captain-badge">Captain</span>}
                        </div>
                        <div className="roster-actions">
                          <button onClick={() => handleToggleCaptain(r.player_table?.id, r.player_table?.is_captain)}>
                            Toggle Captain
                          </button>
                          <button onClick={() => handleRemovePlayer(r.id, r.player_table?.id)}>Remove</button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="add-player-section">
                    <h4>Add Player</h4>
                    <select onChange={(e) => {
                      if(e.target.value) handleAddPlayer(e.target.value);
                      e.target.value = '';
                    }} defaultValue="">
                      <option value="" disabled>Select a player...</option>
                      {unassignedPlayers.map(p => (
                        <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="placeholder">
              <p>Select a team to view and manage its roster.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
