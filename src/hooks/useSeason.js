import { useState, useEffect } from 'react';
import api from '../scripts/apiClient';
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
                const data = await api.get('/seasons/active');
                setCurrentSeason(data);
            } catch (err) {
                if (err.status !== 404) {
                    console.error('useSeason Error:', err);
                    setError(err.message);
                }
                setCurrentSeason(null);
            } finally {
                setLoading(false);
            }
        };

        fetchSeason();
    }, [prefetchedSeason, authLoading]);

    return { currentSeason, loading, error };
};
