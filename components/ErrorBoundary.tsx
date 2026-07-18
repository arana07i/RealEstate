'use client';

import { Component, ReactNode } from 'react';
import { logger } from '@/lib/logger';
import { reportError, setupGlobalErrorHandler } from '@/lib/monitoring';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  override componentDidMount() {
    setupGlobalErrorHandler();
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('ErrorBoundary caught', { message: error.message, componentStack: errorInfo.componentStack });
    reportError(error, { componentStack: errorInfo.componentStack });
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
          <h2 className="text-xl font-bold text-primary">Something went wrong</h2>
          <p className="mt-2 text-muted-foreground">Please refresh the page or try again later.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="btn btn-primary mt-4"
          >
            Refresh Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}