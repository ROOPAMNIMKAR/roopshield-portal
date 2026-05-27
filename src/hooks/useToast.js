import { useContext } from 'react';
import { ToastContext } from '../components/ToastProvider';

/**
 * useToast — access the global toast notification service.
 *
 * Must be used inside a <ToastProvider> tree.
 *
 * @returns {{ showToast: (message: string, type?: 'success'|'error'|'warning') => void,
 *             dismissToast: (id: string) => void,
 *             toasts: Array }}
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}

export default useToast;
