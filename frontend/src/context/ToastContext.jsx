import { useState, useCallback } from 'react';

let _toasts = [];
let _setToasts = null;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  _setToasts = setToasts;

  return (
    <>
      {children}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </>
  );
}

const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };

export function toast(message, type = 'info', duration = 3500) {
  if (!_setToasts) return;
  const id = Date.now() + Math.random();
  const icon = icons[type] || 'ℹ️';
  _setToasts(prev => [...prev, { id, message, type, icon }]);
  setTimeout(() => {
    _setToasts(prev => prev.filter(t => t.id !== id));
  }, duration);
}

toast.success = (msg, dur) => toast(msg, 'success', dur);
toast.error = (msg, dur) => toast(msg, 'error', dur);
toast.warning = (msg, dur) => toast(msg, 'warning', dur);
toast.info = (msg, dur) => toast(msg, 'info', dur);
