import EventCard from './EventCard';

export default function EventsList({ events, onEventClick }: any) {
    try {
        if (!events || events.length === 0) {
            return <div className="text-center py-12 text-muted-foreground">No events found</div>;
        }

        return (
            <div className="grid gap-6 md:grid-cols-2">
                {events.map((event: any) => (
                    <EventCard key={event.id} event={event} onClick={onEventClick} />
                ))}
            </div>
        );
    } catch (error) {
        console.error('EventsList render error:', error);
        return <div className="text-center py-12 text-red-600">Error loading events list</div>;
    }
}
