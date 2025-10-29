import { useState, useMemo } from 'react';

export const useEventFilters = (events: any[]) => {
    const [search, setSearch] = useState('');
    const [clubFilter, setClubFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            const matchesSearch = event.name.toLowerCase().includes(search.toLowerCase());
            const matchesClub = clubFilter === 'all' || event.club_name === clubFilter;
            const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
            return matchesSearch && matchesClub && matchesCategory;
        });
    }, [events, search, clubFilter, categoryFilter]);

    return { filteredEvents, search, setSearch, clubFilter, setClubFilter, categoryFilter, setCategoryFilter };
};
