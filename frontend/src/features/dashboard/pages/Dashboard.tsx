import { Plus, Users as UsersIcon, Calendar, ShoppingBag, UserPlus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";

import { useDashboardEvents } from "@/features/events/hooks";
import { useAuth } from "@/features/auth/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { events: upcomingEvents, loading: eventsLoading } = useDashboardEvents();

  const handleQuickAction = (href: string) => {
    navigate(href);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-gray-50">
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Hero Card with Stats */}
          <Card className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white border-0 shadow-xl overflow-hidden">
            <div className="p-8 relative">
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full -ml-24 -mb-24 blur-2xl"></div>

              <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name || 'User'}</h2>
                <p className="text-purple-100 mb-8">Here's your campus overview for today</p>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-8">
                  <div>
                    <div className="text-4xl font-bold mb-1">3</div>
                    <div className="text-purple-200 text-sm">Events This Week</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-1">2</div>
                    <div className="text-purple-200 text-sm">Active Projects</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold mb-1">47</div>
                    <div className="text-purple-200 text-sm">Total Connections</div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Quick Actions */}
            <div className="space-y-6">
              <Card className="bg-white">
                <div className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">QUICK ACTIONS</h3>
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:bg-gray-50"
                      onClick={() => handleQuickAction('/hubs')}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Project
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:bg-gray-50"
                      onClick={() => handleQuickAction('/clubs')}
                    >
                      <UsersIcon className="h-4 w-4 mr-2" />
                      Create Club
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:bg-gray-50"
                      onClick={() => handleQuickAction('/events')}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:bg-gray-50"
                      onClick={() => handleQuickAction('/marketplace')}
                    >
                      <ShoppingBag className="h-4 w-4 mr-2" />
                      Sell Item
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-gray-700 hover:bg-gray-50"
                      onClick={() => handleQuickAction('/network')}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Find Friends
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Content - Project Updates */}
            <div className="lg:col-span-3 space-y-6">
              {/* Project Updates */}
              <Card className="bg-white">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Project Updates</h2>
                    <Button variant="link" size="sm" className="text-indigo-600">View All</Button>
                  </div>
                  <div className="space-y-4">
                    {/* Project 1 */}
                    <div className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">AI Chatbot Development</h3>
                          <p className="text-sm text-gray-600 mt-1">Building an intelligent customer service bot using NLP</p>
                        </div>
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">
                          In Progress
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map((i) => (
                            <img
                              key={i}
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                              alt="Member"
                              className="h-6 w-6 rounded-full border-2 border-white"
                            />
                          ))}
                          <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs">
                            +2
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">Due: Dec 15</span>
                      </div>
                    </div>

                    {/* Project 2 */}
                    <div className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">Campus Event Platform</h3>
                          <p className="text-sm text-gray-600 mt-1">Web app for managing college events and registrations</p>
                        </div>
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                          Active
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex -space-x-2">
                          {[4, 5].map((i) => (
                            <img
                              key={i}
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                              alt="Member"
                              className="h-6 w-6 rounded-full border-2 border-white"
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">Due: Jan 10</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Upcoming Events */}
              <Card className="bg-white">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
                    <Button variant="link" size="sm" className="text-indigo-600" onClick={() => navigate('/events')}>View All</Button>
                  </div>
                  <div className="space-y-3">
                    {eventsLoading ? (
                      <p className="text-center text-gray-500">Loading events...</p>
                    ) : upcomingEvents.length === 0 ? (
                      <p className="text-center text-gray-500">No upcoming events</p>
                    ) : (
                      upcomingEvents.slice(0, 3).map((event: any) => (
                        <div key={event.id} className="border-b border-gray-100 pb-3 last:border-0 cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-2 rounded" onClick={() => navigate('/events')}>
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100">
                              <Calendar className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 truncate">{event.name}</h3>
                              <p className="text-sm text-gray-600 truncate">
                                {event.date} • {event.time}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                <UsersIcon className="h-3 w-3" />
                                {event.attending}/{event.capacity} attending
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
