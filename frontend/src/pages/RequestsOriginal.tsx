import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  Search, 
  Plus, 
  Filter, 
  Eye,
  Share2,
  Users,
  Clock,
  ThumbsUp,
  CheckCircle2,
  MessageSquare,
  Loader2,
  AlertCircle
} from "lucide-react";
import { requestsApi } from "@/services/api";

interface Request {
  id: number;
  title: string;
  description: string;
  type: string;
  status: string;
  submitted_to: string;
  category: string;
  submitter_id: number;
  submitter_name: string;
  submitter_avatar?: string;
  supporters: number;
  required: number;
  progress: number;
  resolution?: string;
  response_time?: string;
  submitted_at: string;
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    pending: "bg-yellow-100 text-yellow-700",
    "in-review": "bg-blue-100 text-blue-700",
    resolved: "bg-green-100 text-green-700",
  };
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status as keyof typeof colors] || "bg-gray-100 text-gray-700"}`}>
      {status}
    </span>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const colors = {
    technical: "bg-purple-100 text-purple-700",
    academic: "bg-blue-100 text-blue-700",
    facilities: "bg-orange-100 text-orange-700",
  };
  
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[category as keyof typeof colors] || "bg-gray-100 text-gray-700"}`}>
      {category}
    </span>
  );
}

export function RequestsOriginal() {
  const [activeTab, setActiveTab] = useState("all");
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await requestsApi.getAll();
      setRequests(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests');
      console.error('Error loading requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = activeTab === "all"
    ? requests
    : activeTab === "my"
      ? requests.filter(req => req.submitter_name.includes("You") || req.submitter_name === "Sarah Johnson")
      : activeTab === "class"
        ? requests.filter(req => req.type === "Class Request")
        : requests.filter(req => req.status === "Resolved");

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

      <div className="flex-1 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
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

          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading requests...</span>
            </div>
          )}

          {error && (
            <Card className="p-6 border-red-200 bg-red-50">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Failed to load requests</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <Button onClick={loadRequests} variant="outline" size="sm" className="ml-auto">
                  Retry
                </Button>
              </div>
            </Card>
          )}

          {!loading && !error && (
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

                    <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm md:grid-cols-4">
                      <div>
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          To: {request.submitted_to}
                        </span>
                      </div>
                      <div>
                        <span className="flex items-center gap-2 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          Submitted: {request.submitted_at}
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

                    {request.response_time && (
                      <div className="mb-4 text-sm text-muted-foreground">
                        {request.response_time}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={request.submitter_avatar}
                          alt={request.submitter_name}
                          className="h-8 w-8 rounded-full"
                        />
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {request.submitter_name}
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
          )}
        </div>
      </div>
    </div>
  );
}