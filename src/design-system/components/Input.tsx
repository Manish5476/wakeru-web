import React, { InputHTMLAttributes, forwardRef, useId } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helpText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, helpText, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    
    return (
      <div className="flex flex-col space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--color-wakeru-text-primary)]">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`flex h-10 w-full rounded-[var(--radius-control)] border ${
            error 
              ? 'border-[var(--color-wakeru-danger)] focus:ring-[var(--color-wakeru-danger)]' 
              : 'border-[var(--color-wakeru-border-strong)] focus:ring-[var(--color-wakeru-primary)]'
          } bg-[var(--color-wakeru-bg)] px-3 py-2 text-sm text-[var(--color-wakeru-text-primary)] placeholder:text-[var(--color-wakeru-text-muted)] focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${className}`}
          {...props}
        />
        {error && <p className="text-xs text-[var(--color-wakeru-danger)]">{error}</p>}
        {helpText && !error && <p className="text-xs text-[var(--color-wakeru-text-secondary)]">{helpText}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
