import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Label } from '@/shared/components/ui/label';

export default function ClubSelector({ clubs, value, onChange }: any) {
    try {
        return (
            <div>
                <Label>Select Club</Label>
                <Select value={value} onValueChange={onChange}>
                    <SelectTrigger><SelectValue placeholder="Choose a club" /></SelectTrigger>
                    <SelectContent>
                        {clubs?.map((club: any) => <SelectItem key={club.id} value={club.id.toString()}>{club.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
        );
    } catch (error) {
        console.error('ClubSelector render error:', error);
        return null;
    }
}
