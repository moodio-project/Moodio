import { Component, ErrorInfo, ReactNode } from 'react';
import SpotifyButton from './spotify/SpotifyButton';
import { FaHome, FaRedo } from 'react-icons/fa';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ error, errorInfo });
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
        <div className="min-h-screen bg-spotify-dark-gray flex items-center justify-center p-6">
          <div className="bg-spotify-medium-gray rounded-lg p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-6">😵</div>
            <h1 className="spotify-text-heading-large text-white mb-4">
              Oops! Something went wrong
            </h1>
            <p className="spotify-text-body-medium spotify-text-gray mb-6">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>
            
            <div className="space-y-3">
              <SpotifyButton 
                variant="primary" 
                onClick={this.handleRetry}
                className="w-full"
              >
                <FaRedo className="mr-2" />
                Try Again
              </SpotifyButton>
              
              <SpotifyButton 
                variant="secondary" 
                onClick={this.handleGoHome}
                className="w-full"
              >
                <FaHome className="mr-2" />
                Go Home
              </SpotifyButton>
            </div>

            {typeof window !== 'undefined' && window.location.hostname === 'localhost' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="spotify-text-body-small text-spotify-green cursor-pointer mb-2">
                  Error Details (Development)
                </summary>
                <div className="bg-spotify-black rounded p-3 text-xs text-red-400 overflow-auto max-h-32">
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error.message}
                  </div>
                  <div>
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap mt-1">
                      {this.state.error.stack}
                    </pre>
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 