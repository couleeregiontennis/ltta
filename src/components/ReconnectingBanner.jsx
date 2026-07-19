import { useEffect, useState } from 'react';
import '../styles/ReconnectingBanner.css';

/**
 * Shows an "App is reconnecting..." banner when the custom fetch wrapper
 * detects JWT expiry and is attempting a session refresh. Listens to global
 * ltta:reconnecting / ltta:reconnected custom events.
 */
export const ReconnectingBanner = () => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleReconnecting = () => {
      setMessage('App is reconnecting...');
      setVisible(true);
    };
    const handleReconnected = () => {
      setMessage('Reconnected successfully');
      setVisible(true);
      // Auto-hide after a short delay
      setTimeout(() => setVisible(false), 2000);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('ltta:reconnecting', handleReconnecting);
      window.addEventListener('ltta:reconnected', handleReconnected);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('ltta:reconnecting', handleReconnecting);
        window.removeEventListener('ltta:reconnected', handleReconnected);
      }
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="reconnecting-banner" role="alert" aria-live="polite">
      <span className="reconnecting-spinner" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
};
