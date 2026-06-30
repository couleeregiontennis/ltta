import { useState, useEffect } from 'react';
import { supabase } from '../scripts/supabaseClient';
import { useAuth } from '../context/AuthProvider';
import '../styles/NotificationTray.css';

export const NotificationTray = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const { data: playerData } = await supabase
          .from('player')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (playerData) {
          const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('recipient_id', playerData.id)
            .order('created_at', { ascending: false })
            .limit(20);

          if (!error && data) {
            setNotifications(data);
            setUnreadCount(data.filter(n => n.status === 'pending').length);
          }
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user]);

  const markAsRead = async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ status: 'read' })
        .eq('id', id);

      if (!error) {
        setNotifications(notifications.map(n =>
          n.id === id ? { ...n, status: 'read' } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: playerData } = await supabase
        .from('player')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (playerData) {
          await supabase
            .from('notifications')
            .update({ status: 'read' })
            .eq('recipient_id', playerData.id)
            .eq('status', 'pending');

          setNotifications(notifications.map(n => ({ ...n, status: 'read' })));
          setUnreadCount(0);
      }
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  if (!user) return null;

  return (
    <div className="notification-tray">
      <button
        className="notification-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notification-dropdown card card--interactive">
          <div className="notification-header">
            <h3>Notifications</h3>
            {unreadCount > 0 && (
              <button className="btn-text-primary" onClick={markAllAsRead}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notification-list">
            {loading ? (
              <p className="notification-empty">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="notification-empty">No notifications yet.</p>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${notification.status === 'pending' ? 'unread' : ''}`}
                  onClick={() => notification.status === 'pending' && markAsRead(notification.id)}
                >
                  <div className="notification-content">
                    <h4>{notification.title}</h4>
                    <p>{notification.body}</p>
                    <span className="notification-time">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {notification.status === 'pending' && (
                    <div className="notification-dot" aria-label="Unread"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
