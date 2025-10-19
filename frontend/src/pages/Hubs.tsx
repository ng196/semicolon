import { useState, useEffect } from "react";
import { Plus, Search, Filter, Users, Star, Code, Camera, Leaf, Brain, Gamepad, Trees, Smartphone, Bookmark, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryBadge } from "@/components/CategoryBadge";
import { hubsApi } from "@/services/api";
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

interface Hub {
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

export default function Hubs() {
  const [activeTab, setActiveTab] = useState("all");
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const filteredHubs = activeTab === "all"
    ? hubs
    : hubs.filter(hub => hub.type.toLowerCase() === activeTab);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Hubs</h1>
              <p className="text-sm text-muted-foreground">
                Discover projects and clubs, or create your own community
              </p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Create Hub
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Hubs</TabsTrigger>
              <TabsTrigger value="project">Projects</TabsTrigger>
              <TabsTrigger value="club">Clubs</TabsTrigger>
              <TabsTrigger value="my">My Hubs</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search hubs..."
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
                <SelectItem value="1">1st Year</SelectItem>
                <SelectItem value="2">2nd Year</SelectItem>
                <SelectItem value="3">3rd Year</SelectItem>
                <SelectItem value="4">4th Year</SelectItem>
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
            <span className="ml-2 text-muted-foreground">Loading hubs...</span>
          </div>
        )}

        {error && (
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Failed to load hubs</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <Button onClick={loadHubs} variant="outline" size="sm" className="ml-auto">
                Retry
              </Button>
            </div>
          </Card>
        )}

        {!loading && !error && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredHubs.map((hub) => {
              const IconComponent = iconMap[hub.icon] || Code;
              return (
                <Card key={hub.id} className="group overflow-hidden transition-all hover:shadow-lg">
                  <div className="p-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${hub.color}-100`}>
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex items-center gap-2">
                        <CategoryBadge category={hub.type} />
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Bookmark className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {hub.name}
                    </h3>
                    <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                      {hub.description}
                    </p>

                    <div className="mb-4 flex flex-wrap gap-2">
                      {hub.interests.map((interest) => (
                        <span
                          key={interest}
                          className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                        >
                          {interest}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {hub.members} {hub.members > 100 ? "" : "members"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {hub.rating}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                          <img
                            key={i}
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${hub.id}-${i}`}
                            alt="Member"
                            className="h-6 w-6 rounded-full border-2 border-background"
                          />
                        ))}
                        {hub.members > 3 && (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                            +{hub.members - 3}
                          </span>
                        )}
                      </div>
                      <Button size="sm" variant="default" className="ml-auto">
                        Request Join
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && !error && (
          <div className="mt-8 flex justify-center">
            <Button variant="outline">Load More Hubs</Button>
          </div>
        )}
      </div>
    </div>
  );
}
