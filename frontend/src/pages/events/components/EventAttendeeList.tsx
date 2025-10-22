export default function EventAttendeeList({ attendees }: any) {
    try {
        if (!attendees || attendees.length === 0) return null;

        return (
            <div className="flex -space-x-2">
                {attendees.slice(0, 4).map((attendee: any, i: number) => (
                    <img key={i} src={attendee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="Attendee" className="h-6 w-6 rounded-full border-2 border-background" />
                ))}
                {attendees.length > 4 && <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs">+{attendees.length - 4}</span>}
            </div>
        );
    } catch (error) {
        console.error('EventAttendeeList render error:', error);
        return null;
    }
}
