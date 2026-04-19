import { useState, useEffect } from 'react';
import { supabase } from '../../scripts/supabaseClient';
import { useAuth } from '../../context/AuthProvider';
import { useSeason } from '../../hooks/useSeason';
import '../../styles/PaymentManagement.css';
import '../../styles/PlayerManagement.css'; // Reuse modal and form styles

export const PaymentManagement = () => {
    const { user, userRole, loading: authLoading } = useAuth();
    const { currentSeason: defaultSeason, loading: seasonLoading } = useSeason();
    
    const [seasons, setSeasons] = useState([]);
    const [selectedSeasonId, setSelectedSeasonId] = useState(null);
    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [payments, setPayments] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPayment, setNewPayment] = useState({
        payer_type: 'player', // 'player' or 'team'
        player_id: '',
        team_id: '',
        amount_paid: '',
        payment_method: 'zeffy',
        notes: ''
    });

    useEffect(() => {
        if (authLoading || seasonLoading) return;
        
        if (user && userRole.isAdmin) {
            fetchInitialData();
        } else {
            setLoading(false);
        }
    }, [authLoading, seasonLoading, user, userRole]);

    useEffect(() => {
        if (defaultSeason && !selectedSeasonId) {
            setSelectedSeasonId(defaultSeason.id);
        }
    }, [defaultSeason]);

    useEffect(() => {
        if (selectedSeasonId) {
            fetchPayments(selectedSeasonId);
        }
    }, [selectedSeasonId]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            
            // Fetch all seasons
            const { data: seasonData } = await supabase
                .from('season')
                .select('*')
                .order('number', { ascending: false });
            setSeasons(seasonData || []);

            // Fetch players for the dropdown
            const { data: playerData } = await supabase
                .from('player')
                .select('id, first_name, last_name')
                .order('last_name', { ascending: true });
            setPlayers(playerData || []);

            // Fetch teams for the dropdown
            const { data: teamData } = await supabase
                .from('team')
                .select('id, name, number')
                .order('name', { ascending: true });
            setTeams(teamData || []);

        } catch (err) {
            console.error('Error fetching initial data:', err);
            setError('Failed to load initial data.');
        } finally {
            setLoading(false);
        }
    };

    const fetchPayments = async (seasonId) => {
        try {
            const { data, error } = await supabase
                .from('season_payments')
                .select(`
                    *,
                    player:player_id (first_name, last_name),
                    team:team_id (name, number)
                `)
                .eq('season_id', seasonId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            console.log('PaymentManagement: Loaded payments:', data?.length, data?.[0]?.status);
            setPayments(data || []);
        } catch (err) {
            console.error('Error fetching payments:', err);
            setError('Failed to load payments.');
        }
    };

    const handleAddPayment = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            if (!newPayment.amount_paid || isNaN(newPayment.amount_paid)) {
                throw new Error('Please enter a valid amount.');
            }

            const paymentData = {
                season_id: selectedSeasonId,
                amount_paid: parseFloat(newPayment.amount_paid),
                payment_method: newPayment.payment_method,
                status: 'verified',
                notes: newPayment.notes,
                player_id: newPayment.payer_type === 'player' ? newPayment.player_id : null,
                team_id: newPayment.payer_type === 'team' ? newPayment.team_id : null
            };

            if (!paymentData.player_id && !paymentData.team_id) {
                throw new Error('Please select a player or team.');
            }

            const { error } = await supabase
                .from('season_payments')
                .insert([paymentData]);

            if (error) throw error;

            setSuccess('Payment recorded successfully!');
            setIsModalOpen(false);
            setNewPayment({
                payer_type: 'player',
                player_id: '',
                team_id: '',
                amount_paid: '',
                payment_method: 'zeffy',
                notes: ''
            });
            fetchPayments(selectedSeasonId);
            
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error recording payment:', err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleApprovePayment = async (paymentId) => {
        try {
            setError('');
            const { error } = await supabase
                .from('season_payments')
                .update({ status: 'verified' })
                .eq('id', paymentId);

            if (error) throw error;

            setSuccess('Payment approved successfully!');
            fetchPayments(selectedSeasonId);
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error approving payment:', err);
            setError('Failed to approve payment.');
        }
    };

    const totalCollected = payments.filter(p => p.status !== 'pending').reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
    const pendingPayments = payments.filter(p => p.status === 'pending');
    const verifiedPayments = payments.filter(p => p.status !== 'pending');

    if (loading || authLoading || seasonLoading) {
        return <div className="payment-management loading">Loading payment management...</div>;
    }

    if (!user || !userRole.isAdmin) {
        return (
            <div className="payment-management no-access">
                <h2>Access Denied</h2>
                <p>You do not have permission to access payment management.</p>
            </div>
        );
    }

    return (
        <div className="payment-management">
            <div className="header">
                <h1>Payment Management</h1>
                <p className="description">Track and manage player and team registration fees.</p>
            </div>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="admin-controls">
                <div className="season-selector">
                    <label htmlFor="season-select">Season:</label>
                    <select 
                        id="season-select"
                        value={selectedSeasonId || ''} 
                        onChange={(e) => setSelectedSeasonId(e.target.value)}
                    >
                        {seasons.map(s => (
                            <option key={s.id} value={s.id}>Season {s.number} ({new Date(s.start_date).getFullYear()})</option>
                        ))}
                    </select>
                </div>
                <button className="btn-add-payment" onClick={() => setIsModalOpen(true)}>
                    + Record Payment
                </button>
            </div>

            <div className="payment-summary">
                <div className="summary-card">
                    <h3>Total Collected</h3>
                    <div className="value">${totalCollected.toFixed(2)}</div>
                </div>
                <div className="summary-card">
                    <h3>Verified Payments</h3>
                    <div className="value">{verifiedPayments.length}</div>
                </div>
                <div className="summary-card">
                    <h3>Pending Approvals</h3>
                    <div className="value" style={{ color: pendingPayments.length > 0 ? 'var(--color-danger)' : 'inherit' }}>
                        {pendingPayments.length}
                    </div>
                </div>
            </div>

            {pendingPayments.length > 0 && (
                <div className="payment-table-container pending-container" style={{ marginBottom: '2rem', border: '2px solid var(--color-danger)', borderRadius: 'var(--radius-md)' }}>
                    <h2 style={{ padding: '1rem', margin: 0, backgroundColor: 'rgba(var(--color-danger-rgb), 0.1)', color: 'var(--color-danger)' }}>
                        Pending Verification
                    </h2>
                    <table className="payment-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Player/Team</th>
                                <th>Amount</th>
                                <th>Method</th>
                                <th>Notes</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pendingPayments.map(payment => (
                                <tr key={payment.id}>
                                    <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                                    <td>
                                        {payment.player ? 
                                            `${payment.player.first_name} ${payment.player.last_name}` : 
                                            `Team: ${payment.team?.name || 'Unknown'}`
                                        }
                                    </td>
                                    <td>${parseFloat(payment.amount_paid).toFixed(2)}</td>
                                    <td>
                                        <span className={`method-badge ${payment.payment_method}`}>
                                            {payment.payment_method.toUpperCase()}
                                        </span>
                                    </td>
                                    <td>{payment.notes}</td>
                                    <td>
                                        <button 
                                            className="btn-primary" 
                                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                                            onClick={() => handleApprovePayment(payment.id)}
                                        >
                                            Approve
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <h3>Verified Payments</h3>
            <div className="payment-table-container">
                <table className="payment-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Payer</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Notes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {verifiedPayments.map(payment => (
                            <tr key={payment.id}>
                                <td>{new Date(payment.created_at).toLocaleDateString()}</td>
                                <td>
                                    {payment.player ? 
                                        `${payment.player.first_name} ${payment.player.last_name}` : 
                                        `Team: ${payment.team?.name || 'Unknown'}`
                                    }
                                </td>
                                <td>${parseFloat(payment.amount_paid).toFixed(2)}</td>
                                <td>
                                    <span className={`method-badge ${payment.payment_method}`}>
                                        {payment.payment_method.toUpperCase()}
                                    </span>
                                </td>
                                <td>{payment.notes}</td>
                            </tr>
                        ))}
                        {verifiedPayments.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center' }}>No payments found for this season.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Add Payment Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Record New Payment</h2>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)} aria-label="Close modal">×</button>
                        </div>

                        <form onSubmit={handleAddPayment}>
                            <div className="form-group">
                                <label>Payer Type</label>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                    <label className="checkbox-label" style={{ paddingLeft: '25px' }}>
                                        <input 
                                            type="radio" 
                                            name="payer_type" 
                                            value="player" 
                                            checked={newPayment.payer_type === 'player'}
                                            onChange={(e) => setNewPayment({...newPayment, payer_type: e.target.value})}
                                        />
                                        <span className="checkmark" style={{ borderRadius: '50%' }}></span>
                                        Player
                                    </label>
                                    <label className="checkbox-label" style={{ paddingLeft: '25px' }}>
                                        <input 
                                            type="radio" 
                                            name="payer_type" 
                                            value="team" 
                                            checked={newPayment.payer_type === 'team'}
                                            onChange={(e) => setNewPayment({...newPayment, payer_type: e.target.value})}
                                        />
                                        <span className="checkmark" style={{ borderRadius: '50%' }}></span>
                                        Team
                                    </label>
                                </div>
                            </div>

                            {newPayment.payer_type === 'player' ? (
                                <div className="form-group">
                                    <label htmlFor="player-select">Select Player</label>
                                    <select 
                                        id="player-select"
                                        required
                                        value={newPayment.player_id}
                                        onChange={(e) => setNewPayment({...newPayment, player_id: e.target.value})}
                                    >
                                        <option value="">-- Select Player --</option>
                                        {players.map(p => (
                                            <option key={p.id} value={p.id}>{p.last_name}, {p.first_name}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label htmlFor="team-select">Select Team</label>
                                    <select 
                                        id="team-select"
                                        required
                                        value={newPayment.team_id}
                                        onChange={(e) => setNewPayment({...newPayment, team_id: e.target.value})}
                                    >
                                        <option value="">-- Select Team --</option>
                                        {teams.map(t => (
                                            <option key={t.id} value={t.id}>{t.name} (#{t.number})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="amount">Amount ($)</label>
                                    <input 
                                        id="amount"
                                        type="number" 
                                        step="0.01" 
                                        required
                                        value={newPayment.amount_paid}
                                        onChange={(e) => setNewPayment({...newPayment, amount_paid: e.target.value})}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="method">Method</label>
                                    <select 
                                        id="method"
                                        value={newPayment.payment_method}
                                        onChange={(e) => setNewPayment({...newPayment, payment_method: e.target.value})}
                                    >
                                        <option value="zeffy">Zeffy</option>
                                        <option value="cash">Cash</option>
                                        <option value="check">Check</option>
                                        <option value="stripe">Stripe</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label htmlFor="notes">Notes</label>
                                <textarea 
                                    id="notes"
                                    value={newPayment.notes}
                                    onChange={(e) => setNewPayment({...newPayment, notes: e.target.value})}
                                    rows="3"
                                    placeholder="Optional notes..."
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={saving}>
                                    {saving ? 'Saving...' : 'Record Payment'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
