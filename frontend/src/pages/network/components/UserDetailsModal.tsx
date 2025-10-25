import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  MessageCircle,
  UserPlus,
  Mail,
  Phone,
  BookOpen,
  Users,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import { User } from '../types';

interface UserDetailsModalProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onContact: (user: User) => void;
  onAddFriend: (user: User) => void;
}

export default function UserDetailsModal({
  user,
  open,
  onClose,
  onContact,
  onAddFriend,
}: UserDetailsModalProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="h-20 w-20 rounded-full border-4 border-background shadow-lg"
              />
              {user.online && (
                <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full border-2 border-white bg-green-500" />
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-1">{user.name}</DialogTitle>
              <p className="text-muted-foreground">
                {user.specialization} • {user.year}
              </p>
              {user.lastSeen && (
                <p className="text-xs text-muted-foreground mt-1">
                  {user.lastSeen}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {user.bio && (
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-muted-foreground">{user.bio}</p>
            </div>
          )}

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <GraduationCap className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Year</div>
                <div className="font-medium">{user.year}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <BookOpen className="h-5 w-5 text-primary" />
              <div>
                <div className="text-xs text-muted-foreground">Major</div>
                <div className="font-medium">{user.specialization}</div>
              </div>
            </div>
          </div>

          {user.sharedClasses && user.sharedClasses.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Shared Classes ({user.sharedClasses.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.sharedClasses.map((cls) => (
                  <Badge key={cls} variant="secondary">
                    {cls}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {user.attendanceRate !== undefined && user.attendanceRate !== null && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Attendance Rate
              </h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        user.attendanceRate >= 95
                          ? 'bg-green-500'
                          : user.attendanceRate >= 90
                          ? 'bg-yellow-500'
                          : 'bg-orange-500'
                      }`}
                      style={{ width: `${user.attendanceRate}%` }}
                    />
                  </div>
                </div>
                <span className="font-semibold text-lg">{user.attendanceRate}%</span>
              </div>
            </div>
          )}

          {user.interests && user.interests.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {user.interests.map((interest) => (
                  <Badge key={interest} variant="outline">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {user.clubs && user.clubs.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Clubs & Organizations
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.clubs.map((club) => (
                  <Badge key={club} variant="secondary">
                    {club}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          <div className="flex gap-2">
            <Button
              className="flex-1"
              onClick={() => {
                onContact(user);
                onClose();
              }}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Send Message
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                onAddFriend(user);
                onClose();
              }}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Friend
            </Button>
          </div>

          {(user.email || user.phone) && (
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-3">Contact Information</h3>
              <div className="space-y-2">
                {user.email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                )}
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
