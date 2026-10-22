import React from 'react';

export type GlassCardVariant = 'subtle' | 'medium' | 'prominent' | 'soft' | 'warm';
export type GlassCardPadding = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: GlassCardVariant;
  padding?: GlassCardPadding;
  interactive?: boolean;
  children: React.ReactNode;
}

const paddingStyles: Record<GlassCardPadding, string> = {
  none: 'p-0',
  xs: 'p-2',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6 sm:p-7',
  xl: 'p-8 sm:p-10',
};

const variantClasses: Record<GlassCardVariant, string> = {
  subtle: 'glass-panel-subtle',
  medium: 'glass-panel',
  prominent: 'glass-panel-prominent',
  soft: 'glass-panel-soft',
  warm: 'glass-panel-warm',
};

export function GlassCard({
  variant = 'medium',
  padding = 'md',
  interactive = false,
  className = '',
  children,
  onClick,
  ...rest
}: GlassCardProps) {
  const panelClass = variantClasses[variant] || variantClasses.medium;
  const padClass = paddingStyles[padding];
  const interactiveClasses = interactive
    ? 'cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl active:scale-[0.99]'
    : 'transition-all duration-200';

  return (
    <div
      onClick={onClick}
      className={`rounded-[20px] overflow-hidden ${panelClass} ${padClass} ${interactiveClasses} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export default GlassCard;
