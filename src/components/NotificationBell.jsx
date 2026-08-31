import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthProvider';
import { supabase } from '../scripts/supabaseClient';
import '../styles/NotificationBell.css';

export const NotificationBell = () => {
  const { currentPlayerData } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!currentPlayerData?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', currentPlayerData.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Failed to load notifications:', error);
      } else {
        setNotifications(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [currentPlayerData?.id]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = async (event, id) => {
    event.stopPropagation();
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (error) {
      console.error('Failed to mark notification as read:', error);
      return;
    }

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="notification-bell" ref={dropdownRef}>
      <button
        type="button"
        className="notification-bell-button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        aria-expanded={open}
        data-testid="notification-bell"
      >
        <span aria-hidden="true">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge" data-testid="notification-badge">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="notification-dropdown"
          role="region"
          aria-label="Notifications"
          data-testid="notification-dropdown"
        >
          {loading ? (
            <div className="notification-empty">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty" data-testid="notification-empty">
              No notifications
            </div>
          ) : (
            <ul className="notification-list" role="list">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`notification-item ${
                    n.is_read ? 'notification-item-read' : 'notification-item-unread'
                  }`}
                  data-testid="notification-item"
                  data-notification-id={n.id}
                >
                  <button
                    type="button"
                    className="notification-item-button"
                    onClick={(e) => markAsRead(e, n.id)}
                    aria-label={`${n.title}. ${n.is_read ? 'Read' : 'Unread'}`}
                  >
                    <div className="notification-item-title">{n.title}</div>
                    <div className="notification-item-body">{n.body}</div>
                    <div className="notification-item-meta">
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
