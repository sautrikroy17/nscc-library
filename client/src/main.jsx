import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';
import './mobile.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initializeSecurityProtection } from './utils/security';

// Initialize tamper-proofing, DevTools protection, and contextmenu lockdown
initializeSecurityProtection();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  </StrictMode>
);
