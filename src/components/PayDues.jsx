import { useState, useEffect } from 'react';
import { supabase } from '../scripts/supabaseClient';
import { useAuth } from '../context/AuthProvider';
import { useSeason } from '../hooks/useSeason';
import { useSearchParams } from 'react-router-dom';
import '../styles/PayDues.css';

export const PayDues = () => {
    const { user, currentPlayerData } = useAuth();
    const { currentSeason } = useSeason();
    const [searchParams] = useSearchParams();
    
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState('');

    useEffect(() => {
        const checkStatus = async () => {
            if (!currentPlayerData || !currentSeason) return;

            // Check URL parameters for Stripe redirect
            if (searchParams.get('success') === 'true') {
                setStatus('paid');
                return;
            }

            if (searchParams.get('canceled') === 'true') {
                setError('Payment was canceled. You can try again below.');
            }

            try {
                const { data, error } = await supabase
                    .from('registrations')
                    .select('status')
                    .eq('player_id', currentPlayerData.id)
                    .eq('season_id', currentSeason.id)
                    .maybeSingle();

                if (error && error.code !== 'PGRST116') throw error;

                if (data?.status === 'completed') {
                    setStatus('paid');
                } else {
                    setStatus('unpaid');
                }
            } catch (err) {
                console.error('Error checking registration status:', err);
                setError('Failed to load payment status.');
                setStatus('error');
            }
        };

        checkStatus();
    }, [currentPlayerData, currentSeason, searchParams]);

    const handleCheckout = async () => {
        if (!currentPlayerData || !currentSeason) {
            setError('Missing player or season information.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            // Ensure registration exists (upsert)
            const { error: upsertError } = await supabase
                .from('registrations')
                .upsert(
                    {
                        player_id: currentPlayerData.id,
                        season_id: currentSeason.id,
                        status: 'pending'
                    },
                    { onConflict: 'player_id, season_id' }
                );

            if (upsertError) throw upsertError;

            // Call Edge Function
            const { data, error } = await supabase.functions.invoke('stripe-checkout', {
                body: {
                    player_id: currentPlayerData.id,
                    season_id: currentSeason.id,
                    email: user.email
                }
            });

            if (error) throw error;
            if (data?.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned.');
            }
        } catch (err) {
            console.error('Error initiating checkout:', err);
            setError('Failed to start checkout process. Please try again.');
            setSubmitting(false);
        }
    };

    if (status === 'loading') {
        return <div className="pay-dues-container"><div className="loading">Loading payment status...</div></div>;
    }

    if (status === 'paid') {
        return (
            <div className="pay-dues-container">
                <div className="pay-dues-header">
                    <h1>Payment Complete</h1>
                    <div className="success-message">
                        Thank you! Your dues for the {currentSeason?.number ? `Season ${currentSeason.number}` : 'current season'} have been paid.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pay-dues-container">
            <div className="pay-dues-header">
                <h1>Pay Season Dues</h1>
                <p>Support the league and pay your seasonal dues ($30.00) quickly and securely.</p>
            </div>

            <div className="checkout-section">
                {error && <div className="error-message">{error}</div>}

                <div className="dues-summary card card--interactive">
                    <h2>Roster Dues: {currentSeason?.number ? `Season ${currentSeason.number}` : 'Current Season'}</h2>
                    <div className="price-tag">$30.00</div>
                    <button 
                        className="btn-primary btn-checkout"
                        onClick={handleCheckout}
                        disabled={submitting || !currentPlayerData}
                    >
                        {submitting ? 'Preparing Checkout...' : 'Pay Roster Dues'}
                    </button>
                </div>
            </div>
        </div>
    );
};
