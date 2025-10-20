import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, AlertCircle, Users, Star, ArrowLeft, Settings, UserPlus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { hubsApi, clubsApi } from "@/services/api";
import ClubPosts from "./ClubPosts";
import ClubSettings from "./ClubSettings";
import JoinRequestsPanel from "./JoinRequestsPanel";

interface Club {
    id: number;
    name: string;
    type: string;
    description: string;
    icon: string;
    specialization: string;
    year: string;
    creator_id: number;
    rating: number;
    color: string;
    members: number;
    interests: string[];
}

interface ClubSettings {
    is_private: boolean;
    auto_approve_members: boolean;
}

export default function ClubPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [club, setClub] = useState<Club | null>(null);
    const [settings, setSettings] = useState<ClubSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMember, setIsMember] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("about");
    const [joinLoading, setJoinLoading] = useState(false);

    useEffect(() => {
        if (id) {
            loadClubData();
        }
    }, [id]);

    const loadClubData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Load club details
            const clubData = await hubsApi.getById(id!);
            setClub(clubData);

            // Load club settings
            try {
                const settingsData = await clubsApi.getSettings(id!);
                setSettings(settingsData);
            } catch (err) {
                console.log('No settings found, club might not be configured yet');
            }

            // Check membership status
            const members = await hubsApi.getMembers(id!);
            const currentUser = JSON.parse(localStorage.getItem('user_data') || '{}');
            const membership = members.find((m: any) => m.id === currentUser.id);

            if (membership) {
                setIsMember(true);
                setUserRole(membership.role);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load club');
            console.error('Error loading club:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinClub = async () => {
        try {
            setJoinLoading(true);

            if (settings?.is_private) {
                // Send join request for private clubs
                await clubsApi.requestToJoin(id!, '');
                alert('Join request sent! Waiting for approval.');
            } else {
                // Join directly for public clubs
                await clubsApi.joinPublicClub(id!);
                setIsMember(true);
                setUserRole('member');
                loadClubData();
            }
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to join club');
        } finally {
            setJoinLoading(false);
        }
    };

    const handleLeaveClub = async () => {
        if (!confirm('Are you sure you want to leave this club?')) return;

        try {
            await clubsApi.leaveClub(id!);
            setIsMember(false);
            setUserRole(null);
            loadClubData();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to leave club');
        }
    };

    const canManageClub = userRole === 'leader' || userRole === 'admin';

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error || !club) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <p className="text-lg text-muted-foreground">{error || 'Club not found'}</p>
                <Button onClick={() => navigate('/clubs')}>Back to Clubs</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={() => navigate('/clubs')}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Clubs
                </Button>

                <Card className="p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold">{club.name}</h1>
                                {settings?.is_private && (
                                    <Badge variant="secondary">Private</Badge>
                                )}
                            </div>
                            <p className="text-muted-foreground mb-4">{club.description}</p>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    {club.members} members
                                </span>
                                <span className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    {club.rating}
                                </span>
                                {club.specialization && (
                                    <span>Specialization: {club.specialization}</span>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {!isMember ? (
                                <Button onClick={handleJoinClub} disabled={joinLoading}>
                                    {joinLoading ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <UserPlus className="mr-2 h-4 w-4" />
                                    )}
                                    {settings?.is_private ? 'Request to Join' : 'Join Club'}
                                </Button>
                            ) : (
                                <>
                                    {canManageClub && (
                                        <Button
                                            variant="outline"
                                            onClick={() => setActiveTab('settings')}
                                        >
                                            <Settings className="mr-2 h-4 w-4" />
                                            Settings
                                        </Button>
                                    )}
                                    {userRole !== 'leader' && (
                                        <Button
                                            variant="outline"
                                            onClick={handleLeaveClub}
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Leave Club
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="about">About</TabsTrigger>
                    {isMember && <TabsTrigger value="posts">Posts</TabsTrigger>}
                    {isMember && <TabsTrigger value="events">Events</TabsTrigger>}
                    {isMember && <TabsTrigger value="members">Members</TabsTrigger>}
                    {canManageClub && <TabsTrigger value="settings">Settings</TabsTrigger>}
                </TabsList>

                <TabsContent value="about">
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold mb-4">About</h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="font-medium mb-2">Description</h3>
                                <p className="text-muted-foreground">{club.description}</p>
                            </div>

                            {club.interests && club.interests.length > 0 && (
                                <div>
                                    <h3 className="font-medium mb-2">Interests</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {club.interests.map((interest) => (
                                            <Badge key={interest} variant="secondary">
                                                {interest}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </TabsContent>

                {isMember && (
                    <TabsContent value="posts">
                        <ClubPosts clubId={id!} userRole={userRole} />
                    </TabsContent>
                )}

                {isMember && (
                    <TabsContent value="events">
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Events</h2>
                            <p className="text-muted-foreground">Club events will be displayed here.</p>
                        </Card>
                    </TabsContent>
                )}

                {isMember && (
                    <TabsContent value="members">
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Members</h2>
                            {canManageClub && <JoinRequestsPanel clubId={id!} />}
                            <p className="text-muted-foreground mt-4">Member list will be displayed here.</p>
                        </Card>
                    </TabsContent>
                )}

                {canManageClub && (
                    <TabsContent value="settings">
                        <ClubSettings clubId={id!} settings={settings} onUpdate={loadClubData} />
                    </TabsContent>
                )}
            </Tabs>
        </div>
    );
}
