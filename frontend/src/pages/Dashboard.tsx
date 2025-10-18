import { Plus, Users as UsersIcon, Calendar, ShoppingBag, UserPlus, AlertCircle, TrendingUp, GraduationCap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CategoryBadge } from "@/components/CategoryBadge";
import eventsData from "@/data/events.json";
import hubsData from "@/data/hubs.json";
import marketplaceData from "@/data/marketplace.json";

const quickActions = [
  { title: "Create Project", icon: Plus, color: "bg-blue-500", href: "/hubs" },
  { title: "Join Club", icon: UsersIcon, color: "bg-purple-500", href: "/hubs" },
  { title: "Create Event", icon: Calendar, color: "bg-green-500", href: "/events" },
  { title: "Sell Item", icon: ShoppingBag, color: "bg-orange-500", href: "/marketplace" },
  { title: "Find Friends", icon: UserPlus, color: "bg-teal-500", href: "/network" },
  { title: "Submit Request", icon: AlertCircle, color: "bg-red-500", href: "/requests" },
];

const recentActivity = [
  {
    user: "Alex Chen",
    action: "posted an update in",
    target: "Web Dev Project",
    time: "2 hours ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  },
  {
    user: "Emma Wilson",
    action: "joined",
    target: "Photography Club",
    time: "4 hours ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
  },
  {
    user: "Mike Rodriguez",
    action: "listed a new item in",
    target: "Marketplace",
    time: "6 hours ago",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
  },
];

export default function Dashboard() {
  const upcomingEvents = eventsData.slice(5, 7);
  const suggestedHubs = hubsData.slice(0, 2);
  const recentMarketplace = marketplaceData.slice(0, 2);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center justify-between px-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, Sarah! Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-4">
            <Input
              type="search"
              placeholder="Search..."
              className="w-64"
            />
            <Button size="icon" variant="ghost" className="relative">
              <AlertCircle className="h-5 w-5" />
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-6 p-6">
        {/* Quick Actions */}
        <section>
          <h2 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {quickActions.map((action) => (
              <Card
                key={action.title}
                className="group cursor-pointer transition-all hover:shadow-lg"
              >
                <div className="flex flex-col items-center gap-3 p-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${action.color} text-white transition-transform group-hover:scale-110`}>
                    <action.icon className="h-6 w-6" />
                  </div>
                  <span className="text-sm font-medium text-center">{action.title}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Upcoming Events */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Upcoming Events</h2>
                <Button variant="link" size="sm">View All</Button>
              </div>
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <Card key={event.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${event.color}-100`}>
                        <Calendar className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="mb-1 flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-foreground">{event.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {event.date} • {event.time} • {event.location}
                            </p>
                          </div>
                          <CategoryBadge category={event.specialization} />
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <UsersIcon className="h-4 w-4" />
                            {event.attending}/{event.capacity} attending
                          </span>
                          <span>• {event.organizer}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>

            {/* Recent Activity */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
                <Button variant="ghost" size="sm">...</Button>
              </div>
              <Card className="divide-y">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-4">
                    <img
                      src={activity.avatar}
                      alt={activity.user}
                      className="h-10 w-10 rounded-full"
                    />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>{" "}
                        <span className="text-muted-foreground">{activity.action}</span>{" "}
                        <span className="font-medium text-primary">{activity.target}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </Card>
            </section>

            {/* Project Updates */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Project Updates</h2>
                <Button variant="link" size="sm">Manage Projects</Button>
              </div>
              <Card className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">AI Chatbot Development</h3>
                    <p className="text-sm text-muted-foreground">Building an intelligent customer service bot using NLP</p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                          <img
                            key={i}
                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                            alt="Member"
                            className="h-6 w-6 rounded-full border-2 border-background"
                          />
                        ))}
                        <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                          +2
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground ml-2">Due: Dec 15</span>
                    </div>
                  </div>
                  <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                    In Progress
                  </span>
                </div>
              </Card>
            </section>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Suggested for You */}
            <section>
              <h2 className="mb-4 text-lg font-semibold text-foreground">Suggested for You</h2>
              <div className="space-y-3">
                {suggestedHubs.map((hub) => (
                  <Card key={hub.id} className="p-4">
                    <div className="mb-2 flex items-start justify-between">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-${hub.color}-100`}>
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <Button size="sm">Join</Button>
                    </div>
                    <h3 className="font-semibold text-foreground">{hub.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {hub.members} members
                    </p>
                  </Card>
                ))}
              </div>
            </section>

            {/* Your Network */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Your Network</h2>
              </div>
              <Card className="p-4">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <UsersIcon className="h-4 w-4" />
                      Connections
                    </span>
                    <span className="font-semibold">47</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <GraduationCap className="h-4 w-4" />
                      Classmates
                    </span>
                    <span className="font-semibold">23</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Heart className="h-4 w-4" />
                      Club Members
                    </span>
                    <span className="font-semibold">15</span>
                  </div>
                </div>
              </Card>
            </section>

            {/* This Week */}
            <section>
              <h2 className="mb-4 text-lg font-semibold text-foreground">This Week</h2>
              <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Events Attended</span>
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Projects Active</span>
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">New Connections</span>
                    <span className="text-2xl font-bold text-primary">5</span>
                  </div>
                </div>
              </Card>
            </section>

            {/* Marketplace */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">Marketplace</h2>
                <Button variant="link" size="sm">Browse All</Button>
              </div>
              <div className="space-y-3">
                {recentMarketplace.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-24 w-full object-cover"
                    />
                    <div className="p-3">
                      <h3 className="truncate font-medium text-sm">{item.title}</h3>
                      <p className="text-lg font-bold text-primary">
                        {item.price === 0 ? "Free to borrow" : `$${item.price}`}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
