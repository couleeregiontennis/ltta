import { useState } from 'react';
import { supabase } from '../scripts/supabaseClient';
import { useAuth } from '../context/AuthProvider';
import { useSeason } from '../hooks/useSeason';
import '../styles/PayDues.css';

export const PayDues = () => {
    const { user, currentPlayerData } = useAuth();
    const { currentSeason } = useSeason();
    
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSelfReport = async () => {
        if (!currentPlayerData || !currentSeason) {
            setError('Missing player or season information.');
            return;
        }

        setSubmitting(true);
        setError('');
        setMessage('');

        try {
            // Insert a pending payment record
            const { error: insertError } = await supabase
                .from('season_payments')
                .insert([{
                    season_id: currentSeason.id,
                    player_id: currentPlayerData.id,
                    amount_paid: 60, // Assuming a standard $60 dues for now, could be dynamic
                    payment_method: 'zeffy',
                    status: 'pending',
                    notes: 'Self-reported via website'
                }]);

            if (insertError) throw insertError;

            setMessage('Thank you! Your payment has been reported and is pending admin verification.');
        } catch (err) {
            console.error('Error reporting payment:', err);
            setError('Failed to report payment. Please contact an admin.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="pay-dues-container">
            <div className="pay-dues-header">
                <h1>Pay Season Dues</h1>
                <p>Support the league and pay your seasonal dues quickly and securely.</p>
                <p className="no-fees-notice">We use Zeffy because it charges <strong>0% fees</strong> to our league. You can optionally leave a tip for their platform at checkout.</p>
            </div>

            <div className="zeffy-embed">
                {/* 
                  Replace this src URL with the actual Zeffy form URL.
                  Wait, we need the Zeffy form URL from the user. We will use a placeholder for now.
                */}
                <iframe
                    title="Donation form powered by Zeffy"
                    style={{ position: 'relative', border: 0, width: '100%', padding: 0, height: '800px' }}
                    src="https://www.zeffy.com/en-US/embed/donation-form/placeholder-form-id"
                    allowpaymentrequest="allowpaymentrequest"
                    allowtransparency="true"
                    allow="credit-card"
                />
            </div>

            <div className="self-report-section">
                <h2>Already Paid?</h2>
                <p>If you've just completed your payment using the form above, please click the button below so we can update your account.</p>
                
                {error && <div className="error-message">{error}</div>}
                {message ? (
                    <div className="success-message">{message}</div>
                ) : (
                    <button 
                        className="btn-primary btn-report" 
                        onClick={handleSelfReport}
                        disabled={submitting || !currentPlayerData}
                    >
                        {submitting ? 'Reporting...' : "I've Completed My Payment"}
                    </button>
                )}
            </div>
        </div>
    );
};
