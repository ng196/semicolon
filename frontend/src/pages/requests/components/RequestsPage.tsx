import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Plus,
  Filter,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useRequests } from '../hooks/useRequests';
import { Request } from '../types';
import RequestCard from './RequestCard';
import RequestDetailsModal from './RequestDetailsModal';

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const { requests, loading, error } = useRequests();

  const handleSupportRequest = (request: Request) => {
    console.log('Support request:', request.id);
  };

  const handleCommentRequest = (request: Request) => {
    console.log('Comment on request:', request.id);
  };

  const handleShareRequest = (request: Request) => {
    console.log('Share request:', request.id);
  };

  const handleCreateRequest = () => {
    console.log('Create new request');
  };

  const handleCreateClassRequest = () => {
    console.log('Create class request');
  };

  const handleRequestClick = (request: Request) => {
    setSelectedRequest(request);
  };

  const filteredRequests =
    activeTab === 'all'
      ? requests
      : activeTab === 'my'
      ? requests.filter(
          (req) =>
            req.submitter_name.includes('You') ||
            req.submitter_name === 'Sarah Johnson'
        )
      : activeTab === 'class'
      ? requests.filter((req) => req.type === 'Class Request')
      : requests.filter((req) => req.status === 'Resolved');

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Complaints & Requests
              </h1>
              <p className="text-sm text-muted-foreground">
                Submit complaints and requests to faculty and administration
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-orange-500 text-white hover:bg-orange-600"
                onClick={handleCreateClassRequest}
              >
                <Plus className="mr-2 h-4 w-4" />
                Class Request
              </Button>
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={handleCreateRequest}
              >
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
                <Input placeholder="Search requests..." className="pl-9" />
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
              <span className="ml-2 text-muted-foreground">
                Loading requests...
              </span>
            </div>
          )}

          {error && (
            <Card className="p-6 border-red-200 bg-red-50">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">
                    Failed to load requests
                  </p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onClick={handleRequestClick}
                  onSupport={handleSupportRequest}
                  onComment={handleCommentRequest}
                  onShare={handleShareRequest}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <RequestDetailsModal
        request={selectedRequest}
        open={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        onSupport={handleSupportRequest}
        onComment={handleCommentRequest}
        onShare={handleShareRequest}
      />
    </div>
  );
}
