import { useState } from 'react';
import api from '../scripts/apiClient';
import { useAuth } from '../context/AuthProvider';
import { useSeason } from '../hooks/useSeason';
import { useSearchParams } from 'react-router-dom';
import '../styles/PayDues.css';

const POLL_RETRIES = 5;
const POLL_INTERVAL_MS = 2000;

export const PayDues = () => {
    const { currentPlayerData } = useAuth();
    const { currentSeason } = useSeason();
    const [searchParams] = useSearchParams();

    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState('loading');
    const [error, setError] = useState('');
    const [refreshToken, setRefreshToken] = useState(0);

    useEffect(() => {
        let isMounted = true;

        const checkStatus = async (retries = POLL_RETRIES) => {
            if (!currentPlayerData || !currentSeason) return;

            try {
                const { data, error } = await supabase
                    .from('registrations')
                    .select('status')
                    .eq('player_id', currentPlayerData.id)
                    .eq('season_id', currentSeason.id)
                    .maybeSingle();

                if (error) throw error;

                // Check URL parameters for Stripe redirect
                if (searchParams.get('success') === 'true') {
                    if (data?.status === 'completed') {
                        if (isMounted) setStatus('paid');
                    } else if (retries > 0) {
                        // The webhook can lag the redirect; poll briefly.
                        setTimeout(() => {
                            if (isMounted) checkStatus(retries - 1);
                        }, POLL_INTERVAL_MS);
                        return;
                    } else {
                        // The webhook has not confirmed yet. Never assume paid
                        // from the URL param alone; ask the user to re-check.
                        if (isMounted) setStatus('processing');
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
    }, [currentPlayerData, currentSeason, searchParams, refreshToken]);

    const handleCheckout = async () => {
        if (!currentPlayerData || !currentSeason) {
            setError('Missing player or season information.');
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            // Insert a pending payment record
            await api.post('/payments', {
                season_id: currentSeason.id,
                player_id: currentPlayerData.id,
                amount_paid: 60,
                payment_method: 'online',
                status: 'pending'
            });

            if (data?.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned.');
            }
        } catch (err) {
            console.error('Error initiating checkout:', err);
            setError(err.message || 'Failed to start checkout process. Please try again.');
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

    if (status === 'processing') {
        return (
            <div className="pay-dues-container">
                <div className="pay-dues-header">
                    <h1>Processing Payment</h1>
                    <p>
                        We received your payment and are waiting for confirmation.
                        This usually takes a few seconds.
                    </p>
                    <button
                        className="btn-primary"
                        onClick={() => setRefreshToken((t) => t + 1)}
                    >
                        Check status again
                    </button>
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
