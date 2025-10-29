import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { clubsApi } from "@/api/client";

interface ClubEventFormProps {
    clubId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export default function ClubEventForm({ clubId, onSuccess, onCancel }: ClubEventFormProps) {
    const [eventId, setEventId] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [targetAudience, setTargetAudience] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!eventId) {
            alert('Event ID is required');
            return;
        }

        try {
            setSubmitting(true);
            await clubsApi.createEvent(clubId, {
                event_id: parseInt(eventId),
                visibility,
                target_audience: targetAudience,
            });
            onSuccess();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to create club event');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Link Event to Club</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="event-id">Event ID</Label>
                    <Input
                        id="event-id"
                        type="number"
                        placeholder="Enter event ID"
                        value={eventId}
                        onChange={(e) => setEventId(e.target.value)}
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="visibility">Visibility</Label>
                    <Select value={visibility} onValueChange={setVisibility}>
                        <SelectTrigger id="visibility">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="public">Public - Visible to everyone</SelectItem>
                            <SelectItem value="members_only">Members Only - Only club members</SelectItem>
                            <SelectItem value="private">Private - Only admins and leaders</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div>
                    <Label htmlFor="target-audience">Target Audience (Optional)</Label>
                    <Textarea
                        id="target-audience"
                        placeholder="Describe the target audience for this event"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        rows={3}
                    />
                </div>

                <div className="flex gap-2">
                    <Button type="submit" disabled={submitting}>
                        {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Club Event
                    </Button>
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Card>
    );
}
