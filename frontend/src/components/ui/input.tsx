'use client';

import React, { InputHTMLAttributes, forwardRef } from 'react';

// Unified utility helper to cleanly merge Tailwind classes without style clashing
const cn = (...classes: (string | undefined | null | boolean)[]) => {
  return classes.filter(Boolean).join(' ');
};

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', error = false, disabled, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base input typography, layout, and background transitions
          'flex h-11 w-full rounded-xl border bg-slate-950 px-4 py-2 text-sm text-slate-100 placeholder:text-slate-500 transition-all duration-200 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          
          // Dynamic status state mapping rules
          error
            ? 'border-rose-500/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
            : 'border-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 hover:border-slate-700',
          
          className
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export default Input;
