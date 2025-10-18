import { useState } from "react";
import { Plus, Search, Filter, Users, Clock, Eye, Share2, ThumbsUp, CheckCircle2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/StatusBadge";
import { CategoryBadge } from "@/components/CategoryBadge";
import requestsData from "@/data/requests.json";

export default function Requests() {
  const [activeTab, setActiveTab] = useState("all");

  const filteredRequests = activeTab === "all" 
    ? requestsData 
    : activeTab === "my" 
    ? requestsData.filter(req => req.submitter.name.includes("You"))
    : activeTab === "class"
    ? requestsData.filter(req => req.type === "Class Request")
    : requestsData.filter(req => req.status === "Resolved");

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Complaints & Requests</h1>
              <p className="text-sm text-muted-foreground">
                Submit complaints and requests to faculty and administration
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="bg-orange-500 text-white hover:bg-orange-600">
                <Plus className="mr-2 h-4 w-4" />
                Class Request
              </Button>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="mr-2 h-4 w-4" />
                New Request
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="all">All Requests</TabsTrigger>
              <TabsTrigger value="my">My Requests</TabsTrigger>
              <TabsTrigger value="class">Class Requests</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
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
                placeholder="Search requests..."
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all-categories">
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-categories">All Categories</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="facilities">Facilities</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-status">
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-status">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-review">In Review</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all-recipients">
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Recipients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-recipients">All Recipients</SelectItem>
                <SelectItem value="library">Library Administration</SelectItem>
                <SelectItem value="it">IT Department</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {filteredRequests.map((request) => (
            <Card key={request.id} className="overflow-hidden transition-all hover:shadow-lg">
              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-start gap-3">
                      <h3 className="text-xl font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                        {request.title}
                      </h3>
                      <div className="flex gap-2">
                        <StatusBadge status={request.status} />
                        <CategoryBadge category={request.type} />
                      </div>
                    </div>
                    <p className="mb-3 text-sm text-muted-foreground">
                      {request.description}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                  <div>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      To: {request.submittedTo}
                    </span>
                  </div>
                  <div>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Submitted: {request.submittedAt}
                    </span>
                  </div>
                  <div>
                    <span className="flex items-center gap-2 text-muted-foreground">
                      Category: {request.category}
                    </span>
                  </div>
                  {request.supporters !== undefined && (
                    <div>
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <ThumbsUp className="h-4 w-4" />
                        {request.supporters} supporters
                      </span>
                    </div>
                  )}
                </div>

                {request.supporters !== undefined && request.required && (
                  <div className="mb-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress:</span>
                      <span className="font-semibold text-foreground">
                        {request.supporters}/{request.required} required
                      </span>
                    </div>
                    <Progress value={request.progress} className="h-2" />
                  </div>
                )}

                {request.resolution && (
                  <div className="mb-4 rounded-lg bg-green-50 p-4 border border-green-200">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-green-900 mb-1">Resolution Update</p>
                        <p className="text-sm text-green-700">{request.resolution}</p>
                      </div>
                    </div>
                  </div>
                )}

                {request.responseTime && (
                  <div className="mb-4 text-sm text-muted-foreground">
                    {request.responseTime}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={request.submitter.avatar}
                      alt={request.submitter.name}
                      className="h-8 w-8 rounded-full"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {request.submitter.name}
                      </p>
                    </div>
                    {request.supporters !== undefined && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map((i) => (
                            <img
                              key={i}
                              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.id}-${i}`}
                              alt="Supporter"
                              className="h-6 w-6 rounded-full border-2 border-background"
                            />
                          ))}
                          {request.supporters > 3 && (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">
                              +{request.supporters - 3}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {request.supporters !== undefined && (
                      <Button size="sm" variant="outline" className="gap-2">
                        <ThumbsUp className="h-4 w-4" />
                        Support
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Comment
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
