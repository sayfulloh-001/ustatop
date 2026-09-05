import React from 'react';

export const MasterCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-slate-800 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-1/2" />
        <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-2/3" />
      </div>
    </div>
    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between">
      <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-1/3" />
      <div className="h-7 bg-gray-100 dark:bg-slate-800 rounded-lg w-1/3" />
    </div>
  </div>
);

export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm animate-pulse">
    <div className="h-40 bg-gray-100 dark:bg-slate-800" />
    <div className="p-3 space-y-2">
      <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-1/3" />
      <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded w-4/5" />
      <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded w-1/2" />
    </div>
  </div>
);
