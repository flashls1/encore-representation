import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error boundary that wraps the admin panel to prevent
 * individual tab crashes from blanking the entire CMS.
 */
class AdminErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[AdminErrorBoundary] Caught:', error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                    <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Something went wrong</h2>
                    <p className="text-muted-foreground text-sm max-w-md mb-4">
                        This section encountered an error. Your data is safe — try refreshing.
                    </p>
                    <code className="text-xs text-red-400/80 bg-red-500/5 px-3 py-1.5 rounded max-w-lg break-all mb-6">
                        {this.state.error?.message || 'Unknown error'}
                    </code>
                    <button
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="px-4 py-2 rounded bg-primary text-primary-foreground text-sm hover:opacity-90 transition-opacity"
                    >
                        Try Again
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

export default AdminErrorBoundary;
