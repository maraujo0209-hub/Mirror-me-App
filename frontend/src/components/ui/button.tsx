'use client';

import React, { ButtonHTMLAttributes, forwardRef } from 'react';

// Combined utility helper to cleanly merge Tailwind classes without style-clobbering conflicts
const cn = (...classes: (string | undefined | null | boolean)[]) => {
  return classes.filter(Boolean).join(' ');
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    
    // 1. Core structural layout configurations
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 select-none';

    // 2. Custom color aesthetics design matrices
    const variants = {
      primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/10 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900',
      secondary: 'bg-slate-800 hover:bg-slate-750 text-slate-100 focus-visible:ring-2 focus-visible:ring-slate-750',
      outline: 'bg-transparent border border-slate-700 hover:bg-slate-800 text-slate-200 focus-visible:ring-2 focus-visible:ring-slate-700',
      danger: 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/10 focus-visible:ring-2 focus-visible:ring-rose-500',
      ghost: 'bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-100',
    };

    // 3. Sizing padding/typography scale maps
    const sizes = {
      sm: 'px-3 py-1.5 text-xs gap-1.5',
      md: 'px-5 py-2.5 text-sm gap-2',
      lg: 'px-6 py-3.5 text-base gap-2.5',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {/* INLINE LOADING SPINNER LAYER */}
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {/* COMPONENT INTERNALS RENDER TREE */}
        {!isLoading && leftIcon && <span className="flex shrink-0">{leftIcon}</span>}
        
        <span className="truncate">{children}</span>
        
        {!isLoading && rightIcon && <span className="flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
