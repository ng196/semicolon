import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useEventEdit } from '../hooks/useEventEdit';
import { useToast } from '@/hooks/use-toast';

interface EditEventModalProps {
    event: any;
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function EditEventModal({ event, open, onClose, onSuccess }: EditEventModalProps) {
    const { updateEvent, loading } = useEventEdit(() => {
        onSuccess();
        onClose();
    });
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        date: '',
        time: '',
        location: '',
        category: '',
        specialization: '',
        capacity: 100,
        color: ''
    });

    // Pre-populate form when event changes
    useEffect(() => {
        if (event && open) {
            setFormData({
                name: event.name || '',
                description: event.description || '',
                date: event.date || '',
                time: event.time || '',
                location: event.location || '',
                category: event.category || '',
                specialization: event.specialization || '',
                capacity: event.capacity || 100,
                color: event.color || ''
            });
        }
    }, [event, open]);

    const handleChange = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name || !formData.description || !formData.date || !formData.time || !formData.location) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields.",
                variant: "destructive"
            });
            return;
        }

        try {
            await updateEvent(event.id, formData);
            toast({
                title: "Event Updated",
                description: "Event has been updated successfully.",
            });
        } catch (error) {
            console.error('Update event error:', error);
            toast({
                title: "Error",
                description: "Failed to update event. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handleClose = () => {
        onClose();
        // Reset form when closing
        setFormData({
            name: '',
            description: '',
            date: '',
            time: '',
            location: '',
            category: '',
            specialization: '',
            capacity: 100,
            color: ''
        });
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Event</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Update the event details below.
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Event Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="Enter event name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Describe your event"
                            rows={4}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Date *</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => handleChange('date', e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="time">Time *</Label>
                            <Input
                                id="time"
                                type="time"
                                value={formData.time}
                                onChange={(e) => handleChange('time', e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="location">Location *</Label>
                        <Input
                            id="location"
                            value={formData.location}
                            onChange={(e) => handleChange('location', e.target.value)}
                            placeholder="Event location"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="category">Category</Label>
                        <Input
                            id="category"
                            value={formData.category}
                            onChange={(e) => handleChange('category', e.target.value)}
                            placeholder="e.g., Workshop, Conference, Social"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="specialization">Specialization</Label>
                            <Input
                                id="specialization"
                                value={formData.specialization}
                                onChange={(e) => handleChange('specialization', e.target.value)}
                                placeholder="Target specialization"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="capacity">Capacity</Label>
                            <Input
                                id="capacity"
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => handleChange('capacity', parseInt(e.target.value) || 100)}
                                placeholder="Maximum attendees"
                                min="1"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="color">Theme Color</Label>
                        <Input
                            id="color"
                            value={formData.color}
                            onChange={(e) => handleChange('color', e.target.value)}
                            placeholder="e.g., blue, red, green"
                        />
                    </div>

                    <div className="flex gap-2">
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Updating...' : 'Update Event'}
                        </Button>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}