import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';

// ─── Context ────────────────────────────────────────────────────────────────

export const ToastContext = createContext(null);

// ─── Icons (inline SVG, no external library) ────────────────────────────────

function SuccessIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 flex-shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 flex-shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-5 w-5 flex-shrink-0"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ─── Type config ────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  success: {
    icon: <SuccessIcon />,
    containerClass: 'bg-green-50 border-green-400 text-green-800',
    iconClass: 'text-success',
  },
  error: {
    icon: <ErrorIcon />,
    containerClass: 'bg-red-50 border-red-400 text-red-800',
    iconClass: 'text-danger',
  },
  warning: {
    icon: <WarningIcon />,
    containerClass: 'bg-amber-50 border-amber-400 text-amber-800',
    iconClass: 'text-warning',
  },
};

const MAX_TOASTS = 3;
const AUTO_DISMISS_MS = 3000;

// ─── Single Toast item ───────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }) {
  const config = TYPE_CONFIG[toast.type] ?? TYPE_CONFIG.success;

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={`flex items-start gap-3 w-80 max-w-full rounded-lg border px-4 py-3 shadow-lg
        transition-all duration-300 ease-in-out
        ${config.containerClass}`}
    >
      {/* Icon */}
      <span className={`mt-0.5 ${config.iconClass}`}>{config.icon}</span>

      {/* Message */}
      <p className="flex-1 text-sm font-medium leading-snug break-words">
        {toast.message}
      </p>

      {/* Close button */}
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="ml-auto flex-shrink-0 rounded p-0.5 opacity-60 hover:opacity-100
          focus:outline-none focus:ring-2 focus:ring-current transition-opacity"
        aria-label="Dismiss notification"
      >
        <CloseIcon />
      </button>
    </div>
  );
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  // Keep a ref to timers so we can clear them on manual dismiss
  const timersRef = useRef({});

  const dismissToast = useCallback((id) => {
    // Clear the auto-dismiss timer if it's still pending
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, type = 'success') => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      setToasts((prev) => {
        // If already at cap, evict the oldest (first in array) before adding
        const trimmed = prev.length >= MAX_TOASTS ? prev.slice(1) : prev;
        return [...trimmed, { id, message, type }];
      });

      // Schedule auto-dismiss
      const timer = setTimeout(() => {
        dismissToast(id);
      }, AUTO_DISMISS_MS);

      timersRef.current[id] = timer;
    },
    [dismissToast]
  );

  // Clean up all timers on unmount
  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
    };
  }, []);

  // Listen to window custom events dispatched by Zustand stores
  // (attendanceStore, taskStore, ratingStore dispatch toast:warning / toast:error)
  useEffect(() => {
    function handleWarning(e) { showToast(e.detail?.message ?? 'Warning', 'warning'); }
    function handleError(e)   { showToast(e.detail?.message ?? 'Error',   'error');   }
    function handleSuccess(e) { showToast(e.detail?.message ?? 'Success', 'success'); }
    window.addEventListener('toast:warning', handleWarning);
    window.addEventListener('toast:error',   handleError);
    window.addEventListener('toast:success', handleSuccess);
    return () => {
      window.removeEventListener('toast:warning', handleWarning);
      window.removeEventListener('toast:error',   handleError);
      window.removeEventListener('toast:success', handleSuccess);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast }}>
      {children}

      {/* Toast container — fixed top-right */}
      <div
        aria-label="Notifications"
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={dismissToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
