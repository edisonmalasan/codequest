'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-sm font-sans font-semibold transition-all duration-quick ease-ui outline-none select-none focus-visible:ring-2 focus-visible:ring-ascent focus-visible:ring-offset-2 focus-visible:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-45 active:translate-y-px active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: 'bg-ascent text-ascent-ink hover:brightness-110',
        secondary:
          'border border-line bg-surface-raised text-ink hover:border-muted',
        ghost: 'text-muted hover:bg-surface-raised hover:text-ink',
        danger: 'bg-danger text-surface hover:brightness-110',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4 text-base',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

export function Button({
  variant,
  size,
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps): React.JSX.Element {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <span aria-live="polite">Loading…</span> : children}
    </button>
  );
}
