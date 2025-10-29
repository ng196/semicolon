import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { useEventPermissions } from '../hooks/useEventPermissions';

export default function EventActions({ event, onEdit, onDelete }: any) {
    try {
        const { canEdit, canDelete } = useEventPermissions(event);

        if (!canEdit && !canDelete) return null;

        return (
            <div className="flex gap-2">
                {canEdit && <Button variant="outline" size="sm" onClick={onEdit}><Edit className="h-4 w-4 mr-2" />Edit</Button>}
                {canDelete && <Button variant="destructive" size="sm" onClick={onDelete}><Trash2 className="h-4 w-4 mr-2" />Delete</Button>}
            </div>
        );
    } catch (error) {
        console.error('EventActions render error:', error);
        return null;
    }
}
