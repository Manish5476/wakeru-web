'use client';

import React, { useEffect } from 'react';
import { AppIcon } from './AppIcon';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = 'md',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog card */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${maxWidthClass} bg-[var(--color-wakeru-surface)] border border-[var(--color-wakeru-border)] rounded-[var(--radius-card)] shadow-2xl z-10 my-8 overflow-hidden transition-all duration-200 transform scale-100`}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between p-6 border-b border-[var(--color-wakeru-border)]">
            <div>
              {title && (
                <h3 className="text-lg font-bold text-[var(--color-wakeru-text-primary)] leading-6">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-sm text-[var(--color-wakeru-text-secondary)]">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-[var(--color-wakeru-text-tertiary)] hover:text-[var(--color-wakeru-text-primary)] rounded-lg p-1.5 transition-colors hover:bg-[var(--color-wakeru-surface-muted)]"
              aria-label="Close modal"
            >
              <AppIcon name="x" size={18} />
            </button>
          </div>
        )}

        {/* Content body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 bg-[var(--color-wakeru-surface-muted)] border-t border-[var(--color-wakeru-border)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
