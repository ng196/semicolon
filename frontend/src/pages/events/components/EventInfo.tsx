import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import EventClubBadge from './EventClubBadge';

export default function EventInfo({ event }: any) {
    try {
        if (!event) {
            console.error('EventInfo: No event data provided');
            return null;
        }

        return (
            <div className="space-y-4">
                <div className="flex items-start justify-between">
                    <h2 className="text-2xl font-bold">{event.name}</h2>
                    <EventClubBadge club={event} />
                </div>
                <p className="text-muted-foreground">{event.description}</p>
                <div className="space-y-2">
                    <div className="flex items-center gap-2"><Calendar className="h-4 w-4" />{event.date}</div>
                    <div className="flex items-center gap-2"><Clock className="h-4 w-4" />{event.time}</div>
                    <div className="flex items-center gap-2"><MapPin className="h-4 w-4" />{event.location}</div>
                    <div className="flex items-center gap-2"><Users className="h-4 w-4" />{event.attending}/{event.capacity} attending</div>
                </div>
            </div>
        );
    } catch (error) {
        console.error('EventInfo render error:', error);
        return null;
    }
}
