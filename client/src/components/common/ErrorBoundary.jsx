import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-canvas, #050505)',
            color: 'var(--text-primary, #ffffff)',
            padding: '2rem',
            fontFamily: 'var(--font-sans, -apple-system, sans-serif)',
          }}
        >
          <div
            style={{
              maxWidth: '540px',
              width: '100%',
              backgroundColor: 'var(--bg-surface, #0d0d0f)',
              border: '1px solid var(--border-default, rgba(255,255,255,0.12))',
              borderRadius: '16px',
              padding: '2rem',
              boxShadow: '0 20px 48px rgba(0,0,0,0.5)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Something went wrong
            </h2>

            <p
              style={{
                fontSize: '0.85rem',
                color: 'var(--text-muted, #a1a1aa)',
                marginBottom: '1.5rem',
                lineHeight: 1.5,
              }}
            >
              The application encountered an unexpected runtime issue. You can reload the page or reset the view.
            </p>

            {this.state.error && (
              <div
                style={{
                  backgroundColor: 'var(--bg-surface-raised, #141416)',
                  border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
                  borderRadius: '8px',
                  padding: '0.85rem',
                  fontSize: '0.78rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  color: '#f87171',
                  textAlign: 'left',
                  marginBottom: '1.5rem',
                  overflowX: 'auto',
                  maxHeight: '160px',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {this.state.error.toString()}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                onClick={this.handleReload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '8px',
                  backgroundColor: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <RefreshCw size={16} />
                Reload Page
              </button>

              <button
                type="button"
                onClick={this.handleReset}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.6rem 1.2rem',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary, #ffffff)',
                  border: '1px solid var(--border-default, rgba(255,255,255,0.14))',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Home size={16} />
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
