import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/format';

type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';
type IconPosition = 'left' | 'right';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconPosition?: IconPosition;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'text-white bg-gradient-primary shadow-md hover:shadow-glow-primary hover:-translate-y-0.5 focus:ring-primary-400',
  accent:
    'text-white bg-gradient-accent shadow-md hover:shadow-glow-accent hover:-translate-y-0.5 focus:ring-accent-400',
  outline:
    'border-2 border-neutral-200 bg-white text-neutral-700 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 focus:ring-primary-300',
  ghost: 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
  danger: 'text-white bg-danger-500 hover:bg-danger-600 focus:ring-danger-400',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2.5',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  className,
  disabled,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const content = (
    <>
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!loading && icon && iconPosition === 'left' && icon}
      {children && <span>{children}</span>}
      {!loading && icon && iconPosition === 'right' && icon}
    </>
  );

  const buttonProps = {
    type,
    disabled: isDisabled,
    className: cn(
      'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
      variantClasses[variant],
      sizeClasses[size],
      className
    ),
    ...props,
  };

  if (isDisabled) {
    return <span {...buttonProps}>{content}</span>;
  }

  return <button {...buttonProps}>{content}</button>;
}
