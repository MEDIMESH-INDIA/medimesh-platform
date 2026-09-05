import { Component } from 'react';
import Button from './Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
          <div className="max-w-md rounded-2xl border border-border bg-white p-6 text-center shadow-sm" role="alert">
            <h1 className="text-xl font-semibold text-foreground">MEDIMESH could not load this page.</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              An unexpected error occurred while rendering this view.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Button onClick={() => window.location.reload()}>
                Try again
              </Button>
              <Button onClick={() => window.location.href = '/'} variant="outline">
                Go home
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
