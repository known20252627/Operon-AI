'use client';
import { getConfidenceColor, getConfidenceLabel } from '@/lib/utils';

interface ConfidenceBadgeProps {
  confidence: number;
  showLabel?: boolean;
  className?: string;
}

export function ConfidenceBadge({ confidence, showLabel, className = '' }: ConfidenceBadgeProps) {
  return (
    <span className={`confidence-badge ${getConfidenceColor(confidence)} ${className}`.trim()}>
      {confidence}%
      {showLabel && <span className="label">{getConfidenceLabel(confidence)}</span>}
    </span>
  );
}
