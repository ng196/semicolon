import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Progress } from '@/shared/components/ui/progress';
import { MessageCircle, Users as UsersIcon } from 'lucide-react';
import { User } from '../types';

interface UserCardProps {
  user: User;
  onClick: (user: User) => void;
  onContact: (user: User) => void;
  onAddFriend: (user: User) => void;
}

export default function UserCard({
  user,
  onClick,
  onContact,
  onAddFriend,
}: UserCardProps) {
  return (
    <Card
      className="group overflow-hidden transition-all hover:shadow-lg cursor-pointer"
      onClick={() => onClick(user)}
    >
      <div className="p-6">
        <div className="mb-4 flex items-start gap-4">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="h-16 w-16 rounded-full"
            />
            {user.online && (
              <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
              {user.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {user.specialization} • {user.year}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {user.lastSeen}
            </p>
          </div>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onContact(user);
              }}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onAddFriend(user);
              }}
            >
              <UsersIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-foreground">
            Shared Classes:
            <span className="ml-2 text-muted-foreground">
              {user.sharedClasses?.length || 0} classes
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {user.sharedClasses?.map((cls) => (
              <span
                key={cls}
                className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700"
              >
                {cls}
              </span>
            ))}
          </div>
        </div>

        {user.attendanceRate !== undefined && user.attendanceRate !== null && (
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Attendance Rate:</span>
              <span className="font-semibold text-foreground">
                {user.attendanceRate}%
              </span>
            </div>
            <Progress
              value={user.attendanceRate}
              className={`h-2 ${user.attendanceRate >= 95
                  ? '[&>div]:bg-green-500'
                  : user.attendanceRate >= 90
                    ? '[&>div]:bg-yellow-500'
                    : '[&>div]:bg-orange-500'
                }`}
            />
          </div>
        )}

        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-foreground">Interests:</p>
          <div className="flex flex-wrap gap-2">
            {user.interests?.map((interest) => (
              <span
                key={interest}
                className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        <Button
          className="w-full"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onContact(user);
          }}
        >
          Contact
        </Button>
      </div>
    </Card>
  );
}
