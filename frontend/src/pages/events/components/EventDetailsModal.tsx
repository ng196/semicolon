import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, X, Star, Share2, Mail, MapPin, Calendar, Clock, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import EventClubBadge from './EventClubBadge';
import EventActions from './EventActions';
import { eventsApi } from '@/services/api';
import { useEventRSVP } from '../hooks/useEventRSVP';
import { useToast } from '@/hooks/use-toast';

export default function EventDetailsModal({ event, open, onClose, onUpdate }: any) {
    try {
        const { userStatus, attendees, loading, updateRSVP } = useEventRSVP(event?.id);
        const { toast } = useToast();
        const [showAttendees, setShowAttendees] = useState(false);

        const handleRSVP = async (status: string) => {
            try {
                await updateRSVP(status);
                toast({
                    title: 'RSVP Updated!',
                    description: status === 'going' ? "You're going to this event" : status === 'interested' ? "Marked as interested" : "Updated your response"
                });
                // Refresh the events list to update attending count
                onUpdate();
            } catch (error) {
                console.error('RSVP error:', error);
                toast({ title: 'Error', description: 'Failed to update RSVP', variant: 'destructive' });
            }
        };

        const handleDelete = async () => {
            try {
                await eventsApi.delete(event.id);
                toast({ title: 'Event deleted', description: 'Event has been removed' });
                onUpdate();
                onClose();
            } catch (error) {
                console.error('Delete event error:', error);
                toast({ title: 'Error', description: 'Failed to delete event', variant: 'destructive' });
            }
        };

        const handleShare = () => {
            navigator.clipboard.writeText(window.location.origin + '/events');
            toast({ title: 'Link copied!', description: 'Event link copied to clipboard' });
        };

        const handleContact = () => {
            toast({ title: 'Contact organizer', description: `Reach out to ${event.club_name || event.organizer}` });
        };

        if (!event) return null;

        return (
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <DialogTitle className="text-2xl mb-2">{event.name}</DialogTitle>
                                <EventClubBadge club={event} />
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Event Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <Calendar className="h-5 w-5 text-primary" />
                                <div><div className="text-xs text-muted-foreground">Date</div><div className="font-medium">{event.date}</div></div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                <Clock className="h-5 w-5 text-primary" />
                                <div><div className="text-xs text-muted-foreground">Time</div><div className="font-medium">{event.time}</div></div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg col-span-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                <div><div className="text-xs text-muted-foreground">Location</div><div className="font-medium">{event.location}</div></div>
                            </div>
                        </div>

                        {/* Description */}
                        <div><h3 className="font-semibold mb-2">About this event</h3><p className="text-muted-foreground">{event.description}</p></div>

                        {/* Attendees */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    {attendees.length} {attendees.length === 1 ? 'person' : 'people'} going
                                </h3>
                                {attendees.length > 0 && (
                                    <Button variant="ghost" size="sm" onClick={() => setShowAttendees(!showAttendees)}>
                                        {showAttendees ? 'Hide' : 'Show'} attendees
                                    </Button>
                                )}
                            </div>
                            {showAttendees && attendees.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                    {attendees.map((attendee: any) => (
                                        <div key={attendee.user_id} className="flex flex-col items-center gap-1">
                                            <img
                                                src={attendee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${attendee.user_id}`}
                                                alt={attendee.name}
                                                className="h-12 w-12 rounded-full border-2 border-background shadow-sm"
                                            />
                                            <span className="text-xs text-center truncate w-full">{attendee.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {attendees.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-4">No one has RSVP'd yet. Be the first!</p>
                            )}
                        </div>

                        {/* RSVP Buttons */}
                        <div className="flex gap-2">
                            <Button
                                className="flex-1"
                                variant={userStatus === 'going' ? 'default' : 'outline'}
                                onClick={() => handleRSVP('going')}
                                disabled={loading}
                            >
                                <Check className="h-4 w-4 mr-2" />
                                {userStatus === 'going' ? "You're Going" : 'Going'}
                            </Button>
                            <Button
                                className="flex-1"
                                variant={userStatus === 'interested' ? 'default' : 'outline'}
                                onClick={() => handleRSVP('interested')}
                                disabled={loading}
                            >
                                <Star className="h-4 w-4 mr-2" />
                                {userStatus === 'interested' ? 'Interested' : 'Interested'}
                            </Button>
                            <Button
                                className="flex-1"
                                variant={userStatus === 'not_going' ? 'secondary' : 'outline'}
                                onClick={() => handleRSVP('not_going')}
                                disabled={loading}
                            >
                                <X className="h-4 w-4 mr-2" />
                                {userStatus === 'not_going' ? "Can't Go" : "Can't Go"}
                            </Button>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4 border-t">
                            <Button variant="outline" className="flex-1" onClick={handleShare}><Share2 className="h-4 w-4 mr-2" />Share Event</Button>
                            <Button variant="outline" className="flex-1" onClick={handleContact}><Mail className="h-4 w-4 mr-2" />Contact Organizer</Button>
                        </div>

                        {/* Admin Actions */}
                        <EventActions event={event} onEdit={() => console.log('Edit')} onDelete={handleDelete} />
                    </div>
                </DialogContent>
            </Dialog>
        );
    } catch (error) {
        console.error('EventDetailsModal render error:', error);
        return null;
    }
}
