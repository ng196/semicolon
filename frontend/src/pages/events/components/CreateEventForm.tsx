import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export default function CreateEventForm({ formData, setFormData }: any) {
    const handleChange = (field: string, value: any) => {
        try {
            setFormData({ ...formData, [field]: value });
        } catch (error) {
            console.error('CreateEventForm handleChange error:', error);
        }
    };

    try {
        return (
            <div className="space-y-4">
                <div><Label>Event Name</Label><Input value={formData.name} onChange={(e) => handleChange('name', e.target.value)} /></div>
                <div><Label>Description</Label><Textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label>Date</Label><Input type="date" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} /></div>
                    <div><Label>Time</Label><Input type="time" value={formData.time} onChange={(e) => handleChange('time', e.target.value)} /></div>
                </div>
                <div><Label>Location</Label><Input value={formData.location} onChange={(e) => handleChange('location', e.target.value)} /></div>
                <div><Label>Category</Label><Input value={formData.category} onChange={(e) => handleChange('category', e.target.value)} /></div>
            </div>
        );
    } catch (error) {
        console.error('CreateEventForm render error:', error);
        return null;
    }
}
