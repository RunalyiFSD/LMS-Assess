import React from 'react';

// Base Skeleton element with pulse animation
export const Skeleton = ({ className = '', width, height, rounded = 'rounded-lg' }) => {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 dark:bg-slate-700/50 ${rounded} ${className}`}
      style={{
        width: width !== undefined ? width : undefined,
        height: height !== undefined ? height : undefined,
      }}
    />
  );
};

// Card Skeleton for Metrics / Assessment cards
export const CardSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-8 rounded-xl" />
          </div>
          <Skeleton className="h-8 w-36" />
          <Skeleton className="h-3 w-48" />
        </div>
      ))}
    </div>
  );
};

// Table Skeleton for List / Data Tables
export const TableSkeleton = ({ rows = 5, cols = 4 }) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Table Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex gap-4">
        {Array.from({ length: cols }).map((_, c) => (
          <Skeleton key={c} className="h-4 flex-1" />
        ))}
      </div>
      {/* Table Rows */}
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

// Full Dashboard Layout Skeleton (Stats + Main Widget)
export const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner Skeleton */}
      <div className="p-8 rounded-3xl bg-slate-900/90 text-white space-y-3">
        <Skeleton className="h-8 w-64 bg-slate-700" />
        <Skeleton className="h-4 w-96 bg-slate-800" />
      </div>

      {/* Metric Cards Skeleton */}
      <CardSkeleton count={3} />

      {/* Main Content List Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <TableSkeleton rows={4} cols={4} />
      </div>
    </div>
  );
};

// Profile View Skeleton
export const ProfileSkeleton = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      {/* Banner & Avatar Skeleton */}
      <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="space-y-3 flex-1 text-center md:text-left">
          <Skeleton className="h-6 w-48 mx-auto md:mx-0" />
          <Skeleton className="h-4 w-32 mx-auto md:mx-0" />
          <Skeleton className="h-4 w-64 mx-auto md:mx-0" />
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <CardSkeleton count={4} />
    </div>
  );
};

export default Skeleton;
