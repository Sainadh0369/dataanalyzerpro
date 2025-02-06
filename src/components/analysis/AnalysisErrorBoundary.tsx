import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AnalysisErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Analysis error:', error, errorInfo);
    // Enhanced error handling
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Log error details
    console.error('Detailed error:', errorDetails);

    // Store error for recovery
    sessionStorage.setItem('lastError', JSON.stringify(errorDetails));
  }

  private handleRetry = async () => {
    try {
      // Clear error state
      this.setState({ hasError: false, error: null });
      
      // Attempt to recover last state
      const lastError = sessionStorage.getItem('lastError');
      if (lastError) {
        console.log('Recovering from error:', JSON.parse(lastError));
        sessionStorage.removeItem('lastError');
      }
    } catch (error) {
      console.error('Recovery failed:', error);
      this.setState({ 
        hasError: true, 
        error: new Error('Recovery failed. Please refresh the page.') 
      });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[200px] flex items-center justify-center bg-red-50 p-6 rounded-lg">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Analysis Error</h2>
            <p className="text-gray-600 mb-4">
              {this.state.error?.message || 'The analysis encountered an unexpected error. Please try again.'}
            </p>
            <div className="space-x-4">
              <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 border border-red-200 text-red-600 text-sm rounded-lg hover:bg-red-50 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}