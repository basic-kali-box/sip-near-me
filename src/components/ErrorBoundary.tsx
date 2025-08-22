import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import i18n from '@/i18n';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Enhanced error logging for production debugging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      // Add any additional context that might be helpful
      localStorage: this.getLocalStorageInfo(),
    };

    console.error('Detailed error information:', errorDetails);

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      this.reportErrorToService(errorDetails);
    }

    this.setState({ error, errorInfo });
  }

  private getLocalStorageInfo() {
    try {
      return {
        userEssentials: localStorage.getItem('machroub_user_essentials'),
        hasUserData: !!localStorage.getItem('machroub_user_essentials'),
      };
    } catch (e) {
      return { error: 'Could not access localStorage' };
    }
  }

  private reportErrorToService(errorDetails: any) {
    // Placeholder for error reporting service integration
    // You could integrate with services like Sentry, LogRocket, etc.
    console.warn('Error reporting service not configured:', errorDetails);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
          <Card className="w-full max-w-md glass-strong backdrop-blur-xl border-border/20 shadow-premium">
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-foreground">{i18n.t('errors.somethingWentWrong')}</h2>
                <p className="text-muted-foreground">
                  {i18n.t('errors.unexpectedError')}
                </p>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="text-left bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-mono text-destructive">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleRetry}
                  className="flex-1 bg-gradient-matcha hover:shadow-glow transition-all duration-300"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {i18n.t('errors.tryAgain')}
                </Button>
                <Button
                  variant="outline"
                  onClick={this.handleGoHome}
                  className="flex-1 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300"
                >
                  <Home className="w-4 h-4 mr-2" />
                  {i18n.t('errors.goHome')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  const handleError = (error: Error, errorInfo?: string) => {
    console.error('Error caught by error handler:', error, errorInfo);
    // You could also send this to an error reporting service
  };

  return { handleError };
};
