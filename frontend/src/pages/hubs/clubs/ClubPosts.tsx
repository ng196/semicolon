import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Pin, Trash2, Edit2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { clubsApi } from "@/services/api";

interface Post {
    id: number;
    club_id: number;
    author_id: number;
    author_name: string;
    author_username: string;
    author_avatar: string;
    title: string;
    content: string;
    type: string;
    pinned: boolean;
    created_at: string;
    updated_at: string;
}

interface ClubPostsProps {
    clubId: string;
    userRole: string | null;
}

export default function ClubPosts({ clubId, userRole }: ClubPostsProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', type: 'general' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadPosts();
    }, [clubId]);

    const loadPosts = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await clubsApi.getPosts(clubId);
            setPosts(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load posts');
            console.error('Error loading posts:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async () => {
        if (!newPost.content.trim()) {
            alert('Content is required');
            return;
        }

        try {
            setSubmitting(true);
            await clubsApi.createPost(clubId, newPost);
            setNewPost({ title: '', content: '', type: 'general' });
            setShowCreateForm(false);
            loadPosts();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to create post');
        } finally {
            setSubmitting(false);
        }
    };

    const handlePinPost = async (postId: number, pinned: boolean) => {
        try {
            await clubsApi.pinPost(clubId, postId, !pinned);
            loadPosts();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to pin post');
        }
    };

    const handleDeletePost = async (postId: number) => {
        if (!confirm('Are you sure you want to delete this post?')) return;

        try {
            await clubsApi.deletePost(clubId, postId);
            loadPosts();
        } catch (err) {
            alert(err instanceof Error ? err.message : 'Failed to delete post');
        }
    };

    const canManagePosts = userRole === 'leader' || userRole === 'admin' || userRole === 'moderator';

    const getPostTypeBadge = (type: string) => {
        const variants: Record<string, { variant: any; label: string }> = {
            announcement: { variant: 'default', label: 'Announcement' },
            discussion: { variant: 'secondary', label: 'Discussion' },
            general: { variant: 'outline', label: 'General' },
        };
        const config = variants[type] || variants.general;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    if (loading) {
        return (
            <div className="flex h-[30vh] items-center justify-center">
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
                    <Button onClick={loadPosts}>Try Again</Button>
                </div>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Create Post Form */}
            {!showCreateForm ? (
                <Card className="p-4">
                    <Button onClick={() => setShowCreateForm(true)} className="w-full">
                        Create New Post
                    </Button>
                </Card>
            ) : (
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Create Post</h3>
                    <div className="space-y-4">
                        <Input
                            placeholder="Post title (optional)"
                            value={newPost.title}
                            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                        />
                        <Textarea
                            placeholder="What's on your mind?"
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                            rows={4}
                        />
                        <Select
                            value={newPost.type}
                            onValueChange={(value) => setNewPost({ ...newPost, type: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="announcement">Announcement</SelectItem>
                                <SelectItem value="discussion">Discussion</SelectItem>
                            </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                            <Button onClick={handleCreatePost} disabled={submitting}>
                                {submitting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="mr-2 h-4 w-4" />
                                )}
                                Post
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowCreateForm(false);
                                    setNewPost({ title: '', content: '', type: 'general' });
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            {/* Posts List */}
            {posts.length === 0 ? (
                <Card className="p-12">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <AlertCircle className="h-12 w-12 text-muted-foreground" />
                        <p className="text-lg text-muted-foreground">No posts yet</p>
                        <p className="text-sm text-muted-foreground">Be the first to post!</p>
                    </div>
                </Card>
            ) : (
                posts.map((post) => (
                    <Card key={post.id} className={`p-6 ${post.pinned ? 'border-primary' : ''}`}>
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <img
                                    src={post.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author_username}`}
                                    alt={post.author_name}
                                    className="h-10 w-10 rounded-full"
                                />
                                <div>
                                    <p className="font-semibold">{post.author_name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        @{post.author_username} · {new Date(post.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {post.pinned && <Pin className="h-4 w-4 text-primary" />}
                                {getPostTypeBadge(post.type)}
                            </div>
                        </div>

                        {post.title && (
                            <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                        )}
                        <p className="text-muted-foreground whitespace-pre-wrap mb-4">{post.content}</p>

                        {canManagePosts && (
                            <div className="flex gap-2 pt-4 border-t">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handlePinPost(post.id, post.pinned)}
                                >
                                    <Pin className="mr-2 h-4 w-4" />
                                    {post.pinned ? 'Unpin' : 'Pin'}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeletePost(post.id)}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                </Button>
                            </div>
                        )}
                    </Card>
                ))
            )}
        </div>
    );
}
