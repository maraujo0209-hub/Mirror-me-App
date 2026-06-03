'use client';

import React, { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes, forwardRef } from 'react';

// Unified utility helper to cleanly merge Tailwind classes without style clashing
const cn = (...classes: (string | undefined | null | boolean)[]) => {
  return classes.filter(Boolean).join(' ');
};

// ============================================================================
// 1. MAIN TABLE WRAPPER (Handles Horizontal Responsiveness)
// ============================================================================
const Table = forwardRef<HTMLTableElement, TableHTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <div className="relative w-full overflow-x-auto rounded-2xl border border-slate-800/80 bg-slate-950 shadow-xl">
      <table
        ref={ref}
        className={cn('w-full caption-bottom text-sm text-slate-200 border-collapse', className)}
        ...props
      />
    </div>
  )
);
Table.displayName = 'Table';

// ============================================================================
// 2. TABLE HEADER (THEAD)
// ============================================================================
const TableHeader = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} className={cn('bg-slate-900/50 border-b border-slate-800', className)} ...props />
  )
);
TableHeader.displayName = 'TableHeader';

// ============================================================================
// 3. TABLE BODY (TBODY)
// ============================================================================
const TableBody = forwardRef<HTMLTableSectionElement, HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <tbody ref={ref} className={cn('divide-y divide-slate-900', className)} ...props />
  )
);
TableBody.displayName = 'TableBody';

// ============================================================================
// 4. TABLE ROW (TR)
// ============================================================================
const TableRow = forwardRef<HTMLTableRowElement, HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr
      ref={ref}
      className={cn(
        'transition-colors duration-150 hover:bg-slate-900/40 data-[state=selected]:bg-slate-800',
        className
      )}
      ...props
    />
  )
);
TableRow.displayName = 'TableRow';

// ============================================================================
// 5. TABLE HEAD CELL (TH)
// ============================================================================
const TableHead = forwardRef<HTMLTableCellElement, ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th
      ref={ref}
      className={cn(
        'h-12 px-4 text-left align-middle font-semibold text-slate-400 tracking-wide text-xs uppercase select-none',
        className
      )}
      ...props
    />
  )
);
TableHead.displayName = 'TableHead';

// ============================================================================
// 6. TABLE DATA CELL (TD)
// ============================================================================
const TableCell = forwardRef<HTMLTableCellElement, TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td
      ref={ref}
      className={cn('p-4 align-middle text-sm text-slate-300 font-medium whitespace-nowrap', className)}
      ...props
    />
  )
);
TableCell.displayName = 'TableCell';

export { Table, TableHeader, TableBody, TableHead, TableRow, TableCell };
