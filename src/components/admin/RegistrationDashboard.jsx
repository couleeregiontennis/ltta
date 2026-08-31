import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../scripts/supabaseClient';
import '../../styles/Style.css'; // Using standard styles

export function RegistrationDashboard() {
  const [seasons, setSeasons] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentFilter, setPaymentFilter] = useState('all');

  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });

  useEffect(() => {
    fetchSeasons();
  }, []);

  useEffect(() => {
    if (selectedSeason) {
      fetchRegistrations();
    } else {
      setRegistrations([]);
      setLoading(false);
    }
  }, [selectedSeason]);

  const fetchSeasons = async () => {
    try {
      const { data, error } = await supabase
        .from('season')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setSeasons(data || []);
      if (data && data.length > 0) {
        setSelectedSeason(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching seasons:', error);
    }
  };

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*, player:player_id (first_name, last_name, email), payments (*)')
        .eq('season_id', selectedSeason);

      if (error) throw error;

      // Transform data for easier sorting/filtering
      const formattedData = (data || []).map(reg => {
        let paymentStatus = 'pending'; // Default
        if (reg.payments && reg.payments.length > 0) {
           // use the first payment status, or however the schema is meant to aggregate
           paymentStatus = reg.payments[0].status;
        }

        return {
          ...reg,
          playerName: reg.player ? `${reg.player.first_name} ${reg.player.last_name}` : 'Unknown',
          playerEmail: reg.player ? reg.player.email : 'Unknown',
          paymentStatus: paymentStatus
        };
      });

      setRegistrations(formattedData);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredRegistrations = useMemo(() => {
    let filtered = [...registrations];

    if (paymentFilter !== 'all') {
      filtered = filtered.filter(reg => reg.paymentStatus === paymentFilter);
    }

    return filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [registrations, paymentFilter, sortConfig]);

  const stats = useMemo(() => {
    return {
      total: registrations.length,
      paid: registrations.filter(r => r.paymentStatus === 'paid').length,
      pending: registrations.filter(r => r.paymentStatus === 'pending').length,
      failed: registrations.filter(r => r.paymentStatus === 'failed').length,
    };
  }, [registrations]);

  return (
    <div className="container">
      <h2>Registration Dashboard</h2>

      <div className="filters-section" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <label htmlFor="season-select">Season: </label>
          <select
            id="season-select"
            aria-label="Season"
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
          >
            {seasons.map(season => (
              <option key={season.id} value={season.id}>{season.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="payment-filter">Payment Status: </label>
          <select
            id="payment-filter"
            aria-label="Payment Status"
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      <div className="stats-section" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card">
          <h3>Total</h3>
          <p data-testid="stat-total-registrations">{stats.total}</p>
        </div>
        <div className="card">
          <h3>Paid</h3>
          <p data-testid="stat-paid">{stats.paid}</p>
        </div>
        <div className="card">
          <h3>Pending</h3>
          <p data-testid="stat-pending">{stats.pending}</p>
        </div>
        <div className="card">
          <h3>Failed</h3>
          <p data-testid="stat-failed">{stats.failed}</p>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filteredRegistrations.length === 0 ? (
        <p>No registrations found.</p>
      ) : (
        <table className="registrations-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th onClick={() => handleSort('playerName')} style={{ cursor: 'pointer', textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>
                Player {sortConfig.key === 'playerName' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('playerEmail')} style={{ cursor: 'pointer', textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>
                Email {sortConfig.key === 'playerEmail' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('created_at')} style={{ cursor: 'pointer', textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>
                Date {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </th>
              <th onClick={() => handleSort('paymentStatus')} style={{ cursor: 'pointer', textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>
                Payment Status {sortConfig.key === 'paymentStatus' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredRegistrations.map(reg => (
              <tr key={reg.id}>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{reg.playerName}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{reg.playerEmail}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{new Date(reg.created_at).toLocaleDateString()}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #eee' }}>{reg.paymentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
