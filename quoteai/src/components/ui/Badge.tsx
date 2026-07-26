'use client';

export type BadgeVariant = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected' | 'expired' | 'ai-review' | 'manager-review' | 'approved';

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  className?: string;
}

export function Badge({ variant, label, className = '' }: BadgeProps) {
  const defaultLabel = variant.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return (
    <span className={`badge ${className}`.trim()}>
      <i className={`status ${variant}`} />
      {label || defaultLabel}
    </span>
  );
}
