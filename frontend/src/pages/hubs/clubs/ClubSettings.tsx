import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { clubsApi } from "@/services/api";

interface ClubSettingsProps {
    clubId: string;
    settings: {
        is_private: boolean;
        auto_approve_members: boolean;
    } | null;
    onUpdate: () => void;
}

export default function ClubSettings({ clubId, settings, onUpdate }: ClubSettingsProps) {
    const [isPrivate, setIsPrivate] = useState(settings?.is_private || false);
    const [autoApprove, setAutoApprove] = useState(settings?.auto_approve_members || true);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        try {
            setSaving(true);
            await clubsApi.updateSettings(clubId, {
                is_private: isPrivate,
                auto_approve_members: autoApprove,
            });
            onUpdate();
            alert('Settings updated successfully');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Club Settings</h2>

            <div className="space-y-6">
                {/* Privacy Setting */}
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="private-club">Private Club</Label>
                        <p className="text-sm text-muted-foreground">
                            Private clubs require approval to join
                        </p>
                    </div>
                    <Switch
                        id="private-club"
                        checked={isPrivate}
                        onCheckedChange={setIsPrivate}
                    />
                </div>

                {/* Auto-approve Setting (only for public clubs) */}
                {!isPrivate && (
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="auto-approve">Auto-approve Members</Label>
                            <p className="text-sm text-muted-foreground">
                                Automatically approve new members for public clubs
                            </p>
                        </div>
                        <Switch
                            id="auto-approve"
                            checked={autoApprove}
                            onCheckedChange={setAutoApprove}
                        />
                    </div>
                )}

                {/* Save Button */}
                <div className="pt-4 border-t">
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        Save Settings
                    </Button>
                </div>
            </div>
        </Card>
    );
}
