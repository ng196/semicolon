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

const interestOptions = [
    "Web Development", "AI/ML", "Mobile Dev", "Game Dev", "Data Science",
    "Cybersecurity", "Cloud Computing", "DevOps", "UI/UX Design", "Blockchain",
    "IoT", "Robotics", "AR/VR", "Photography", "Music", "Art", "Writing",
    "Research", "Statistics", "Mathematics", "Physics", "Chemistry", "Biology"
];

interface CreateHubModalProps {
    onHubCreated: () => void;
}

export function CreateHubModal({ onHubCreated }: CreateHubModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: "",
        type: "",
        description: "",
        icon: "code",
        specialization: "",
        year: "",
        color: "blue",
        interests: [] as string[]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.type || !formData.description) {
            toast({
                title: "Missing Information",
                description: "Please fill in all required fields.",
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);
            await hubsApi.create({
                ...formData,
                creator_id: 1 // This should come from auth context
            });

            toast({
                title: "Hub Created!",
                description: "Your hub has been created successfully.",
            });

            setOpen(false);
            setFormData({
                name: "",
                type: "",
                description: "",
                icon: "code",
                specialization: "",
                year: "",
                color: "blue",
                interests: []
            });
            onHubCreated();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create hub",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const addInterest = (interest: string) => {
        if (!formData.interests.includes(interest)) {
            setFormData(prev => ({
                ...prev,
                interests: [...prev.interests, interest]
            }));
        }
    };

    const removeInterest = (interest: string) => {
        setFormData(prev => ({
            ...prev,
            interests: prev.interests.filter(i => i !== interest)
        }));
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Hub
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Hub</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Hub Name *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter hub name"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Type *</Label>
                            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Project">Project</SelectItem>
                                    <SelectItem value="Club">Club</SelectItem>
                                    <SelectItem value="Study Group">Study Group</SelectItem>
                                    <SelectItem value="Community">Community</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe your hub and what it's about"
                            rows={3}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Icon</Label>
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
                            <Label>Color</Label>
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

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="specialization">Specialization</Label>
                            <Input
                                id="specialization"
                                value={formData.specialization}
                                onChange={(e) => setFormData(prev => ({ ...prev, specialization: e.target.value }))}
                                placeholder="e.g., CS, Design, All"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="year">Target Year</Label>
                            <Select value={formData.year} onValueChange={(value) => setFormData(prev => ({ ...prev, year: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="All">All Years</SelectItem>
                                    <SelectItem value="1st Year">1st Year</SelectItem>
                                    <SelectItem value="2nd Year">2nd Year</SelectItem>
                                    <SelectItem value="3rd Year">3rd Year</SelectItem>
                                    <SelectItem value="4th Year">4th Year</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Interests & Tags</Label>
                        <Select onValueChange={addInterest}>
                            <SelectTrigger>
                                <SelectValue placeholder="Add interests" />
                            </SelectTrigger>
                            <SelectContent>
                                {interestOptions.filter(interest => !formData.interests.includes(interest)).map((interest) => (
                                    <SelectItem key={interest} value={interest}>
                                        {interest}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {formData.interests.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.interests.map((interest) => (
                                    <Badge key={interest} variant="secondary" className="cursor-pointer">
                                        {interest}
                                        <X
                                            className="ml-1 h-3 w-3"
                                            onClick={() => removeInterest(interest)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Hub"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}