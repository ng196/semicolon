import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Star, Calendar, User, Mail, ExternalLink, Code, Camera, Leaf, Brain, Gamepad, Trees, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { hubsApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { CategoryBadge } from "@/components/CategoryBadge";
import type { LucideIcon } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
    code: Code,
    camera: Camera,
    leaf: Leaf,
    brain: Brain,
    gamepad: Gamepad,
    tree: Trees,
    smartphone: Smartphone,
};

interface Project {
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

interface ProjectPageProps {
    projectId: string;
}

export default function ProjectPage({ projectId }: ProjectPageProps) {
    const navigate = useNavigate();
    const { toast } = useToast();

    const [project, setProject] = useState<Project | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (projectId) {
            loadProject();
            loadMembers();
        }
    }, [projectId]);

    const loadProject = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await hubsApi.getById(projectId);
            if (data.type !== 'Project') {
                setError('This is not a project');
                return;
            }
            setProject(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load project');
            console.error('Error loading project:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadMembers = async () => {
        try {
            const data = await hubsApi.getMembers(projectId);
            setMembers(data);
        } catch (err) {
            console.error('Error loading members:', err);
        }
    };

    const handleContactCreator = () => {
        const creator = members.find(m => m.role === 'creator');
        if (creator) {
            toast({
                title: "Contact Creator",
                description: `Reach out to ${creator.name} at ${creator.username}@campus.edu`,
            });
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-background">
                <div className="flex justify-center items-center py-20">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading project...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="flex min-h-screen w-full flex-col bg-background">
                <div className="flex justify-center items-center py-20">
                    <Card className="p-8 max-w-md text-center">
                        <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
                        <p className="text-muted-foreground mb-4">{error || 'The project you\'re looking for doesn\'t exist.'}</p>
                        <Button onClick={() => navigate('/hubs')} variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Hubs
                        </Button>
                    </Card>
                </div>
            </div>
        );
    }

    const IconComponent = iconMap[project.icon] || Code;
    const creator = members.find(m => m.role === 'creator');

    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            {/* Header */}
            <header className="border-b border-border bg-card">
                <div className="px-6 py-4">
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/hubs')}
                        className="mb-4"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Hubs
                    </Button>

                    <div className="flex items-start gap-6">
                        <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-${project.color}-100`}>
                            <IconComponent className="h-10 w-10 text-primary" />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold text-foreground">{project.name}</h1>
                                <CategoryBadge category={project.type} />
                            </div>

                            <p className="text-lg text-muted-foreground mb-4 max-w-3xl">
                                {project.description}
                            </p>

                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    {project.members} member{project.members !== 1 ? 's' : ''}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    {project.rating} rating
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Created {new Date(project.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button onClick={handleContactCreator}>
                                <Mail className="mr-2 h-4 w-4" />
                                Contact Creator
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 p-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Project Details */}
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Project Details</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Specialization</h3>
                                    <p className="text-foreground">{project.specialization || 'All'}</p>
                                </div>
                                <div>
                                    <h3 className="font-medium text-sm text-muted-foreground mb-1">Target Year</h3>
                                    <p className="text-foreground">{project.year || 'All Years'}</p>
                                </div>
                            </div>

                            {project.interests.length > 0 && (
                                <div>
                                    <h3 className="font-medium text-sm text-muted-foreground mb-3">Skills & Technologies</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {project.interests.map((interest) => (
                                            <Badge key={interest} variant="secondary">
                                                {interest}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>

                        {/* Project Description */}
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">About This Project</h2>
                            <div className="prose prose-sm max-w-none">
                                <p className="text-muted-foreground leading-relaxed">
                                    {project.description}
                                </p>

                                <div className="mt-6 p-4 bg-muted rounded-lg">
                                    <h4 className="font-medium mb-2">Looking for collaborators?</h4>
                                    <p className="text-sm text-muted-foreground">
                                        This project is actively seeking team members. If you're interested in contributing,
                                        reach out to the project creator using the contact button above.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Creator Info */}
                        {creator && (
                            <Card className="p-6">
                                <h3 className="font-semibold mb-4">Project Creator</h3>
                                <div className="flex items-center gap-3 mb-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={creator.avatar || undefined} />
                                        <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{creator.name}</div>
                                        <div className="text-sm text-muted-foreground">@{creator.username}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {creator.specialization} • {creator.year}
                                        </div>
                                    </div>
                                </div>
                                <Button onClick={handleContactCreator} className="w-full" size="sm">
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Message
                                </Button>
                            </Card>
                        )}

                        {/* Team Members */}
                        <Card className="p-6">
                            <h3 className="font-semibold mb-4">Team Members ({project.members})</h3>
                            <div className="space-y-3">
                                {members.slice(0, 5).map((member) => (
                                    <div key={member.id} className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={member.avatar || undefined} />
                                            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate">{member.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {member.role === 'creator' ? 'Creator' : 'Member'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {members.length > 5 && (
                                    <div className="text-xs text-muted-foreground text-center pt-2">
                                        +{members.length - 5} more members
                                    </div>
                                )}
                            </div>
                        </Card>

                        {/* Project Stats */}
                        <Card className="p-6">
                            <h3 className="font-semibold mb-4">Project Stats</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Members</span>
                                    <span className="text-sm font-medium">{project.members}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Rating</span>
                                    <span className="text-sm font-medium flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                        {project.rating}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm text-muted-foreground">Created</span>
                                    <span className="text-sm font-medium">
                                        {new Date(project.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}