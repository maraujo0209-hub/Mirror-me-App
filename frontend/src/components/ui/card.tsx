'use client';

import React, { HTMLAttributes, forwardRef } from 'react';

// Unified utility helper to cleanly merge Tailwind classes without style clashing
const cn = (...classes: (string | undefined | null | boolean)[]) => {
  return classes.filter(Boolean).join(' ');
};

// ============================================================================
// 1. CARD CONTAINER ROOT LAYER
// ============================================================================
export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

const Card = forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'bg-slate-950 border border-slate-800/80 text-slate-100 rounded-2xl shadow-xl transition-all duration-200',
      className
    )}
    {...props}
  />
));
Card.displayName = 'Card';

// ============================================================================
// 2. CARD HEADER SECTION
// ============================================================================
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6 border-b border-slate-900/60', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

// ============================================================================
// 3. CARD TITLE ELEMENT
// ============================================================================
export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg md:text-xl font-bold tracking-tight text-white leading-none', className)}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

// ============================================================================
// 4. CARD DESCRIPTION STRUCT
// ============================================================================
export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-xs md:text-sm text-slate-400 font-medium leading-relaxed', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

// ============================================================================
// 5. CARD CONTENT CONTAINER
// ============================================================================
export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-4', className)} {...props} />
));
CardContent.displayName = 'CardContent';

// ============================================================================
// 6. CARD FOOTER MODULE
// ============================================================================
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0 border-t border-slate-900/40 mt-4', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

// Export all structural component variants
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
