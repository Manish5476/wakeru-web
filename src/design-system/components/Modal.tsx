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
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth,
  size = 'md',
}: ModalProps) {
  const chosenSize = maxWidth || size;

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
  }[chosenSize];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className={`relative w-full ${maxWidthClass} rounded-[var(--radius-card)] bg-[var(--color-wakeru-surface-elevated)] border border-[var(--color-wakeru-border)] shadow-[var(--shadow-floating)] transition-all animate-in zoom-in-95 duration-150 z-10`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between p-5 border-b border-[var(--color-wakeru-border)]">
            <div className="space-y-1 pr-6">
              {title && (
                <h3 className="text-base font-bold text-[var(--color-wakeru-text-primary)] leading-none">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-xs text-[var(--color-wakeru-text-secondary)]">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-[var(--color-wakeru-text-tertiary)] hover:text-[var(--color-wakeru-text-primary)] rounded-full p-1 hover:bg-[var(--color-wakeru-surface-muted)] transition-colors"
              aria-label="Close modal"
            >
              <AppIcon name="x" size={16} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-[var(--color-wakeru-border)] bg-[var(--color-wakeru-surface)] rounded-b-[var(--radius-card)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
