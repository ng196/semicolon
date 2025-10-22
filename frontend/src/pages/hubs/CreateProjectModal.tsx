import { useState } from "react";
import { Plus, X, Code, Camera, Leaf, Brain, Gamepad, Trees, Smartphone, Users, Building, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { hubsApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import type { LucideIcon } from "lucide-react";

const iconOptions: { value: string; icon: LucideIcon; label: string }[] = [
    { value: "code", icon: Code, label: "Code" },
    { value: "camera", icon: Camera, label: "Camera" },
    { value: "leaf", icon: Leaf, label: "Leaf" },
    { value: "brain", icon: Brain, label: "Brain" },
    { value: "gamepad", icon: Gamepad, label: "Gamepad" },
    { value: "tree", icon: Trees, label: "Tree" },
    { value: "smartphone", icon: Smartphone, label: "Smartphone" },
    { value: "users", icon: Users, label: "Users" },
    { value: "building", icon: Building, label: "Building" },
    { value: "lightbulb", icon: Lightbulb, label: "Lightbulb" },
];

const colorOptions = [
    { value: "blue", label: "Blue", class: "bg-blue-500" },
    { value: "purple", label: "Purple", class: "bg-purple-500" },
    { value: "green", label: "Green", class: "bg-green-500" },
    { value: "red", label: "Red", class: "bg-red-500" },
    { value: "yellow", label: "Yellow", class: "bg-yellow-500" },
    { value: "teal", label: "Teal", class: "bg-teal-500" },
    { value: "indigo", label: "Indigo", class: "bg-indigo-500" },
    { value: "orange", label: "Orange", class: "bg-orange-500" },
];

const skillOptions = [
    "Web Development", "Mobile Development", "AI/ML", "Data Science", "Game Development",
    "UI/UX Design", "Backend Development", "Frontend Development", "Full Stack",
    "DevOps", "Cloud Computing", "Cybersecurity", "Blockchain", "IoT", "Robotics",
    "AR/VR", "Computer Vision", "Natural Language Processing", "Database Design",
    "API Development", "Testing", "Project Management"
];

interface CreateProjectModalProps {
    onProjectCreated: () => void;
    buttonText?: string;
    isClub?: boolean;
}

export function CreateProjectModal({ onProjectCreated, buttonText, isClub = false }: CreateProjectModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();
    const entityType = isClub ? "Club" : "Project";

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        icon: "code",
        specialization: "",
        year: "",
        color: "blue",
        interests: [] as string[]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.description) {
            toast({
                title: "Missing Information",
                description: `Please fill in ${entityType.toLowerCase()} name and description.`,
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);
            const userData = JSON.parse(localStorage.getItem('user_data') || '{"id":1}');
            await hubsApi.create({
                ...formData,
                type: entityType,
                creator_id: userData.id || 1
            });

            toast({
                title: `${entityType} Created!`,
                description: `Your ${entityType.toLowerCase()} has been created successfully.`,
            });

            setOpen(false);
            setFormData({
                name: "",
                description: "",
                icon: "code",
                specialization: "",
                year: "",
                color: "blue",
                interests: []
            });
            onProjectCreated();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create project",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const addSkill = (skill: string) => {
        if (!formData.interests.includes(skill)) {
            setFormData(prev => ({
                ...prev,
                interests: [...prev.interests, skill]
            }));
        }
    };

    const removeSkill = (skill: string) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.filter(i => i !== skill)
        }));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    {buttonText || `Create ${entityType}`}
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New {entityType}</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        {isClub
                            ? "Start a new club and build a community around shared interests."
                            : "Start a new project and find collaborators to bring your ideas to life."}
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Project Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter your project name"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Project Description *</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe your project, what you're building, and what kind of collaborators you're looking for"
                            rows={4}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Project Icon</Label>
                            <Select value={formData.icon} onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {iconOptions.map((option) => {
                                        const IconComponent = option.icon;
                                        return (
                                            <SelectItem key={option.value} value={option.value}>
                                                <div className="flex items-center gap-2">
                                                    <IconComponent className="h-4 w-4" />
                                                    {option.label}
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Color Theme</Label>
                            <Select value={formData.color} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {colorOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            <div className="flex items-center gap-2">
                                                <div className={`w-4 h-4 rounded-full ${option.class}`} />
                                                {option.label}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="specialization">Target Specialization</Label>
                            <Input
                                id="specialization"
                                value={formData.specialization}
                                onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                                placeholder="e.g., CS, Design, Engineering, All"
                            />
                            <p className="text-xs text-muted-foreground">
                                What field of study is this project most relevant to?
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="year">Target Year Level</Label>
                            <Select value={formData.year} onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select year level" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All Years">All Years</SelectItem>
                                    <SelectItem value="1st Year">1st Year</SelectItem>
                                    <SelectItem value="2nd Year">2nd Year</SelectItem>
                                    <SelectItem value="3rd Year">3rd Year</SelectItem>
                                    <SelectItem value="4th Year">4th Year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Required Skills & Technologies</Label>
                        <Select onValueChange={addSkill}>
                            <SelectTrigger>
                                <SelectValue placeholder="Add skills needed for this project" />
                            </SelectTrigger>
                            <SelectContent>
                                {skillOptions.filter(skill => !formData.interests.includes(skill)).map((skill) => (
                                    <SelectItem key={skill} value={skill}>
                                        {skill}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {formData.interests.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.interests.map((skill) => (
                                    <Badge key={skill} variant="secondary" className="cursor-pointer">
                                        {skill}
                                        <X
                                            className="ml-1 h-3 w-3"
                                            onClick={() => removeSkill(skill)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Add skills and technologies to help others understand what expertise you're looking for.
                        </p>
                    </div>

                    <div className="bg-muted p-4 rounded-lg">
                        <h4 className="font-medium mb-2">💡 Project Tips</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>• Be specific about what you're building and what help you need</li>
                            <li>• Include the technologies or skills you're looking for</li>
                            <li>• Mention if this is for a class, personal project, or startup idea</li>
                            <li>• Consider what you can offer to collaborators in return</li>
                        </ul>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : `Create ${entityType}`}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}