import React, { ButtonHTMLAttributes } from 'react';

export type Variant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'destructive'
  | 'glass'
  | 'gold'
  | 'gradient';

type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-xl disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] cursor-pointer';

  const variants: Record<Variant, string> = {
    primary:
      'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-100 shadow-md focus:ring-zinc-900',
    secondary:
      'bg-white/70 dark:bg-zinc-800/70 backdrop-blur-md border border-black/5 dark:border-white/10 text-[var(--color-wakeru-text-primary)] hover:bg-white dark:hover:bg-zinc-800 shadow-sm focus:ring-zinc-400',
    outline:
      'border border-zinc-300 dark:border-zinc-700 text-[var(--color-wakeru-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 focus:ring-zinc-400',
    ghost:
      'text-[var(--color-wakeru-text-secondary)] hover:text-[var(--color-wakeru-text-primary)] hover:bg-black/5 dark:hover:bg-white/5 focus:ring-zinc-400',
    danger:
      'bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20 focus:ring-rose-500',
    destructive:
      'bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-500/20 focus:ring-rose-500',
    glass:
      'bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border border-white/40 dark:border-white/10 text-[var(--color-wakeru-text-primary)] hover:bg-white/80 dark:hover:bg-zinc-800/80 shadow-sm focus:ring-zinc-400',
    gold:
      'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-md shadow-amber-500/20 focus:ring-amber-500',
    gradient:
      'bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white hover:opacity-95 shadow-lg focus:ring-zinc-900',
  };

  const sizes: Record<Size, string> = {
    sm: 'h-8 px-3 text-xs rounded-lg',
    md: 'h-10 px-4 text-sm rounded-xl',
    lg: 'h-12 px-6 text-base rounded-2xl',
  };

  const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`;

  return (
    <button className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
}

export default Button;
