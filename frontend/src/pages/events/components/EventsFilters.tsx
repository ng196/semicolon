import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function EventsFilters({ search, setSearch, clubFilter, setClubFilter, categoryFilter, setCategoryFilter, clubs }: any) {
    try {
        return (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                <div className="relative flex-1 max-w-full sm:max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="Search events..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                </div>
                <Select value={clubFilter} onValueChange={setClubFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Clubs</SelectItem>
                        {clubs?.map((club: any) => <SelectItem key={club} value={club}>{club}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Career">Career</SelectItem>
                        <SelectItem value="Workshop">Workshop</SelectItem>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="Cultural">Cultural</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        );
    } catch (error) {
        console.error('EventsFilters render error:', error);
        return null;
    }
}
