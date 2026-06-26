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
      console.log('[AuthProvider] prefetchCoreData started for:', userId);
      
      const isE2E = window._env_?.VITE_IS_E2E === 'true' || import.meta.env.VITE_IS_E2E === 'true';
      if (isE2E) {
        console.log('[AuthProvider] E2E Bypass in prefetchCoreData');
        // We still want to try to fetch, but not block
      }

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
          .order('end_date', { ascending: false })
          .limit(1)
          .maybeSingle()
      ]);

      const playerData = playerRes.status === 'fulfilled' && playerRes.value ? playerRes.value.data : null;
      const seasonData = seasonRes.status === 'fulfilled' && seasonRes.value ? seasonRes.value.data : null;

      console.log('[AuthProvider] Player response status:', playerRes.status);
      console.log('[AuthProvider] Player data present:', !!playerData);

      if (playerData) {
        setCurrentPlayerData(playerData);
        setUserRole({
          isCaptain: !!playerData.is_captain,
          isAdmin: !!playerData.is_admin
        });
        setHasProfile(!!playerData.first_name);
        console.log('[AuthProvider] User roles set from prefetch:', { isCaptain: !!playerData.is_captain, isAdmin: !!playerData.is_admin });
      } else {
        setHasProfile(false);
      }

      if (seasonData) {
        setCurrentSeason(seasonData);
      }
    } catch (err) {
      console.error('Core data pre-fetch error:', err);
      setHasProfile(false);
    } finally {
      console.log('[AuthProvider] prefetchCoreData finished');
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const getSession = async () => {
      try {
        console.log('[AuthProvider] getSession started');

        console.log('[AuthProvider] Calling supabase.auth.getSession()...');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) throw error;

        console.log('[AuthProvider] Session retrieved:', initialSession ? 'Found' : 'None');

        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            console.log('[AuthProvider] User found in getSession, prefetching core data...');
            await prefetchCoreData(initialSession.user.id);
          } else {
            console.log('[AuthProvider] No user in getSession, finishing init');
            setHasProfile(false);
            const { data } = await supabase.from('season').select('*').order('end_date', { ascending: false }).limit(1).maybeSingle();
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
            setHasProfile(null);
            await prefetchCoreData(newUserId);
          } else {
            setUserRole({ isCaptain: false, isAdmin: false });
            setHasProfile(false);
            setCurrentPlayerData(null);
            setLoading(false);
          }
        } catch (err) {
          // Error handling is handled by specific components
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
