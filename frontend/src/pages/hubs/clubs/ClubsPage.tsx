import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, AlertCircle, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { hubsApi } from "@/services/api";
import { ProjectCard } from "../ProjectCard";
import { CreateClubModal } from "./CreateClubModal";

interface Club {
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

export default function ClubsPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("clubs");
    const [hubs, setHubs] = useState<Club[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [specializationFilter, setSpecializationFilter] = useState("all");
    const [yearFilter, setYearFilter] = useState("all");

    useEffect(() => {
        loadHubs();
    }, []);

    const loadHubs = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await hubsApi.getAll();
            setHubs(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load hubs');
            console.error('Error loading hubs:', err);
        } finally {
            setLoading(false);
        }
    };

    // Always show only clubs on this page
    const clubs = hubs.filter(hub => {
        if (hub.type !== "Club") return false;

        // Filter by search term
        if (searchTerm && !hub.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !hub.description.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }

        // Filter by specialization
        if (specializationFilter !== "all" &&
            !hub.specialization?.toLowerCase().includes(specializationFilter.toLowerCase())) {
            return false;
        }

        // Filter by year
        if (yearFilter !== "all" &&
            !hub.year?.toLowerCase().includes(yearFilter.toLowerCase())) {
            return false;
        }

        return true;
    });

    // Get total counts for display
    const totalProjects = hubs.filter(hub => hub.type === "Project").length;
    const totalClubs = hubs.filter(hub => hub.type === "Club").length;

    const handleTabChange = (value: string) => {
        if (value === "projects") {
            navigate('/hubs');
        } else {
            setActiveTab(value);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <p className="text-lg text-muted-foreground">{error}</p>
                <Button onClick={loadClubs}>Try Again</Button>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen w-full flex-col bg-background">
            <header className="border-b border-border bg-card">
                <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Campus Hubs</h1>
                            <p className="text-sm text-muted-foreground">
                                Discover projects to collaborate on and clubs to join
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <CreateClubModal onClubCreated={loadHubs} />
                        </div>
                    </div>

                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                        <TabsList>
                            <TabsTrigger value="projects">Projects ({totalProjects})</TabsTrigger>
                            <TabsTrigger value="clubs">Clubs ({totalClubs})</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </header>

            <div className="flex-1 p-6">
                {/* Filters */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-1 gap-2">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search clubs..."
                                className="pl-9"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Select value={specializationFilter} onValueChange={setSpecializationFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Specializations" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Specializations</SelectItem>
                                <SelectItem value="cs">Computer Science</SelectItem>
                                <SelectItem value="design">Design</SelectItem>
                                <SelectItem value="engineering">Engineering</SelectItem>
                                <SelectItem value="math">Mathematics</SelectItem>
                                <SelectItem value="business">Business</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={yearFilter} onValueChange={setYearFilter}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="All Years" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Years</SelectItem>
                                <SelectItem value="1st">1st Year</SelectItem>
                                <SelectItem value="2nd">2nd Year</SelectItem>
                                <SelectItem value="3rd">3rd Year</SelectItem>
                                <SelectItem value="4th">4th Year</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Content */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2 text-muted-foreground">Loading clubs...</span>
                    </div>
                )}

                {error && (
                    <Card className="p-6 border-red-200 bg-red-50">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600" />
                            <div>
                                <p className="font-medium text-red-900">Failed to load clubs</p>
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                            <Button onClick={loadHubs} variant="outline" size="sm" className="ml-auto">
                                Retry
                            </Button>
                        </div>
                    </Card>
                )}

                {!loading && !error && (
                    <>
                        {clubs.length === 0 ? (
                            <Card className="p-12 text-center">
                                <h3 className="text-lg font-semibold mb-2">No Clubs Found</h3>
                                <p className="text-muted-foreground mb-4">
                                    {searchTerm || specializationFilter !== "all" || yearFilter !== "all"
                                        ? "Try adjusting your filters to see more clubs."
                                        : "Be the first to create a club and build a community!"
                                    }
                                </p>
                                <CreateClubModal onClubCreated={loadHubs} />
                            </Card>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {clubs.map((club) => (
                                    <ProjectCard 
                                        key={club.id}
                                        project={club} 
                                        buttonLabel="View Club"
                                        onViewClick={() => navigate(`/clubs/${club.id}`)}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {!loading && !error && clubs.length > 0 && (
                    <div className="mt-8 flex justify-center">
                        <Button variant="outline">Load More</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
