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
      const [playerRes, seasonRes] = await Promise.all([
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

      if (playerRes.data) {
        setCurrentPlayerData(playerRes.data);
        setUserRole({
          isCaptain: !!playerRes.data.is_captain,
          isAdmin: !!playerRes.data.is_admin
        });
        setHasProfile(!!playerRes.data.first_name);
      }

      if (seasonRes.data) {
        setCurrentSeason(seasonRes.data);
      }
    } catch (err) {
      console.error('Systematic Pre-fetch Error:', err);
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
          if (initialSession?.user) {
            await prefetchCoreData(initialSession.user.id);
          } else {
            setHasProfile(false);
            // Even if not logged in, we need the active season for the public schedule
            const { data } = await supabase.from('season').select('*').eq('is_active', true).maybeSingle();
            if (mounted && data) setCurrentSeason(data);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('Error getting session:', err);
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
            await fetchUserData(newUserId);
          } else {
            setUserRole({ isCaptain: false, isAdmin: false });
            setHasProfile(false);
          }
        } catch (err) {
          console.error('Error handling auth state change:', err);
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
