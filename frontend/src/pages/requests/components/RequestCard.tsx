import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Eye,
  Share2,
  Users,
  Clock,
  ThumbsUp,
  CheckCircle2,
  MessageSquare,
} from 'lucide-react';
import { Request } from '../types';

interface RequestCardProps {
  request: Request;
  onClick: (request: Request) => void;
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

export default function RequestCard({
  request,
  onClick,
  onSupport,
  onComment,
  onShare,
}: RequestCardProps) {
  return (
    <Card
      className="overflow-hidden transition-all hover:shadow-lg cursor-pointer"
      onClick={() => onClick(request)}
    >
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-start gap-3">
              <h3 className="text-xl font-semibold text-foreground hover:text-primary transition-colors">
                {request.title}
              </h3>
              <div className="flex gap-2">
                <StatusBadge status={request.status} />
                <CategoryBadge category={request.type} />
              </div>
            </div>
            <p className="mb-3 text-sm text-muted-foreground line-clamp-2">
              {request.description}
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onClick(request);
              }}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onShare(request);
              }}
            >
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
              {request.submitted_at}
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
                <p className="font-medium text-green-900 mb-1">
                  Resolution Update
                </p>
                <p className="text-sm text-green-700 line-clamp-2">
                  {request.resolution}
                </p>
              </div>
            </div>
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
            {request.supporters !== undefined && request.supporters > 0 && (
              <>
                <span className="text-muted-foreground">•</span>
                <div className="flex -space-x-2">
                  {[...Array(Math.min(request.supporters, 3))].map((_, i) => (
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
              <Button
                size="sm"
                variant="outline"
                className="gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onSupport(request);
                }}
              >
                <ThumbsUp className="h-4 w-4" />
                Support
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={(e) => {
                e.stopPropagation();
                onComment(request);
              }}
            >
              <MessageSquare className="h-4 w-4" />
              Comment
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
