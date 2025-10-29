import { useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Card } from "@/shared/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/components/ui/select";
import { Progress } from "@/shared/components/ui/progress";
import {
    Search,
    UserPlus,
    Filter,
    MessageCircle,
    Users as UsersIcon,
    Loader2,
    AlertCircle
} from "lucide-react";
import { usersApi } from "@/api/client";

interface User {
    id: number;
    name: string;
    specialization: string;
    year: string;
    avatar: string;
    online?: boolean;
    sharedClasses?: string[];
    attendanceRate?: number;
    interests?: string[];
    lastSeen?: string;
}

export function NetworkOriginal() {
    const [activeTab, setActiveTab] = useState("my-classes");
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await usersApi.getAll();
            // Filter out current user (id: 1)
            setUsers(data.filter((user: User) => user.id !== 1));
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load users');
            console.error('Error loading users:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleContactUser = (user: User) => {
        // TODO: Implement messaging functionality
        console.log('Contact user:', user.name);
        alert(`Opening chat with ${user.name}...`);
    };

    const handleAddFriend = (user: User) => {
        // TODO: Implement add friend functionality
        console.log('Add friend:', user.name);
        alert(`Friend request sent to ${user.name}!`);
    };

    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <header className="border-b border-border bg-card">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Network</h1>
                            <p className="text-sm text-muted-foreground">
                                Connect with classmates, friends, and club members
                            </p>
                        </div>
                        <Button className="bg-primary hover:bg-primary/90">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Add Friend
                        </Button>
                    </div>

                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList>
                            <TabsTrigger value="my-classes">My Classes</TabsTrigger>
                            <TabsTrigger value="friends">Friends</TabsTrigger>
                            <TabsTrigger value="club-members">Club Members</TabsTrigger>
                            <TabsTrigger value="discover">Discover People</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </header>

            <div className="flex-1 p-4 sm:p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-1 gap-2">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search users by name or specialization..."
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Select defaultValue="all-spec">
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="All Specializations" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all-spec">All Specializations</SelectItem>
                                    <SelectItem value="cs">Computer Science</SelectItem>
                                    <SelectItem value="math">Mathematics</SelectItem>
                                    <SelectItem value="eng">Engineering</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select defaultValue="all-years">
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="All Years" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all-years">All Years</SelectItem>
                                    <SelectItem value="junior">Junior</SelectItem>
                                    <SelectItem value="sophomore">Sophomore</SelectItem>
                                    <SelectItem value="senior">Senior</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select defaultValue="all-classes">
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="All Classes" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all-classes">All Classes</SelectItem>
                                    <SelectItem value="cs301">CS 301</SelectItem>
                                    <SelectItem value="math201">MATH 201</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {loading && (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="ml-2 text-muted-foreground">Loading network...</span>
                        </div>
                    )}

                    {error && (
                        <Card className="p-6 border-red-200 bg-red-50">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <div>
                                    <p className="font-medium text-red-900">Failed to load network</p>
                                    <p className="text-sm text-red-700">{error}</p>
                                </div>
                                <Button onClick={loadUsers} variant="outline" size="sm" className="ml-auto">
                                    Retry
                                </Button>
                            </div>
                        </Card>
                    )}

                    {!loading && !error && (
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {users.map((user) => (
                                <Card
                                    key={user.id}
                                    className="group overflow-hidden transition-all hover:shadow-lg cursor-pointer"
                                    onClick={() => handleContactUser(user)}
                                >
                                    <div className="p-6">
                                        <div className="mb-4 flex items-start gap-4">
                                            <div className="relative">
                                                <img
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    className="h-16 w-16 rounded-full"
                                                />
                                                {user.online && (
                                                    <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                                                    {user.name}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.specialization} • {user.year}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {user.lastSeen}
                                                </p>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleContactUser(user);
                                                    }}
                                                >
                                                    <MessageCircle className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddFriend(user);
                                                    }}
                                                >
                                                    <UsersIcon className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>

                                        <div className="mb-4">
                                            <p className="mb-2 text-sm font-medium text-foreground">
                                                Shared Classes:
                                                <span className="ml-2 text-muted-foreground">
                                                    {user.sharedClasses?.length || 0} classes
                                                </span>
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {user.sharedClasses?.map((cls) => (
                                                    <span
                                                        key={cls}
                                                        className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"
                                                    >
                                                        {cls}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {user.attendanceRate !== undefined && user.attendanceRate !== null && (
                                            <div className="mb-4">
                                                <div className="mb-2 flex items-center justify-between text-sm">
                                                    <span className="text-muted-foreground">Attendance Rate:</span>
                                                    <span className="font-semibold text-foreground">
                                                        {user.attendanceRate}%
                                                    </span>
                                                </div>
                                                <Progress
                                                    value={user.attendanceRate}
                                                    className={`h-2 ${user.attendanceRate >= 95
                                                        ? "[&>div]:bg-green-500"
                                                        : user.attendanceRate >= 90
                                                            ? "[&>div]:bg-yellow-500"
                                                            : "[&>div]:bg-orange-500"
                                                        }`}
                                                />
                                            </div>
                                        )}

                                        <div className="mb-4">
                                            <p className="mb-2 text-sm font-medium text-foreground">Interests:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {user.interests?.map((interest) => (
                                                    <span
                                                        key={interest}
                                                        className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                                                    >
                                                        {interest}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleContactUser(user);
                                            }}
                                        >
                                            Contact
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="mt-8 flex justify-center">
                            <Button variant="outline">Load More</Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}