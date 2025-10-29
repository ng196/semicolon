import { useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import EventsHeader from './EventsHeader';
import EventsFilters from './EventsFilters';
import EventsList from './EventsList';
import CreateEventModal from './CreateEventModal';
import EventDetailsModal from './EventDetailsModal';
import EventErrorBoundary from './EventErrorBoundary';
import { useEventsQuery } from '../hooks/queries';
import { useEventFilters } from '../hooks/useEventFilters';
import { useUserClubs } from '../hooks/useUserClubs';

export default function EventsPageNew() {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);

    // Using new standardized query hooks
    const {
        data: events = [],
        isLoading: loading,
        error,
        refetch
    } = useEventsQuery();

    const { clubs, loading: clubsLoading } = useUserClubs();
    const { filteredEvents, search, setSearch, clubFilter, setClubFilter, categoryFilter, setCategoryFilter } = useEventFilters(events);

    const uniqueClubs = useMemo(() => [...new Set(events.map((e: any) => e.club_name).filter(Boolean))], [events]);
    const canCreate = clubs.length > 0;

    if (loading) return <div className="flex justify-center items-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    if (error) return <div className="text-center py-12 text-red-600">Error: {error.message}</div>;

    return (
        <EventErrorBoundary>
            <div className="p-4 sm:p-6">
                <div className="max-w-7xl mx-auto">
                    <EventsHeader onCreateClick={() => setShowCreateModal(true)} canCreate={canCreate} />
                    <EventsFilters
                        search={search}
                        setSearch={setSearch}
                        clubFilter={clubFilter}
                        setClubFilter={setClubFilter}
                        categoryFilter={categoryFilter}
                        setCategoryFilter={setCategoryFilter}
                        clubs={uniqueClubs}
                    />
                    <EventsList events={filteredEvents} onEventClick={setSelectedEvent} />
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
                            onClose={() => setSelectedEvent(null)}
                            onUpdate={() => refetch()}
                        />
                    )}
                </div>
            </div>
        </EventErrorBoundary>
    );
}