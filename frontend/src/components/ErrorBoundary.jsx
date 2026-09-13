import React from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('LibraX Error Boundary caught an exception:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    localStorage.removeItem('nscc_token');
    localStorage.removeItem('librax_cached_user');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#080c14',
          color: '#e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          fontFamily: "'Inter', sans-serif",
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: 480,
            width: '100%',
            background: 'rgba(14, 22, 38, 0.92)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 20,
            padding: '36px 28px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.8), 0 0 30px rgba(244, 63, 94, 0.1)',
            backdropFilter: 'blur(20px)'
          }}>
            <div style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#f43f5e',
              margin: '0 auto 18px'
            }}>
              <AlertTriangle size={26} />
            </div>

            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 20,
              fontWeight: 800,
              color: '#ffffff',
              marginBottom: 8
            }}>
              Interface Notice
            </h2>

            <p style={{ fontSize: 13.5, color: '#94a3b8', lineHeight: 1.6, marginBottom: 20 }}>
              {this.state.error?.message || 'A transient rendering error occurred. The local database and session remain safe.'}
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={this.handleReload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 10,
                  background: '#10b981',
                  color: '#080c14',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer',
                  border: 'none',
                  boxShadow: '0 0 16px rgba(16, 185, 129, 0.3)'
                }}
              >
                <RotateCcw size={15} />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleReset}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 18px',
                  borderRadius: 10,
                  background: 'rgba(255, 255, 255, 0.06)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: 13,
                  cursor: 'pointer',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <Home size={15} />
                <span>Reset to Sign In</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
