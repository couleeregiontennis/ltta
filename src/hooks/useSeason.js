import { useState, useEffect } from 'react';
import { supabase } from '../scripts/supabaseClient';
import { useAuth } from '../context/AuthProvider';

export const useSeason = () => {
    const { currentSeason: prefetchedSeason, loading: authLoading } = useAuth();
    const [currentSeason, setCurrentSeason] = useState(prefetchedSeason);
    const [loading, setLoading] = useState(!prefetchedSeason && authLoading);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (prefetchedSeason) {
            setCurrentSeason(prefetchedSeason);
            setLoading(false);
            return;
        }

        if (authLoading) return;

        const fetchSeason = async () => {
            try {
                setLoading(true);
                // Logic: Fetch the most recent season by end_date
                const { data, error } = await supabase
                    .from('season')
                    .select('*')
                    .order('end_date', { ascending: false })
                    .limit(1)
                    .single();

                if (error) {
                    if (error.code !== 'PGRST116') throw error;
                    setCurrentSeason(null);
                } else {
                    setCurrentSeason(data);
                }
            } catch (err) {
                console.error('useSeason Error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSeason();
    }, [prefetchedSeason, authLoading]);

    return { currentSeason, loading, error };
};
