import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider';
import { supabase } from '../scripts/supabaseClient';
import { LoadingSpinner } from './LoadingSpinner';
import '../styles/Login.css';

const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || 'support@ltta.com';

export const Login = () => {
  const navigate = useNavigate();
  const { session, hasProfile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [isForgotPassword, setIsForgotPassword] = useState(false);

  useEffect(() => {
    if (session && !isForgotPassword) {
      if (hasProfile === false) {
        navigate('/welcome');
      } else {
        navigate('/');
      }
    }
  }, [session, hasProfile, navigate, isForgotPassword]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    let result;
    if (isForgotPassword) {
      result = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      if (!result.error) {
        setError('Password reset instructions sent. Please check your email.');
      }
    } else if (isSignUp) {
      result = await supabase.auth.signUp({ email, password });
      if (!result.error && !result.data?.session) {
        setError('Please check your email for a confirmation link to complete your signup.');
      }
    } else {
      result = await supabase.auth.signInWithPassword({ email, password });
    }
    setLoading(false);
    if (result.error) setError(result.error.message);
  };

  const handleOAuth = async (provider) => {
    setError('');
    setLoading(true);
    const redirectUrl = window.location.origin;

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectUrl
      }
    });
    setLoading(false);
    if (error) setError(error.message);
    // On success, Supabase will redirect to your configured redirect URL
  };

  return (
    <div className="login-page">
      <div className="login-header">
        <h1>{isSignUp ? 'Create your LTTA account' : 'Welcome back to LTTA'}</h1>
        <p>Access captain tools, submit scores, and stay connected with your league team.</p>
      </div>

      <div className="login-layout">
        <div className="login-panel">
          <div className="login-toggle" role="tablist" aria-label="Authentication method">
            <button
              type="button"
              className={`toggle-button ${!isSignUp ? 'active' : ''}`}
              onClick={() => setIsSignUp(false)}
              disabled={loading}
              role="tab"
              aria-selected={!isSignUp}
              aria-controls="auth-panel"
              id="tab-login"
            >
              Login
            </button>
            <button
              type="button"
              className={`toggle-button ${isSignUp ? 'active' : ''}`}
              onClick={() => setIsSignUp(true)}
              disabled={loading}
              role="tab"
              aria-selected={isSignUp}
              aria-controls="auth-panel"
              id="tab-signup"
            >
              Sign Up
            </button>
          </div>

          <div
            id="auth-panel"
            role="tabpanel"
            aria-labelledby={isSignUp ? "tab-signup" : "tab-login"}
            className="login-tab-content"
          >
            <form className="login-form" onSubmit={handleAuth}>
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>
              {!isForgotPassword && (
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label htmlFor="password">Password</label>
                    {!isSignUp && (
                      <button 
                        type="button" 
                        onClick={() => setIsForgotPassword(true)}
                        style={{ background: 'none', border: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '0.875rem' }}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="password-input-wrapper">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              )}
              {error && <div className="form-error">{error}</div>}
              <button className="primary-action" type="submit" disabled={loading}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <LoadingSpinner size="sm" />
                    {isForgotPassword ? 'Sending...' : isSignUp ? 'Creating account…' : 'Signing in…'}
                  </span>
                ) : (
                  isForgotPassword ? 'Send reset link' : isSignUp ? 'Create account' : 'Sign in'
                )}
              </button>
            </form>

            <div className="oauth-divider">
              <span />
              <p>or continue with</p>
              <span />
            </div>

            <div className="oauth-actions">
              <button
                type="button"
                className="oauth-button google"
                onClick={() => handleOAuth('google')}
                disabled={loading}
              >
                <span className="oauth-icon" aria-hidden>🔵</span>
                Google
              </button>
            </div>
          </div>

          <p className="login-switch">
            {isSignUp ? (
              <>
                Already have an account?
                <button type="button" onClick={() => setIsSignUp(false)} disabled={loading}>
                  Sign in
                </button>
              </>
            ) : (
              <>
                New to LTTA?
                <button type="button" onClick={() => setIsSignUp(true)} disabled={loading}>
                  Create an account
                </button>
              </>
            )}
          </p>
        </div>

        <aside className="login-side-card">
          <h2>Why create an account?</h2>
          <ul>
            <li>
              <span>Submit match scores instantly from the court.</span>
            </li>
            <li>
              <span>View upcoming schedules and roster availability.</span>
            </li>
            <li>
              <span>Receive real-time updates from league captains.</span>
            </li>
          </ul>
          <p className="support-text">
            Need assistance? Email
            {' '}
            <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            {' '}for help with your account.
          </p>
        </aside>
      </div>
    </div>
  );
};
