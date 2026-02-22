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

  const fetchUserData = async (userId) => {
    if (!userId) {
      setUserRole({ isCaptain: false, isAdmin: false });
      return;
    }
    try {
      const { data, error } = await supabase
        .from('player')
        .select('is_captain, is_admin, first_name, last_name')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.warn('Error fetching user data:', error.message);
        }
        setUserRole({ isCaptain: false, isAdmin: false });
        setHasProfile(false);
        return;
      }

      setUserRole({
        isCaptain: !!data?.is_captain,
        isAdmin: !!data?.is_admin
      });

      // Consider a profile complete if they have at least a first name saved
      setHasProfile(!!data?.first_name);

    } catch (err) {
      console.error('Error fetching user data:', err);
      setUserRole({ isCaptain: false, isAdmin: false });
      setHasProfile(false);
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
            await fetchUserData(initialSession.user.id);
          } else {
            setHasProfile(false);
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
    signOut,
  }), [session, user, loading, userRole, hasProfile, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
