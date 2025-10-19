import { Component, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: unknown) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({
            hasError: false,
            error: null,
        });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-screen items-center justify-center bg-background p-4">
                    <Card className="max-w-md p-6">
                        <div className="flex flex-col items-center text-center">
                            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                            <h2 className="text-2xl font-bold text-foreground mb-2">
                                Oops! Something went wrong
                            </h2>
                            <p className="text-muted-foreground mb-4">
                                {this.state.error?.message || 'An unexpected error occurred'}
                            </p>
                            <Button onClick={this.handleReset} className="w-full">
                                Try Again
                            </Button>
                        </div>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
