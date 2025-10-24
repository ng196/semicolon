import { Rocket, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComingSoonProps {
    title: string;
    description?: string;
    onViewPreview?: () => void;
}

export function ComingSoon({ title, description, onViewPreview }: ComingSoonProps) {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <Rocket className="h-10 w-10 text-primary" />
            </div>
            <h1 className="mb-3 text-3xl font-bold">{title}</h1>
            <p className="mb-6 max-w-md text-muted-foreground">
                {description || "We're working hard to bring you this feature. Stay tuned for updates!"}
            </p>
            <div className="flex items-center gap-4">
                <div className="rounded-lg bg-muted px-6 py-3">
                    <p className="text-sm font-medium">Coming Soon</p>
                </div>
                {onViewPreview && (
                    <Button 
                        variant="outline" 
                        onClick={onViewPreview}
                        className="gap-2"
                    >
                        <Eye className="h-4 w-4" />
                        View Preview
                    </Button>
                )}
            </div>
        </div>
    );
}