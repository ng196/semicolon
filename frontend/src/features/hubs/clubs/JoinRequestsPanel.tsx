import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Check, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Card } from "@/shared/components/ui/card";
import { clubsApi } from "@/api/client";

interface JoinRequest {
    id: number;
    club_id: number;
    user_id: number;
    user_name: string;
    username: string;
    user_avatar: string;
    status: string;
    message: string;
    requested_at: string;
}

interface JoinRequestsPanelProps {
    clubId: string;
}

export default function JoinRequestsPanel({ clubId }: JoinRequestsPanelProps) {
    const [requests, setRequests] = useState<JoinRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState<number | null>(null);

    useEffect(() => {
        loadRequests();
    }, [clubId]);

    const loadRequests = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await clubsApi.getJoinRequests(clubId, 'pending');
            setRequests(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load join requests');
            console.error('Error loading join requests:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId: number) => {
        try {
            setProcessing(requestId);
            await clubsApi.approveJoinRequest(clubId, requestId);
            loadRequests();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to approve request');
        } finally {
            setProcessing(null);
        }
    };

    const handleReject = async (requestId: number) => {
        try {
            setProcessing(requestId);
            await clubsApi.rejectJoinRequest(clubId, requestId);
            loadRequests();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to reject request');
        } finally {
            setProcessing(null);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[20vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <Card className="p-6">
                <div className="flex flex-col items-center justify-center gap-4">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                    <p className="text-lg text-muted-foreground">{error}</p>
                    <Button onClick={loadRequests}>Try Again</Button>
                </div>
            </Card>
        );
    }

    if (requests.length === 0) {
        return (
            <Card className="p-6">
                <p className="text-muted-foreground text-center">No pending join requests</p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pending Join Requests</h3>
            {requests.map((request) => (
                <Card key={request.id} className="p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src={request.user_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${request.username}`}
                                alt={request.user_name}
                                className="h-10 w-10 rounded-full"
                            />
                            <div>
                                <p className="font-semibold">{request.user_name}</p>
                                <p className="text-sm text-muted-foreground">@{request.username}</p>
                                {request.message && (
                                    <p className="text-sm text-muted-foreground mt-1">"{request.message}"</p>
                                )}
                                <p className="text-xs text-muted-foreground mt-1">
                                    Requested {new Date(request.requested_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                onClick={() => handleApprove(request.id)}
                                disabled={processing === request.id}
                            >
                                {processing === request.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Check className="h-4 w-4" />
                                )}
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleReject(request.id)}
                                disabled={processing === request.id}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
