import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../scripts/supabaseClient';
import { LoadingSpinner } from './LoadingSpinner';
import '../styles/Login.css'; // Reuse Login styles

export const UpdatePassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Supabase will automatically handle the hash in the URL and set the session
    // We just need to check if there is an active session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Invalid or expired reset link. Please request a new one.');
      }
    };
    checkSession();
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const { error } = await supabase.auth.updateUser({
      password: password
    });
    
    setLoading(false);
    
    if (error) {
      setError(error.message);
    } else {
      setSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    }
  };

  return (
    <div className="login-page">
      <div className="login-header">
        <h1>Update Password</h1>
        <p>Enter your new password below.</p>
      </div>

      <div className="login-layout" style={{ justifyContent: 'center' }}>
        <div className="login-panel">
          <div className="login-tab-content">
            {success ? (
              <div className="success-message" style={{ textAlign: 'center', padding: '2rem' }}>
                <h3 style={{ color: 'var(--color-success)', marginBottom: '1rem' }}>Password Updated!</h3>
                <p>Your password has been successfully updated. Redirecting to dashboard...</p>
              </div>
            ) : (
              <form className="login-form" onSubmit={handleUpdatePassword}>
                <div className="form-group">
                  <label htmlFor="password">New Password</label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <div className="form-error">{error}</div>}
                <button className="primary-action" type="submit" disabled={loading}>
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                      <LoadingSpinner size="sm" />
                      Updating...
                    </span>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
