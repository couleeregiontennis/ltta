import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../scripts/supabaseClient';
import { useAuth } from '../../context/AuthProvider';
import { useSeason } from '../../hooks/useSeason';
import '../../styles/RegistrationManagement.css';

const PAYMENT_STATUSES = ['pending', 'paid', 'failed'];

const getPaymentStatus = (registration) => {
    const payments = registration.payments || [];
    if (payments.some(p => p.status === 'paid')) return 'paid';
    if (payments.some(p => p.status === 'failed')) return 'failed';
    return 'pending';
};

const formatDate = (value) => {
    if (!value) return '—';
    return new Date(value).toLocaleDateString();
};

export const RegistrationManagement = () => {
    const { user, userRole, loading: authLoading } = useAuth();
    const { currentSeason: defaultSeason, loading: seasonLoading } = useSeason();

    const [seasons, setSeasons] = useState([]);
    const [selectedSeasonId, setSelectedSeasonId] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

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
            fetchRegistrations(selectedSeasonId);
        }
    }, [selectedSeasonId]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);

            const { data: seasonData, error: seasonError } = await supabase
                .from('season')
                .select('*')
                .order('number', { ascending: false });

            if (seasonError) throw seasonError;
            setSeasons(seasonData || []);
        } catch (err) {
            console.error('Error fetching initial data:', err);
            setError('Failed to load seasons.');
        } finally {
            setLoading(false);
        }
    };

    const fetchRegistrations = async (seasonId) => {
        try {
            setLoading(true);
            setError('');

            const { data, error: fetchError } = await supabase
                .from('registrations')
                .select(`
                    *,
                    player:player_id (id, first_name, last_name, email),
                    payments (id, status, created_at)
                `)
                .eq('season_id', seasonId)
                .order('created_at', { ascending: false });

            if (fetchError) throw fetchError;
            setRegistrations(data || []);
        } catch (err) {
            console.error('Error fetching registrations:', err);
            setError('Failed to load registrations.');
        } finally {
            setLoading(false);
        }
    };


    const enrichedRegistrations = useMemo(() => {
        return registrations.map(reg => ({
            ...reg,
            payment_status: getPaymentStatus(reg),
            player_name: reg.player
                ? `${reg.player.first_name || ''} ${reg.player.last_name || ''}`.trim()
                : 'Unknown Player'
        }));
    }, [registrations]);

    const filteredRegistrations = useMemo(() => {
        let rows = [...enrichedRegistrations];

        if (paymentStatusFilter) {
            rows = rows.filter(r => r.payment_status === paymentStatusFilter);
        }

        rows.sort((a, b) => {
            const { key, direction } = sortConfig;
            let aVal = a[key];
            let bVal = b[key];

            if (key === 'player_name') {
                aVal = a.player_name.toLowerCase();
                bVal = b.player_name.toLowerCase();
            } else if (key === 'email') {
                aVal = (a.player?.email || '').toLowerCase();
                bVal = (b.player?.email || '').toLowerCase();
            } else if (key === 'created_at' || key === 'updated_at') {
                aVal = aVal ? new Date(aVal).getTime() : 0;
                bVal = bVal ? new Date(bVal).getTime() : 0;
            } else if (key === 'payment_status') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        return rows;
    }, [enrichedRegistrations, paymentStatusFilter, sortConfig]);

    const stats = useMemo(() => {
        const total = enrichedRegistrations.length;
        const paid = enrichedRegistrations.filter(r => r.payment_status === 'paid').length;
        const pending = enrichedRegistrations.filter(r => r.payment_status === 'pending').length;
        return { total, paid, pending };
    }, [enrichedRegistrations]);

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return '⇅';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };


    if (loading || authLoading || seasonLoading) {
        return <div className="registration-management loading">Loading registration management...</div>;
    }

    if (!user || !userRole.isAdmin) {
        return (
            <div className="registration-management no-access">
                <h2>Access Denied</h2>
                <p>You do not have permission to access registration management.</p>
                <Link to="/">← Return to Home</Link>
            </div>
        );
    }

    return (
        <div className="registration-management">
            <div className="header">
                <h1>Registration Management</h1>
                <p className="description">View and manage player registrations by season and payment status.</p>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="registration-controls">
                <div className="control-group">
                    <label htmlFor="season-select">Season</label>
                    <select
                        id="season-select"
                        value={selectedSeasonId || ''}
                        onChange={(e) => setSelectedSeasonId(e.target.value)}
                    >
                        {seasons.map(s => (
                            <option key={s.id} value={s.id}>
                                Season {s.number} ({new Date(s.start_date).getFullYear()})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="control-group">
                    <label htmlFor="payment-status-filter">Payment Status</label>
                    <select
                        id="payment-status-filter"
                        value={paymentStatusFilter}
                        onChange={(e) => setPaymentStatusFilter(e.target.value)}
                    >
                        <option value="">All Statuses</option>
                        {PAYMENT_STATUSES.map(status => (
                            <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                <Link to="/admin/payment-management" className="view-payments-link">
                    View Payments →
                </Link>
            </div>

            <div className="registration-summary">
                <div className="summary-card">
                    <h3>Total Registered</h3>
                    <div className="value">{stats.total}</div>
                </div>
                <div className="summary-card">
                    <h3>Total Paid</h3>
                    <div className="value">{stats.paid}</div>
                </div>
                <div className="summary-card">
                    <h3>Pending</h3>
                    <div className="value">{stats.pending}</div>
                </div>
            </div>

            <div className="registration-table-container">
                <table className="registration-table">
                    <thead>
                        <tr>
                            <th onClick={() => handleSort('player_name')}>
                                Player Name <span className="sort-indicator">{getSortIndicator('player_name')}</span>
                            </th>
                            <th onClick={() => handleSort('email')}>
                                Email <span className="sort-indicator">{getSortIndicator('email')}</span>
                            </th>
                            <th onClick={() => handleSort('created_at')}>
                                Registration Date <span className="sort-indicator">{getSortIndicator('created_at')}</span>
                            </th>
                            <th onClick={() => handleSort('payment_status')}>
                                Payment Status <span className="sort-indicator">{getSortIndicator('payment_status')}</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRegistrations.map(reg => (
                            <tr key={reg.id}>
                                <td>{reg.player_name}</td>
                                <td>{reg.player?.email || '—'}</td>
                                <td>{formatDate(reg.created_at)}</td>
                                <td>
                                    <span className={`status-badge ${reg.payment_status}`}>
                                        {reg.payment_status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {filteredRegistrations.length === 0 && (
                            <tr>
                                <td colSpan="4" style={{ textAlign: 'center' }}>
                                    No registrations found for this season.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

