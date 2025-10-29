import { useState, useEffect } from 'react';
import { hubsApi } from '@/api/client';

export const useUserClubs = () => {
    const [clubs, setClubs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadClubs();
    }, []);

    const loadClubs = async () => {
        try {
            const data = await hubsApi.getAll();
            const userClubs = data.filter((h: any) => h.type === 'Club' && h.user_role && ['leader', 'admin'].includes(h.user_role));
            setClubs(userClubs);
        } catch (err) {
            console.error('Failed to load clubs:', err);
        } finally {
            setLoading(false);
        }
    };

    return { clubs, loading };
};
