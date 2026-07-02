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
  const [isReconnecting, setIsReconnecting] = useState(false);
  const mountedRef = useRef(true);

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

      const playerError = playerRes.status === 'fulfilled' && playerRes.value ? playerRes.value.error : null;
      const seasonError = seasonRes.status === 'fulfilled' && seasonRes.value ? seasonRes.value.error : null;
      const playerStatus = playerRes.status === 'fulfilled' && playerRes.value ? playerRes.value.status : null;
      const seasonStatus = seasonRes.status === 'fulfilled' && seasonRes.value ? seasonRes.value.status : null;

      const isAuthError = (err, status) => {
        if (status === 401 || status === 403) return true;
        if (err && (err.code === 'PGRST301' || err.code === 'PGRST302' || err.message?.includes('JWT') || err.message?.includes('token'))) return true;
        return false;
      };

      if (isAuthError(playerError, playerStatus) || isAuthError(seasonError, seasonStatus)) {
        // The custom fetch wrapper in supabaseClient already attempted refreshSession().
        // If we still get here, refresh failed — clear auth and reload.
        console.warn('[AuthProvider] Auth error in prefetchCoreData after fetch-level retry. Clearing session...');
        const supabaseUrl = window._env_?.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
        const match = supabaseUrl?.match(/https?:\/\/([^.]+)/);
        const projectRef = match ? match[1] : 'shlcqztfdhfwkhijwgue';
        localStorage.removeItem(`sb-${projectRef}-auth-token`);
        localStorage.removeItem('sb-shlcqztfdhfwkhijwgue-auth-token');
        localStorage.removeItem('supabase.auth.token');
        window.location.reload();
        return;
      }

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
    const getSession = async () => {
      try {
        console.log('[AuthProvider] getSession started');

        console.log('[AuthProvider] Calling supabase.auth.getSession()...');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) throw error;

        console.log('[AuthProvider] Session retrieved:', initialSession ? 'Found' : 'None');

        if (mountedRef.current) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          
          if (initialSession?.user) {
            console.log('[AuthProvider] User found in getSession, prefetching core data...');
            await prefetchCoreData(initialSession.user.id);
          } else {
            console.log('[AuthProvider] No user in getSession, finishing init');
            setHasProfile(false);
            const { data } = await supabase.from('season').select('*').order('end_date', { ascending: false }).limit(1).maybeSingle();
            if (mountedRef.current && data) setCurrentSeason(data);
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('AuthProvider init error:', err);
        if (mountedRef.current) setLoading(false);
      }
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mountedRef.current) return;

      try {
        const newUserId = session?.user?.id;

        setSession(session);
        setUser(session?.user ?? null);

        if (event === 'TOKEN_REFRESHED') {
          console.log('[AuthProvider] TOKEN_REFRESHED event received');
          if (newUserId && hasProfile === null) {
            await prefetchCoreData(newUserId);
          }
          return;
        }

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
        setLoading(false);
      }
    });

    // Listen for global auth events dispatched by the custom fetch wrapper
    const handleAuthFailed = () => {
      console.warn('[AuthProvider] ltta:auth-failed received — clearing session and reloading');
      const supabaseUrl = window._env_?.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL;
      const match = supabaseUrl?.match(/https?:\/\/([^.]+)/);
      const projectRef = match ? match[1] : 'shlcqztfdhfwkhijwgue';
      localStorage.removeItem(`sb-${projectRef}-auth-token`);
      localStorage.removeItem('sb-shlcqztfdhfwkhijwgue-auth-token');
      localStorage.removeItem('supabase.auth.token');
      window.location.reload();
    };

    const handleReconnecting = () => {
      if (mountedRef.current) setIsReconnecting(true);
    };
    const handleReconnected = () => {
      if (mountedRef.current) setIsReconnecting(false);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('ltta:auth-failed', handleAuthFailed);
      window.addEventListener('ltta:reconnecting', handleReconnecting);
      window.addEventListener('ltta:reconnected', handleReconnected);
    }

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
      if (typeof window !== 'undefined') {
        window.removeEventListener('ltta:auth-failed', handleAuthFailed);
        window.removeEventListener('ltta:reconnecting', handleReconnecting);
        window.removeEventListener('ltta:reconnected', handleReconnected);
      }
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
    isReconnecting,
    signOut,
  }), [session, user, loading, userRole, hasProfile, currentPlayerData, currentSeason, isReconnecting, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
