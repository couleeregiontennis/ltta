import { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { auth } from '../scripts/apiClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState({ isCaptain: false, isAdmin: false });
  const [hasProfile, setHasProfile] = useState(null);
  const [currentPlayerData, setCurrentPlayerData] = useState(null);
  const [currentSeason, setCurrentSeason] = useState(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        const data = await auth.getSession();

        if (!mounted) return;

        if (data.session?.user) {
          setSession(data.session);
          setUser(data.session.user);

          if (data.player) {
            setCurrentPlayerData(data.player);
            setUserRole({
              isCaptain: !!data.player.is_captain,
              isAdmin: !!data.player.is_admin
            });
            setHasProfile(!!data.player.first_name);
          } else {
            setHasProfile(false);
          }

          if (data.season) {
            setCurrentSeason(data.season);
          }
        } else {
          setHasProfile(false);
          if (data.season) {
            setCurrentSeason(data.season);
          }
        }
      } catch (err) {
        // 401 is expected when not logged in
        if (err.status !== 401) {
          console.error('AuthProvider init error:', err);
        }
        // Still try to fetch season for public pages
        try {
          const { default: api } = await import('../scripts/apiClient');
          const season = await api.get('/seasons/active');
          if (mounted && season) setCurrentSeason(season);
        } catch (seasonErr) {
          // Season fetch failed, not critical
        }
        if (mounted) setHasProfile(false);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    getSession();

    return () => { mounted = false; };
  }, []);

  const signOut = useCallback(async () => {
    await auth.signOut();
    setUser(null);
    setSession(null);
    setUserRole({ isCaptain: false, isAdmin: false });
    setHasProfile(false);
    setCurrentPlayerData(null);
  }, []);

  // Call this after login/signup to refresh session state
  const refreshSession = useCallback(async () => {
    try {
      const data = await auth.getSession();
      if (data.session?.user) {
        setSession(data.session);
        setUser(data.session.user);
        if (data.player) {
          setCurrentPlayerData(data.player);
          setUserRole({
            isCaptain: !!data.player.is_captain,
            isAdmin: !!data.player.is_admin
          });
          setHasProfile(!!data.player.first_name);
        }
        if (data.season) setCurrentSeason(data.season);
      }
    } catch (err) {
      console.error('Session refresh error:', err);
    }
  }, []);

  const value = useMemo(() => ({
    session,
    user,
    loading,
    userRole,
    hasProfile,
    currentPlayerData,
    currentSeason,
    isReconnecting,
    signOut,
    refreshSession,
  }), [session, user, loading, userRole, hasProfile, currentPlayerData, currentSeason, signOut, refreshSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
