import { useState } from "react";
import { Loader2, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { clubsApi } from "@/services/api";
import { useNavigate } from "react-router-dom";

interface ClubSettingsProps {
    clubId: string | number;
    settings: {
        is_private: boolean;
        auto_approve_members: boolean;
    } | null;
    onUpdate: () => void;
    userRole?: string;
}

export default function ClubSettings({ clubId, settings, onUpdate, userRole }: ClubSettingsProps) {
    const navigate = useNavigate();
    const [isPrivate, setIsPrivate] = useState(settings?.is_private || false);
    const [autoApprove, setAutoApprove] = useState(settings?.auto_approve_members || true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

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

    const handleDelete = async () => {
        try {
            setDeleting(true);
            await clubsApi.deleteClub(clubId);
            alert('Club deleted successfully');
            navigate('/clubs');
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete club');
            setDeleting(false);
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

                {/* Delete Club Section - Only for Leaders */}
                {userRole === 'leader' && (
                    <div className="pt-6 border-t border-destructive/20">
                        <h3 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Once you delete a club, there is no going back. This will permanently delete the club, all posts, events, and member data.
                        </p>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" disabled={deleting}>
                                    {deleting ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="mr-2 h-4 w-4" />
                                    )}
                                    Delete Club
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the club
                                        and remove all associated data including posts, events, and member information.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Delete Club
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                )}
            </div>
        </Card>
    );
}
