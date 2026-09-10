import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (message, title = 'Success') => addToast({ type: 'success', title, message }),
    error: (message, title = 'Error') => addToast({ type: 'error', title, message, duration: 6000 }),
    warning: (message, title = 'Warning') => addToast({ type: 'warning', title, message }),
    info: (message, title = 'Info') => addToast({ type: 'info', title, message }),
  };

  const getToastStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          border: '1px solid rgba(16, 185, 129, 0.3)',
          bg: 'rgba(6, 78, 59, 0.92)',
          color: '#34d399',
          icon: CheckCircle2,
        };
      case 'error':
        return {
          border: '1px solid rgba(239, 68, 68, 0.3)',
          bg: 'rgba(127, 29, 29, 0.92)',
          color: '#f87171',
          icon: AlertCircle,
        };
      case 'warning':
        return {
          border: '1px solid rgba(245, 158, 11, 0.3)',
          bg: 'rgba(120, 53, 15, 0.92)',
          color: '#fbbf24',
          icon: AlertTriangle,
        };
      default:
        return {
          border: '1px solid rgba(99, 102, 241, 0.3)',
          bg: 'rgba(30, 27, 75, 0.92)',
          color: '#818cf8',
          icon: Info,
        };
    }
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: '0.65rem',
          maxWidth: '380px',
          width: 'calc(100vw - 3rem)',
          pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => {
          const config = getToastStyles(t.type);
          const Icon = config.icon;
          return (
            <div
              key={t.id}
              style={{
                pointerEvents: 'auto',
                backgroundColor: config.bg,
                border: config.border,
                borderRadius: '10px',
                padding: '0.85rem 1rem',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                animation: 'toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                color: '#f8fafc',
              }}
            >
              <Icon size={18} color={config.color} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                {t.title && (
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: config.color, marginBottom: '2px' }}>
                    {t.title}
                  </div>
                )}
                <div style={{ fontSize: '0.78rem', color: '#e2e8f0', lineHeight: 1.4, wordBreak: 'break-word' }}>
                  {t.message}
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255,255,255,0.6)',
                  cursor: 'pointer',
                  padding: '2px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      success: (msg) => console.log('[Success Toast]:', msg),
      error: (msg) => console.error('[Error Toast]:', msg),
      warning: (msg) => console.warn('[Warning Toast]:', msg),
      info: (msg) => console.info('[Info Toast]:', msg),
    };
  }
  return context;
}
