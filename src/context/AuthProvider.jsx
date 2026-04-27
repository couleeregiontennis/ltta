import { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { supabase } from '../scripts/supabaseClient';

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

  const prefetchCoreData = async (userId) => {
    try {
      // Fetch player and season in parallel but handle them gracefully
      const [playerRes, seasonRes] = await Promise.allSettled([
        supabase
          .from('player')
          .select('*, is_captain, is_admin')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('season')
          .select('*')
          .eq('is_active', true)
          .maybeSingle()
      ]);

      if (playerRes.status === 'fulfilled' && playerRes.value.data) {
        const playerData = playerRes.value.data;
        setCurrentPlayerData(playerData);
        setUserRole({
          isCaptain: !!playerData.is_captain,
          isAdmin: !!playerData.is_admin
        });
        setHasProfile(!!playerData.first_name);
      } else {
        setHasProfile(false);
      }

      if (seasonRes.status === 'fulfilled' && seasonRes.value.data) {
        setCurrentSeason(seasonRes.value.data);
      }
    } catch (err) {
      console.error('Core data pre-fetch error:', err);
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          // E2E Bypass: Don't let initialization hangs block testing
          if (import.meta.env.VITE_IS_E2E === 'true') {
            setLoading(false);
          }

          if (initialSession?.user) {
            // Immediately start prefetching and clearing loading state
            await prefetchCoreData(initialSession.user.id);
          } else {
            setHasProfile(false);
            const { data } = await supabase.from('season').select('*').eq('is_active', true).maybeSingle();
            if (mounted && data) setCurrentSeason(data);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('AuthProvider init error:', err);
        if (mounted) setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (mounted) {
        try {
          const newUserId = session?.user?.id;

          setSession(session);
          setUser(session?.user ?? null);

          if (newUserId) {
            await prefetchCoreData(newUserId);
          } else {
            setUserRole({ isCaptain: false, isAdmin: false });
            setHasProfile(false);
            setCurrentPlayerData(null);
          }
        } catch (err) {
          // Error handling is handled by specific components
        } finally {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(() => supabase.auth.signOut(), []);

  const value = useMemo(() => ({
    session,
    user,
    loading,
    userRole,
    hasProfile,
    currentPlayerData,
    currentSeason,
    signOut,
  }), [session, user, loading, userRole, hasProfile, currentPlayerData, currentSeason, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
