import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Users, Calendar, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { hubsApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { CategoryBadge } from "@/components/CategoryBadge";

interface ProjectPageProps {
    projectId: string;
}

export default function ProjectPage({ projectId }: ProjectPageProps) {
    const navigate = useNavigate();
    const { toast } = useToast();

    const { data: project, isLoading } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => hubsApi.getById(projectId),
    });

    const { data: members = [] } = useQuery({
        queryKey: ['project-members', projectId],
        queryFn: () => hubsApi.getMembers(projectId),
    });

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
            </div>
        );
    }

    if (!project || project.type !== 'Project') {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Card className="p-8 max-w-md text-center">
                    <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
                    <Button onClick={() => navigate('/hubs')} variant="outline" className="mt-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Hubs
                    </Button>
                </Card>
            </div>
        );
    }

    const creator = members.find(m => m.role === 'creator');

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card">
                <div className="px-6 py-4">
                    <Button variant="ghost" onClick={() => navigate('/hubs')} className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Hubs
                    </Button>

                    <div className="flex items-start gap-6">
                        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 text-4xl">
                            {project.icon === 'code' && '💻'}
                            {project.icon === 'camera' && '📷'}
                            {project.icon === 'leaf' && '🌿'}
                            {project.icon === 'brain' && '🧠'}
                            {project.icon === 'gamepad' && '🎮'}
                            {project.icon === 'tree' && '🌳'}
                            {project.icon === 'smartphone' && '📱'}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl font-bold">{project.name}</h1>
                                <CategoryBadge category={project.type} />
                            </div>

                            <p className="text-lg text-muted-foreground mb-4 max-w-3xl">
                                {project.description}
                            </p>

                            <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    {project.members} members
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(project.created_at).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <Button onClick={() => toast({ title: "Contact Creator", description: `Reach out to ${creator?.name}` })}>
                            <Mail className="mr-2 h-4 w-4" />
                            Contact Creator
                        </Button>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="p-6">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="p-6">
                            <h2 className="text-xl font-semibold mb-4">Project Details</h2>
                            <div className="grid sm:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <h3 className="text-sm text-muted-foreground mb-1">Specialization</h3>
                                    <p>{project.specialization || 'All'}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm text-muted-foreground mb-1">Target Year</h3>
                                    <p>{project.year || 'All Years'}</p>
                                </div>
                            </div>
                            {project.interests?.length > 0 && (
                                <div>
                                    <h3 className="text-sm text-muted-foreground mb-3">Skills & Technologies</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {project.interests.map((interest) => (
                                            <Badge key={interest} variant="secondary">{interest}</Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {creator && (
                            <Card className="p-6">
                                <h3 className="font-semibold mb-4">Project Creator</h3>
                                <div className="flex items-center gap-3 mb-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={creator.avatar || undefined} />
                                        <AvatarFallback>{creator.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium">{creator.name}</div>
                                        <div className="text-sm text-muted-foreground">@{creator.username}</div>
                                    </div>
                                </div>
                                <Button className="w-full" size="sm">
                                    <Mail className="mr-2 h-4 w-4" />
                                    Send Message
                                </Button>
                            </Card>
                        )}

                        <Card className="p-6">
                            <h3 className="font-semibold mb-4">Team Members ({members.length})</h3>
                            <div className="space-y-3">
                                {members.slice(0, 5).map((member) => (
                                    <div key={member.id} className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarImage src={member.avatar || undefined} />
                                            <AvatarFallback>{member.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="text-sm font-medium">{member.name}</div>
                                            <div className="text-xs text-muted-foreground">
                                                {member.role === 'creator' ? 'Creator' : 'Member'}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {members.length > 5 && (
                                    <div className="text-xs text-muted-foreground text-center pt-2">
                                        +{members.length - 5} more
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
