import { useState, useEffect } from "react";
import { Users, Star, Calendar, Settings, UserPlus, UserMinus, Edit, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/components/ui/dialog";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/components/ui/avatar";
import { Separator } from "@/shared/components/ui/separator";
import { hubsApi } from "@/api/client";
import { useToast } from "@/shared/hooks/use-toast";
import { CategoryBadge } from "@/shared/components/badges/CategoryBadge";

interface Hub {
    id: string | number;
    name: string;
    type: string;
    description: string;
    icon: string;
    specialization: string;
    year: string;
    members: number;
    rating: number;
    interests: string[];
    color: string;
    creator_id: number;
    created_at: string;
}

interface Member {
    id: number;
    name: string;
    username: string;
    avatar: string | null;
    specialization: string;
    year: string;
    role: string;
    joined_at: string;
}

interface HubDetailsModalProps {
    hub: Hub | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onHubUpdated: () => void;
}

export function HubDetailsModal({ hub, open, onOpenChange, onHubUpdated }: HubDetailsModalProps) {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(false);
    const [isJoined, setIsJoined] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (hub && open) {
            loadMembers();
        }
    }, [hub, open]);

    const loadMembers = async () => {
        if (!hub) return;

        try {
            setLoading(true);
            const data = await hubsApi.getMembers(hub.id);
            setMembers(data);
            // Check if current user is a member (you'd get this from auth context)
            setIsJoined(data.some((member: Member) => member.id === 1)); // Replace with actual user ID
        } catch (error) {
            console.error('Error loading members:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinHub = async () => {
        if (!hub) return;

        try {
            await hubsApi.addMember(hub.id, { user_id: 1, role: 'member' }); // Replace with actual user ID
            toast({
                title: "Joined Hub!",
                description: `You've successfully joined ${hub.name}`,
            });
            setIsJoined(true);
            loadMembers();
            onHubUpdated();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to join hub",
                variant: "destructive"
            });
        }
    };

    const handleLeaveHub = async () => {
        if (!hub) return;

        try {
            await hubsApi.removeMember(hub.id, { user_id: 1 }); // Replace with actual user ID
            toast({
                title: "Left Hub",
                description: `You've left ${hub.name}`,
            });
            setIsJoined(false);
            loadMembers();
            onHubUpdated();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to leave hub",
                variant: "destructive"
            });
        }
    };

    const handleDeleteHub = async () => {
        if (!hub) return;

        if (!confirm(`Are you sure you want to delete "${hub.name}"? This action cannot be undone.`)) {
            return;
        }

        try {
            await hubsApi.delete(hub.id);
            toast({
                title: "Hub Deleted",
                description: `${hub.name} has been deleted successfully`,
            });
            onOpenChange(false);
            onHubUpdated();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to delete hub",
                variant: "destructive"
            });
        }
    };

    if (!hub) return null;

    const isCreator = hub.creator_id === 1; // Replace with actual user ID check

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`flex h-16 w-16 items-center justify-center rounded-xl bg-${hub.color}-100`}>
                                <span className="text-2xl">
                                    {hub.icon === 'code' && '💻'}
                                    {hub.icon === 'camera' && '📷'}
                                    {hub.icon === 'leaf' && '🌿'}
                                    {hub.icon === 'brain' && '🧠'}
                                    {hub.icon === 'gamepad' && '🎮'}
                                    {hub.icon === 'tree' && '🌳'}
                                    {hub.icon === 'smartphone' && '📱'}
                                </span>
                            </div>
                            <div>
                                <DialogTitle className="text-2xl">{hub.name}</DialogTitle>
                                <div className="flex items-center gap-2 mt-1">
                                    <CategoryBadge category={hub.type} />
                                    <span className="text-sm text-muted-foreground">
                                        Created {new Date(hub.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {isCreator && (
                                <>
                                    <Button variant="outline" size="sm">
                                        <Edit className="h-4 w-4 mr-1" />
                                        Edit
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={handleDeleteHub}>
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Delete
                                    </Button>
                                </>
                            )}
                            {!isCreator && (
                                <Button
                                    onClick={isJoined ? handleLeaveHub : handleJoinHub}
                                    variant={isJoined ? "outline" : "default"}
                                >
                                    {isJoined ? (
                                        <>
                                            <UserMinus className="h-4 w-4 mr-1" />
                                            Leave Hub
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="h-4 w-4 mr-1" />
                                            Join Hub
                                        </>
                                    )}
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Hub Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-foreground">{hub.members}</div>
                            <div className="text-sm text-muted-foreground">Members</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-foreground flex items-center justify-center gap-1">
                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                {hub.rating}
                            </div>
                            <div className="text-sm text-muted-foreground">Rating</div>
                        </div>
                        <div className="text-center p-4 bg-muted rounded-lg">
                            <div className="text-2xl font-bold text-foreground">{hub.type}</div>
                            <div className="text-sm text-muted-foreground">Type</div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <h3 className="font-semibold mb-2">About</h3>
                        <p className="text-muted-foreground">{hub.description}</p>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <h4 className="font-medium mb-1">Specialization</h4>
                            <p className="text-sm text-muted-foreground">{hub.specialization || 'All'}</p>
                        </div>
                        <div>
                            <h4 className="font-medium mb-1">Target Year</h4>
                            <p className="text-sm text-muted-foreground">{hub.year || 'All Years'}</p>
                        </div>
                    </div>

                    {/* Interests */}
                    {hub.interests.length > 0 && (
                        <div>
                            <h3 className="font-semibold mb-2">Interests & Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {hub.interests.map((interest) => (
                                    <Badge key={interest} variant="secondary">
                                        {interest}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <Separator />

                    {/* Tabs for Members, Activity, etc. */}
                    <Tabs defaultValue="members" className="w-full">
                        <TabsList>
                            <TabsTrigger value="members">Members ({hub.members})</TabsTrigger>
                            <TabsTrigger value="activity">Activity</TabsTrigger>
                            <TabsTrigger value="resources">Resources</TabsTrigger>
                        </TabsList>

                        <TabsContent value="members" className="space-y-4">
                            {loading ? (
                                <div className="text-center py-8 text-muted-foreground">Loading members...</div>
                            ) : (
                                <div className="space-y-3">
                                    {members.map((member) => (
                                        <div key={member.id} className="flex items-center justify-between p-3 rounded-lg border">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarImage src={member.avatar || undefined} />
                                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium">{member.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        @{member.username} • {member.specialization} • {member.year}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={member.role === 'creator' ? 'default' : 'secondary'}>
                                                    {member.role}
                                                </Badge>
                                                <span className="text-xs text-muted-foreground">
                                                    Joined {new Date(member.joined_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="activity" className="space-y-4">
                            <div className="text-center py-8 text-muted-foreground">
                                Activity feed coming soon...
                            </div>
                        </TabsContent>

                        <TabsContent value="resources" className="space-y-4">
                            <div className="text-center py-8 text-muted-foreground">
                                Resources and files coming soon...
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}