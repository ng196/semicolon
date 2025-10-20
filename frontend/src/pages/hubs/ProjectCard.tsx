import { Users, Star, Code, Camera, Leaf, Brain, Gamepad, Trees, Smartphone, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryBadge } from "@/components/CategoryBadge";
import { useNavigate } from "react-router-dom";
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
}

interface ProjectCardProps {
    project: Project;
    buttonLabel?: string;
    onViewClick?: () => void;
}

export function ProjectCard({ project, buttonLabel = "View Project", onViewClick }: ProjectCardProps) {
    const navigate = useNavigate();
    const IconComponent = iconMap[project.icon] || Code;

    const handleViewProject = onViewClick || (() => {
        navigate(`/hubs?view=project&id=${project.id}`);
    });

    return (
        <Card className="group overflow-hidden transition-all hover:shadow-lg cursor-pointer" onClick={handleViewProject}>
            <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${project.color}-100`}>
                        <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex items-center gap-2">
                        <CategoryBadge category={project.type} />
                    </div>
                </div>

                <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {project.name}
                </h3>
                <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                    {project.description}
                </p>

                {/* Skills/Technologies */}
                <div className="mb-4 flex flex-wrap gap-2">
                    {project.interests.slice(0, 3).map((interest) => (
                        <Badge key={interest} variant="secondary" className="text-xs">
                            {interest}
                        </Badge>
                    ))}
                    {project.interests.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                            +{project.interests.length - 3} more
                        </Badge>
                    )}
                </div>

                {/* Project Info */}
                <div className="mb-4 text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                        <span>Specialization:</span>
                        <span className="font-medium">{project.specialization || 'All'}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Target Year:</span>
                        <span className="font-medium">{project.year || 'All Years'}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {project.members} member{project.members !== 1 ? 's' : ''}
                        </span>
                        <span className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {project.rating}
                        </span>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                            <img
                                key={i}
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${project.id}-${i}`}
                                alt="Member"
                                className="h-6 w-6 rounded-full border-2 border-background"
                            />
                        ))}
                        {project.members > 3 && (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                                +{project.members - 3}
                            </span>
                        )}
                    </div>
                    <Button
                        size="sm"
                        variant="default"
                        onClick={(e) => {
                            e.stopPropagation();
                            handleViewProject();
                        }}
                    >
                        <ExternalLink className="mr-1 h-3 w-3" />
                        {buttonLabel}
                    </Button>
                </div>
            </div>
        </Card>
    );
}