import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import CreateEventForm from './CreateEventForm';
import ClubSelector from './ClubSelector';
import VisibilitySelector from './VisibilitySelector';
import { useEventCreation } from '../hooks/useEventCreation';

export default function CreateEventModal({ open, onClose, onSuccess, clubs, preselectedClubId }: any) {
    try {
        const [formData, setFormData] = useState({
            name: '',
            description: '',
            date: '',
            time: '',
            location: '',
            category: '',
            club_id: preselectedClubId || '',
            visibility: 'public'
        });
        const { createEvent, loading } = useEventCreation(() => { onSuccess(); onClose(); });

        const handleSubmit = async () => {
            try {
                await createEvent(formData);
            } catch (error) {
                console.error('Create event error:', error);
            }
        };

        return (
            <Dialog open={open} onOpenChange={onClose}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader><DialogTitle>Create New Event</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                        <ClubSelector clubs={clubs} value={formData.club_id} onChange={(v: string) => setFormData({ ...formData, club_id: v })} />
                        <CreateEventForm formData={formData} setFormData={setFormData} />
                        <VisibilitySelector value={formData.visibility} onChange={(v: string) => setFormData({ ...formData, visibility: v })} />
                        <Button onClick={handleSubmit} disabled={loading} className="w-full">{loading ? 'Creating...' : 'Create Event'}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    } catch (error) {
        console.error('CreateEventModal render error:', error);
        return null;
    }
}
