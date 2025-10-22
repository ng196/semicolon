import { useState, useEffect } from 'react';
import { Crown, Shield, Users, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { hubsApi, clubsApi } from '@/services/api';

const roleIcons = {
    leader: Crown,
    admin: Shield,
    moderator: Users,
    member: User,
};

const roleColors = {
    leader: 'bg-yellow-100 text-yellow-800',
    admin: 'bg-blue-100 text-blue-800',
    moderator: 'bg-green-100 text-green-800',
    member: 'bg-gray-100 text-gray-800',
};

export default function ClubMembers({ clubId, userRole }: { clubId: string; userRole: string | null }) {
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadMembers();
    }, [clubId]);

    const loadMembers = async () => {
        try {
            setLoading(true);
            const memberData = await hubsApi.getMembers(clubId);
            setMembers(memberData);
        } catch (error) {
            console.error('Failed to load members:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (memberId: number, newRole: string) => {
        try {
            await clubsApi.updateMemberRole(clubId, memberId, newRole);
            await loadMembers();
        } catch (error) {
            console.error('Failed to update role:', error);
            alert('Failed to update member role');
        }
    };

    const canManageRoles = userRole === 'leader';

    if (loading) {
        return <div className="text-center py-8">Loading members...</div>;
    }

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">Members ({members.length})</h2>
            </div>

            <div className="space-y-3">
                {members.map((member: any) => {
                    const RoleIcon = roleIcons[member.role as keyof typeof roleIcons] || User;

                    return (
                        <div key={member.user_id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                                <img
                                    src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.user_id}`}
                                    alt={member.name}
                                    className="h-10 w-10 rounded-full"
                                />
                                <div>
                                    <p className="font-medium">{member.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Joined {new Date(member.joined_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Badge className={roleColors[member.role as keyof typeof roleColors]}>
                                    <RoleIcon className="h-3 w-3 mr-1" />
                                    {member.role}
                                </Badge>

                                {canManageRoles && member.role !== 'leader' && (
                                    <Select value={member.role} onValueChange={(newRole) => handleRoleChange(member.user_id, newRole)}>
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="admin">Admin</SelectItem>
                                            <SelectItem value="moderator">Moderator</SelectItem>
                                            <SelectItem value="member">Member</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {members.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No members found</p>
                </div>
            )}
        </Card>
    );
}