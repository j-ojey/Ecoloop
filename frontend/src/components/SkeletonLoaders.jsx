import React from 'react';

export function ItemCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded-xl mb-4"></div>
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
      <div className="flex gap-2 mb-3">
        <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
      </div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
      <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
    </div>
  );
}

export function ItemDetailsSkeleton() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="card animate-pulse">
        <div className="h-80 bg-gray-300 dark:bg-gray-700 rounded-xl mb-6"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="flex gap-3 mb-4">
          <div className="h-7 w-20 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          <div className="h-7 w-20 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          <div className="h-7 w-20 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div className="space-y-2 mb-6">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
        <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
      </div>
    </div>
  );
}

export function ProfileStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-pulse">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="card text-center">
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded w-16 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-24 mx-auto"></div>
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 3 }) {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
}
