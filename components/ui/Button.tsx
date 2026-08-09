import * as React from 'react';
import Link from 'next/link';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  size?: 'sm' | 'md' | 'default' | 'lg' | 'icon';
  isLoading?: boolean;
}

type ButtonVariant = NonNullable<ButtonProps['variant']>;
type ButtonSize = NonNullable<ButtonProps['size']>;

const variants: Record<ButtonVariant, string> = {
  default: 'border-ink bg-primary text-primary-foreground hover:bg-primary-hover',
  primary: 'border-ink bg-primary text-primary-foreground hover:bg-primary-hover',
  secondary: 'border-ink bg-secondary text-secondary-foreground hover:bg-card',
  outline: 'border-border bg-card text-foreground hover:border-ink hover:bg-muted',
  ghost: 'border-transparent bg-transparent text-foreground hover:bg-muted',
  destructive: 'border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/85',
  link: 'h-auto border-transparent bg-transparent p-0 text-primary underline-offset-4 hover:underline',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-5 text-sm',
  default: 'h-12 px-5 text-sm',
  lg: 'h-14 px-7 text-base',
  icon: 'h-11 w-11',
};

function buttonClassName(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-full border font-extrabold transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20',
    'disabled:cursor-not-allowed disabled:opacity-50',
    variant !== 'link' && 'hover:-translate-y-0.5 hover:shadow-[3px_3px_0_var(--ink)]',
    variants[variant],
    sizes[size],
    className
  );
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonClassName(variant, size, className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export interface ButtonLinkProps extends React.ComponentProps<typeof Link> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export function ButtonLink({ className, variant = 'primary', size = 'md', children, ...props }: ButtonLinkProps) {
  return <Link className={buttonClassName(variant, size, className)} {...props}>{children}</Link>;
}

export { Button };
