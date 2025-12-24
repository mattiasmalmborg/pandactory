import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(_error: Error): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleResetGame = () => {
    if (window.confirm('Are you sure you want to reset the game? This will delete all progress!')) {
      localStorage.removeItem('pandactory-save');
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg border border-red-700/50 p-6 max-w-2xl w-full space-y-4">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-red-400 mb-2">🚨 Oops! Something went wrong</h1>
              <p className="text-gray-300">
                Dr. Redd Pawston III encountered an unexpected error. Don't worry, your progress is safe!
              </p>
            </div>

            {this.state.error && (
              <div className="bg-gray-900/50 rounded p-4 border border-gray-700">
                <h2 className="text-sm font-semibold text-red-300 mb-2">Error Details:</h2>
                <pre className="text-xs text-gray-400 overflow-auto max-h-40">
                  {this.state.error.toString()}
                </pre>
              </div>
            )}

            {this.state.errorInfo && (
              <details className="bg-gray-900/50 rounded p-4 border border-gray-700">
                <summary className="text-sm font-semibold text-gray-300 cursor-pointer">
                  Component Stack (for debugging)
                </summary>
                <pre className="text-xs text-gray-400 overflow-auto max-h-60 mt-2">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 px-4 rounded font-semibold transition-all"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-3 px-4 rounded font-semibold transition-all"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleResetGame}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-3 px-4 rounded font-semibold transition-all"
              >
                Reset Game
              </button>
            </div>

            <div className="text-center text-xs text-gray-500">
              If this keeps happening, please report the issue on{' '}
              <a
                href="https://github.com/anthropics/claude-code/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-300"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
