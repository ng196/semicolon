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
  UserPlus,
  Filter,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useNetworkUsers } from '../hooks/useNetworkUsers';
import { User } from '../types';
import UserCard from './UserCard';
import UserDetailsModal from './UserDetailsModal';

export default function NetworkPage() {
  const [activeTab, setActiveTab] = useState('my-classes');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { users, loading, error } = useNetworkUsers();

  const handleContactUser = (user: User) => {
    console.log('Contact user:', user.name);
  };

  const handleAddFriend = (user: User) => {
    console.log('Add friend:', user.name);
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Network</h1>
              <p className="text-sm text-muted-foreground">
                Connect with classmates, friends, and club members
              </p>
            </div>
            <Button className="bg-primary hover:bg-primary/90">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Friend
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList>
              <TabsTrigger value="my-classes">My Classes</TabsTrigger>
              <TabsTrigger value="friends">Friends</TabsTrigger>
              <TabsTrigger value="club-members">Club Members</TabsTrigger>
              <TabsTrigger value="discover">Discover People</TabsTrigger>
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
                  placeholder="Search users by name or specialization..."
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="all-spec">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Specializations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-spec">All Specializations</SelectItem>
                  <SelectItem value="cs">Computer Science</SelectItem>
                  <SelectItem value="math">Mathematics</SelectItem>
                  <SelectItem value="eng">Engineering</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all-years">
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-years">All Years</SelectItem>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="sophomore">Sophomore</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all-classes">
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-classes">All Classes</SelectItem>
                  <SelectItem value="cs301">CS 301</SelectItem>
                  <SelectItem value="math201">MATH 201</SelectItem>
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
              <span className="ml-2 text-muted-foreground">Loading network...</span>
            </div>
          )}

          {error && (
            <Card className="p-6 border-red-200 bg-red-50">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-900">Failed to load network</p>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </Card>
          )}

          {!loading && !error && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  onClick={handleUserClick}
                  onContact={handleContactUser}
                  onAddFriend={handleAddFriend}
                />
              ))}
            </div>
          )}

          {!loading && !error && users.length > 0 && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline">Load More</Button>
            </div>
          )}
        </div>
      </div>

      <UserDetailsModal
        user={selectedUser}
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onContact={handleContactUser}
        onAddFriend={handleAddFriend}
      />
    </div>
  );
}
