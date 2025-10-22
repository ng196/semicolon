import { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class EventErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: any) {
        console.error('Event component error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <Card className="p-6 border-red-200 bg-red-50">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <div>
                            <p className="font-medium text-red-900">Something went wrong</p>
                            <p className="text-sm text-red-700">{this.state.error?.message}</p>
                        </div>
                    </div>
                </Card>
            );
        }

        return this.props.children;
    }
}
