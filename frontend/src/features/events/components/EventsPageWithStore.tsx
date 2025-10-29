import { useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import EventsHeader from './EventsHeader';
import EventsFilters from './EventsFilters';
import EventsList from './EventsList';
import CreateEventModal from './CreateEventModal';
import EventDetailsModal from './EventDetailsModal';
import EventErrorBoundary from './EventErrorBoundary';
import { useEventsQuery } from '../hooks/queries';
import { useUserClubs } from '../hooks/useUserClubs';
import {
    useEventsStore,
    useEventFilters,
    useSelectedEvent,
    useEventModals
} from '../stores/eventsStore';

export default function EventsPageWithStore() {
    // Global state from Zustand store
    const { selectedEventId, setSelectedEventId } = useSelectedEvent();
    const { filters, updateFilters, clearFilters } = useEventFilters();
    const { showCreateModal, setShowCreateModal } = useEventModals();

    // Data fetching with TanStack Query
    const {
        data: events = [],
        isLoading: loading,
        error,
        refetch
    } = useEventsQuery();

    const { clubs, loading: clubsLoading } = useUserClubs();

    // Filter events based on store filters
    const filteredEvents = useMemo(() => {
        return events.filter((event: any) => {
            const matchesSearch = event.name.toLowerCase().includes(filters.search.toLowerCase());
            const matchesClub = filters.clubFilter === 'all' || event.club_name === filters.clubFilter;
            const matchesCategory = filters.categoryFilter === 'all' || event.category === filters.categoryFilter;

            // Date filtering
            let matchesDate = true;
            if (filters.dateFilter !== 'all') {
                const eventDate = new Date(event.date);
                const now = new Date();

                switch (filters.dateFilter) {
                    case 'today':
                        matchesDate = eventDate.toDateString() === now.toDateString();
                        break;
                    case 'week':
                        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                        matchesDate = eventDate >= now && eventDate <= weekFromNow;
                        break;
                    case 'month':
                        const monthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
                        matchesDate = eventDate >= now && eventDate <= monthFromNow;
                        break;
                }
            }

            return matchesSearch && matchesClub && matchesCategory && matchesDate;
        });
    }, [events, filters]);

    const uniqueClubs = useMemo(() =>
        [...new Set(events.map((e: any) => e.club_name).filter(Boolean))],
        [events]
    );

    const canCreate = clubs.length > 0;
    const selectedEvent = selectedEventId ? events.find((e: any) => e.id === selectedEventId) : null;

    if (loading) {
        return (
            <div className="flex justify-center items-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-600">
                Error: {error.message}
            </div>
        );
    }

    return (
        <EventErrorBoundary>
            <div className="p-4 sm:p-6">
                <div className="max-w-7xl mx-auto">
                    <EventsHeader
                        onCreateClick={() => setShowCreateModal(true)}
                        canCreate={canCreate}
                    />

                    <EventsFilters
                        search={filters.search}
                        setSearch={(search) => updateFilters({ search })}
                        clubFilter={filters.clubFilter}
                        setClubFilter={(clubFilter) => updateFilters({ clubFilter })}
                        categoryFilter={filters.categoryFilter}
                        setCategoryFilter={(categoryFilter) => updateFilters({ categoryFilter })}
                        clubs={uniqueClubs}
                        onClearFilters={clearFilters}
                    />

                    <EventsList
                        events={filteredEvents}
                        onEventClick={setSelectedEventId}
                    />

                    {showCreateModal && (
                        <CreateEventModal
                            open={showCreateModal}
                            onClose={() => setShowCreateModal(false)}
                            onSuccess={() => refetch()}
                            clubs={clubs}
                        />
                    )}

                    {selectedEvent && (
                        <EventDetailsModal
                            event={selectedEvent}
                            open={!!selectedEvent}
                            onClose={() => setSelectedEventId(null)}
                            onUpdate={() => refetch()}
                        />
                    )}
                </div>
            </div>
        </EventErrorBoundary>
    );
}