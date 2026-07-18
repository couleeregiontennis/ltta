import { useState, useEffect } from 'react';
import { supabase } from '../scripts/supabaseClient';
import { useAuth } from '../context/AuthProvider';
import { useSeason } from '../hooks/useSeason';
import { useSearchParams } from 'react-router-dom';
import '../styles/PayDues.css';

export const PayDues = () => {
    const { user, currentPlayerData } = useAuth();
    const { currentSeason } = useSeason();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const checkStatus = async (retries = 3) => {
            if (!currentPlayerData || !currentSeason) return;

            try {
                const { data, error } = await supabase
                    .from('registrations')
                    .select('status')
                    .eq('player_id', currentPlayerData.id)
                    .eq('season_id', currentSeason.id)
                    .maybeSingle();

                if (error && error.code !== 'PGRST116') throw error;

                // Check URL parameters for Stripe redirect
                if (searchParams.get('success') === 'true') {
                    if (data?.status === 'completed') {
                        if (isMounted) setStatus('paid');
                    } else if (retries > 0) {
                        // Short poll if still pending after redirect
                        setTimeout(() => {
                            if (isMounted) checkStatus(retries - 1);
                        }, 2000);
                        return;
                    } else {
                        // Exhausted retries, might still be processing
                        if (isMounted) setStatus('paid');
                    }
                    return;
                }

                if (searchParams.get('canceled') === 'true') {
                    if (isMounted) setError('Payment was canceled. You can try again below.');
                }

                if (data?.status === 'completed') {
                    if (isMounted) setStatus('paid');
                } else {
                    if (isMounted) setStatus('unpaid');
                }
            } catch (err) {
                console.error('Error checking registration status:', err);
                if (isMounted) {
                    setError('Failed to load payment status.');
                    setStatus('error');
                }
            }
        };

        checkStatus();

        return () => {
            isMounted = false;
        };
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
            // Use ignoreDuplicates so we don't overwrite completed to pending
            const { error: upsertError } = await supabase
                .from('registrations')
                .upsert(
                    {
                        player_id: currentPlayerData.id,
                        season_id: currentSeason.id,
                        status: 'pending'
                    },
                    { onConflict: 'player_id, season_id', ignoreDuplicates: true }
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

    const duesAmountCents = currentSeason?.dues_amount_cents ?? 2500;
    const duesAmountFormatted = `$${(duesAmountCents / 100).toFixed(2)}`;

    return (
        <div className="pay-dues-container">
            <div className="pay-dues-header">
                <h1>Pay Season Dues</h1>
                <p>Support the league and pay your seasonal dues ({duesAmountFormatted}) quickly and securely.</p>
            </div>

            <div className="checkout-section">
                {error && <div className="error-message">{error}</div>}

                <div className="dues-summary card card--interactive">
                    <h2>Roster Dues: {currentSeason?.number ? `Season ${currentSeason.number}` : 'Current Season'}</h2>
                    <div className="price-tag">{duesAmountFormatted}</div>
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
