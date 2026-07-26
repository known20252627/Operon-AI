'use client';

interface SkeletonLoaderProps {
  variant: 'text' | 'card' | 'chart' | 'table-row';
  count?: number;
  className?: string;
}

export function SkeletonLoader({ variant, count = 1, className = '' }: SkeletonLoaderProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton skeleton-${variant} ${className}`.trim()} />
      ))}
    </>
  );
}
