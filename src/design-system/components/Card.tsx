import React from 'react';
import { GlassCard, GlassCardVariant, GlassCardPadding } from './GlassCard';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: GlassCardVariant;
  padding?: GlassCardPadding;
  interactive?: boolean;
}

export function Card({ 
  variant = 'medium',
  padding = 'none',
  interactive = false,
  className = '', 
  children, 
  ...props 
}: CardProps) {
  return (
    <GlassCard 
      variant={variant}
      padding={padding}
      interactive={interactive}
      className={className}
      {...props}
    >
      {children}
    </GlassCard>
  );
}

export function CardHeader({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 sm:p-6 border-b border-white/20 dark:border-white/10 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = '', children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-base sm:text-lg font-semibold tracking-tight text-[var(--color-wakeru-text-primary)] ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className = '', children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;
