import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';

export default function VisibilitySelector({ value, onChange }: any) {
    try {
        return (
            <div>
                <Label>Event Visibility</Label>
                <RadioGroup value={value} onValueChange={onChange}>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="public" id="public" /><Label htmlFor="public">Public - Everyone can see</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="members_only" id="members" /><Label htmlFor="members">Members Only</Label></div>
                    <div className="flex items-center space-x-2"><RadioGroupItem value="private" id="private" /><Label htmlFor="private">Private - Leaders only</Label></div>
                </RadioGroup>
            </div>
        );
    } catch (error) {
        console.error('VisibilitySelector render error:', error);
        return null;
    }
}
