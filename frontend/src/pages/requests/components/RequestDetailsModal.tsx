import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Request } from '../types';

interface RequestDetailsModalProps {
  request: Request | null;
  open: boolean;
  onClose: () => void;
  onSupport: (request: Request) => void;
  onComment: (request: Request) => void;
  onShare: (request: Request) => void;
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-700',
    'in-review': 'bg-blue-100 text-blue-700',
    resolved: 'bg-green-100 text-green-700',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {status}
    </span>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const colors = {
    technical: 'bg-purple-100 text-purple-700',
    academic: 'bg-blue-100 text-blue-700',
    facilities: 'bg-orange-100 text-orange-700',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700'
      }`}
    >
      {category}
    </span>
  );
}

export default function RequestDetailsModal({
  request,
  open,
  onClose,
  onSupport,
  onComment,
  onShare,
}: RequestDetailsModalProps) {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{request.title}</DialogTitle>
              <div className="flex gap-2">
                <StatusBadge status={request.status} />
                <CategoryBadge category={request.type} />
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {request.description}
            </p>
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Submitted To</div>
                <div className="font-medium">{request.submitted_to}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Submitted</div>
                <div className="font-medium">{request.submitted_at}</div>
              </div>
            </div>
          </div>

          {request.supporters !== undefined && request.required && (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5" />
                  Support Progress
                </h3>
                <span className="text-sm font-medium">
                  {request.supporters}/{request.required} required
                </span>
              </div>
              <Progress value={request.progress} className="h-3" />
              <p className="text-xs text-muted-foreground mt-2">
                {request.required - request.supporters} more supporters needed
              </p>
            </div>
          )}

          {request.resolution && (
            <div className="rounded-lg bg-green-50 p-4 border border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-green-900 mb-1">
                    Resolution Update
                  </p>
                  <p className="text-sm text-green-700">{request.resolution}</p>
                  {request.response_time && (
                    <p className="text-xs text-green-600 mt-2">
                      {request.response_time}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <Separator />

          <div>
            <h3 className="font-semibold mb-3">Submitted By</h3>
            <div className="flex items-center gap-3">
              <img
                src={request.submitter_avatar}
                alt={request.submitter_name}
                className="h-12 w-12 rounded-full"
              />
              <div>
                <p className="font-medium">{request.submitter_name}</p>
                <p className="text-sm text-muted-foreground">
                  Category: {request.category}
                </p>
              </div>
            </div>
          </div>

          {request.supporters !== undefined && request.supporters > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Supporters</h3>
              <div className="flex -space-x-2">
                {[...Array(Math.min(request.supporters, 10))].map((_, i) => (
                  <img
                    key={i}
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${request.id}-${i}`}
                    alt="Supporter"
                    className="h-8 w-8 rounded-full border-2 border-background"
                  />
                ))}
                {request.supporters > 10 && (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium">
                    +{request.supporters - 10}
                  </span>
                )}
              </div>
            </div>
          )}

          <Separator />

          <div className="flex gap-2">
            {request.supporters !== undefined && (
              <Button
                className="flex-1"
                onClick={() => {
                  onSupport(request);
                  onClose();
                }}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Support This Request
              </Button>
            )}
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                onComment(request);
                onClose();
              }}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Add Comment
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                onShare(request);
                onClose();
              }}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
