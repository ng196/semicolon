import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import EventClubBadge from './EventClubBadge';

export default function EventCard({ event, onClick }: any) {
    try {
        if (!event) {
            console.error('EventCard: No event data provided');
            return null;
        }

        const attendancePercentage = (event.attending / event.capacity) * 100;

        return (
            <Card className="p-6 cursor-pointer hover:shadow-lg transition-all group" onClick={() => onClick(event)}>
                <div className="flex items-start justify-between mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors`}>
                        <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <EventClubBadge club={event} />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">{event.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{event.description}</p>
                <div className="space-y-2 text-sm mb-4">
                    <div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4" />{event.date}</div>
                    <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" />{event.time}</div>
                    <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />{event.location}</div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">{event.attending} going</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{attendancePercentage.toFixed(0)}% full</div>
                </div>
            </Card>
        );
    } catch (error) {
        console.error('EventCard render error:', error);
        return null;
    }
}
