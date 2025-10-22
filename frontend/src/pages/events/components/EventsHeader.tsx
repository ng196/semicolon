import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EventsHeader({ onCreateClick, canCreate }: any) {
    try {
        return (
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Events</h1>
                    <p className="text-sm text-muted-foreground">Discover campus events and connect with your community</p>
                </div>
                {canCreate && <Button onClick={onCreateClick}><Plus className="mr-2 h-4 w-4" />Create Event</Button>}
            </div>
        );
    } catch (error) {
        console.error('EventsHeader render error:', error);
        return null;
    }
}
