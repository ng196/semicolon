import { useState, useEffect } from "react";
import { Plus, Search, Filter, Calendar, MapPin, Users, Clock, Bookmark, Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryBadge } from "@/components/CategoryBadge";
import { eventsApi } from "@/services/api";

interface Event {
  id: string | number;
  name: string;
  category: string;
  description: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  specialization: string;
  attending: number;
  capacity: number;
  color: string;
  isAttending?: boolean;
}

export default function Events() {
  const [activeTab, setActiveTab] = useState("all");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await eventsApi.getAll();
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Events</h1>
              <p className="text-sm text-muted-foreground">
                Discover campus events and connect with your community
              </p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Events</TabsTrigger>
              <TabsTrigger value="my">My Events</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
              <TabsTrigger value="past">Past Events</TabsTrigger>
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
                placeholder="Search events..."
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all-dates">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Dates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-dates">All Dates</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-categories">
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-categories">All Categories</SelectItem>
                <SelectItem value="career">Career</SelectItem>
                <SelectItem value="workshop">Workshop</SelectItem>
                <SelectItem value="sports">Sports</SelectItem>
                <SelectItem value="cultural">Cultural</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-organizers">
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Organizers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-organizers">All Organizers</SelectItem>
                <SelectItem value="clubs">Clubs</SelectItem>
                <SelectItem value="departments">Departments</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-spec">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Specializations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-spec">All Specializations</SelectItem>
                <SelectItem value="cs">Computer Science</SelectItem>
                <SelectItem value="all">All Students</SelectItem>
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
            <span className="ml-2 text-muted-foreground">Loading events...</span>
          </div>
        )}

        {error && (
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Failed to load events</p>
                <p className="text-sm text-red-700">{error}</p>
              </div>
              <Button onClick={loadEvents} variant="outline" size="sm" className="ml-auto">
                Retry
              </Button>
            </div>
          </Card>
        )}

        {!loading && !error && (
          <div className="grid gap-6 md:grid-cols-2">
          {events.map((event) => (
            <Card key={event.id} className="group overflow-hidden transition-all hover:shadow-lg">
              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${event.color}-100`}>
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <CategoryBadge category={event.category} />
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <h3 className="mb-2 text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  {event.name}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                  {event.description}
                </p>

                <div className="mb-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {event.attending}/{event.capacity} attending
                    </span>
                  </div>
                  <div className="text-muted-foreground">
                    <span className="font-medium">Organizer:</span> {event.organizer}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <img
                        key={i}
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${event.id}-${i}`}
                        alt="Attendee"
                        className="h-6 w-6 rounded-full border-2 border-background"
                      />
                    ))}
                    {event.attending > 4 && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                        +{event.attending - 4}
                      </span>
                    )}
                  </div>
                  {event.isAttending ? (
                    <Button size="sm" variant="secondary" className="ml-auto">
                      <Check className="mr-2 h-4 w-4" />
                      Attending
                    </Button>
                  ) : (
                    <Button size="sm" variant="default" className="ml-auto">
                      RSVP
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
        )}

        {!loading && !error && (
          <div className="mt-8 flex justify-center">
            <Button variant="outline">Load More Events</Button>
          </div>
        )}
      </div>
    </div>
  );
}
