import { useState } from "react";
import { Plus, X, Users, Building, Camera, Brain, Gamepad, Trees, Lightbulb, Music, Book } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { hubsApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import type { LucideIcon } from "lucide-react";

const iconOptions: { value: string; icon: LucideIcon; label: string }[] = [
    { value: "users", icon: Users, label: "Users" },
    { value: "building", icon: Building, label: "Building" },
    { value: "camera", icon: Camera, label: "Camera" },
    { value: "brain", icon: Brain, label: "Brain" },
    { value: "gamepad", icon: Gamepad, label: "Gamepad" },
    { value: "tree", icon: Trees, label: "Tree" },
    { value: "lightbulb", icon: Lightbulb, label: "Lightbulb" },
    { value: "music", icon: Music, label: "Music" },
    { value: "book", icon: Book, label: "Book" },
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
    "Photography", "Art", "Music", "Sports", "Technology", "Science",
    "Literature", "Gaming", "Fitness", "Cooking", "Travel", "Environment",
    "Business", "Volunteering", "Culture", "Dance", "Theater", "Film"
];

interface CreateClubModalProps {
    onClubCreated: () => void;
}

export function CreateClubModal({ onClubCreated }: CreateClubModalProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        icon: "users",
        specialization: "All",
        year: "All Years",
        color: "blue",
        interests: [] as string[],
        isPrivate: false
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.description) {
            toast({
                title: "Missing Information",
                description: "Please fill in club name and description.",
                variant: "destructive"
            });
            return;
        }

        try {
            setLoading(true);
            const userData = JSON.parse(localStorage.getItem('user_data') || '{"id":1}');
            const result = await hubsApi.create({
                name: formData.name,
                description: formData.description,
                icon: formData.icon,
                specialization: formData.specialization,
                year: formData.year,
                color: formData.color,
                interests: formData.interests,
                type: "Club",
                creator_id: userData.id || 1
            });

            // Update club settings if private
            if (formData.isPrivate && result.id) {
                const { clubsApi } = await import("@/services/api");
                await clubsApi.updateSettings(result.id, {
                    is_private: true,
                    auto_approve_members: false
                });
            }

            toast({
                title: "Club Created!",
                description: "Your club has been created successfully.",
            });

            setOpen(false);
            setFormData({
                name: "",
                description: "",
                icon: "users",
                specialization: "All",
                year: "All Years",
                color: "blue",
                interests: [],
                isPrivate: false
            });
            onClubCreated();
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create club",
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
                    Create Club
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Club</DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        Start a new club and build a community around shared interests.
                    </p>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Club Name *</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Photography Club, Coding Society"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe what your club is about and what activities you'll do..."
                            rows={4}
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Club Icon</Label>
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

                    <div className="space-y-2">
                        <Label>Interests & Activities</Label>
                        <Select onValueChange={addInterest}>
                            <SelectTrigger>
                                <SelectValue placeholder="Add interests..." />
                            </SelectTrigger>
                            <SelectContent>
                                {interestOptions.map((interest) => (
                                    <SelectItem key={interest} value={interest}>
                                        {interest}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {formData.interests.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.interests.map((interest) => (
                                    <Badge key={interest} variant="secondary" className="gap-1">
                                        {interest}
                                        <X
                                            className="h-3 w-3 cursor-pointer"
                                            onClick={() => removeInterest(interest)}
                                        />
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-0.5">
                            <Label htmlFor="private">Private Club</Label>
                            <p className="text-sm text-muted-foreground">
                                Require approval for new members to join
                            </p>
                        </div>
                        <Switch
                            id="private"
                            checked={formData.isPrivate}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPrivate: checked }))}
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create Club"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
