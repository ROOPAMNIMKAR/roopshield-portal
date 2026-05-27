import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

/**
 * ConfirmDialog — reusable delete/action confirmation built on <Modal>.
 *
 * @param {{
 *   isOpen: boolean,
 *   message: string,
 *   onConfirm: () => void,
 *   onCancel: () => void,
 *   title?: string,
 *   confirmLabel?: string,
 *   cancelLabel?: string,
 * }} props
 */
export function ConfirmDialog({
  isOpen,
  message,
  onConfirm,
  onCancel,
  title = 'Confirm Action',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
}) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} size="sm">
      {/* Warning icon + message */}
      <div className="flex items-start gap-3 mb-6">
        <div className="flex-shrink-0 mt-0.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-danger"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>
        <p className="text-sm text-textPrimary leading-relaxed">{message}</p>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
