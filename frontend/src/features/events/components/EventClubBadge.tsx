import { Badge } from '@/shared/components/ui/badge';

export default function EventClubBadge({ club }: any) {
    try {
        if (!club?.club_name) return null;

        return (
            <Badge variant="secondary" className="flex items-center gap-1">
                <span>{club.club_name}</span>
            </Badge>
        );
    } catch (error) {
        console.error('EventClubBadge render error:', error);
        return null;
    }
}
