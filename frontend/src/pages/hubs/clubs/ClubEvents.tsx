import { useState, useEffect } from 'react';
import { Plus, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { eventsApi } from '@/services/api';
import CreateEventModal from '../../events/components/CreateEventModal';
import EventDetailsModal from '../../events/components/EventDetailsModal';

export default function ClubEvents({ clubId, userRole }: { clubId: string; userRole: string | null }) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);

    useEffect(() => {
        loadEvents();
    }, [clubId]);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const allEvents = await eventsApi.getAll();
            const clubEvents = allEvents.filter((event: any) => event.club_id === parseInt(clubId));
            setEvents(clubEvents);
        } catch (error) {
            console.error('Failed to load club events:', error);
        } finally {
            setLoading(false);
        }
    };

    const canCreateEvents = userRole === 'leader' || userRole === 'admin' || userRole === 'creator';

    if (loading) {
        return <div className="text-center py-8">Loading events...</div>;
    }

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Club Events</h2>
                {canCreateEvents && (
                    <Button onClick={() => setShowCreateModal(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Event
                    </Button>
                )}
            </div>

            {events.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No events yet</p>
                    {canCreateEvents && <p className="text-sm">Create your first event to get started!</p>}
                </div>
            ) : (
                <div className="space-y-4">
                    {events.map((event: any) => (
                        <Card
                            key={event.id}
                            className="p-4 hover:shadow-lg transition-all cursor-pointer group"
                            onClick={() => setSelectedEvent(event)}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-semibold group-hover:text-primary transition-colors">{event.name}</h3>
                                        <Badge variant={event.visibility === 'public' ? 'default' : 'secondary'}>
                                            {event.visibility}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description}</p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {event.date}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {event.time}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4" />
                                            {event.location}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            {event.attending} going
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <CreateEventModal
                    open={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        loadEvents();
                        setShowCreateModal(false);
                    }}
                    clubs={[{ id: parseInt(clubId), name: 'Current Club' }]}
                    preselectedClubId={clubId}
                />
            )}

            {selectedEvent && (
                <EventDetailsModal
                    event={selectedEvent}
                    open={!!selectedEvent}
                    onClose={() => setSelectedEvent(null)}
                    onUpdate={loadEvents}
                />
            )}
        </Card>
    );
}