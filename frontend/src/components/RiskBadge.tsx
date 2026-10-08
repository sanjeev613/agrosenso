import React from 'react';
import { SpoilageRisk } from '../types';

interface RiskBadgeProps {
  risk: SpoilageRisk | string;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ risk, size = 'md', showDot = true }) => {
  const normalizedRisk = (risk || 'LOW').toUpperCase();

  const configs: Record<string, { bg: string; text: string; border: string; dot: string; label: string; pulse?: boolean }> = {
    LOW: {
      bg: 'bg-emerald-950/40',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-400',
      label: 'LOW RISK',
    },
    MEDIUM: {
      bg: 'bg-amber-950/40',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      dot: 'bg-amber-400',
      label: 'MEDIUM RISK',
    },
    HIGH: {
      bg: 'bg-orange-950/40',
      text: 'text-orange-400',
      border: 'border-orange-500/30',
      dot: 'bg-orange-400',
      label: 'HIGH RISK',
      pulse: true,
    },
    CRITICAL: {
      bg: 'bg-red-950/60',
      text: 'text-red-400',
      border: 'border-red-500/40',
      dot: 'bg-red-500',
      label: 'CRITICAL',
      pulse: true,
    },
  };

  const current = configs[normalizedRisk] || configs.LOW;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs font-semibold px-2.5 py-1',
    lg: 'text-sm font-bold px-3 py-1.5',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${current.bg} ${current.text} ${current.border} ${sizeClasses[size]}`}
    >
      {showDot && (
        <span
          className={`h-2 w-2 rounded-full ${current.dot} ${current.pulse ? 'animate-pulse' : ''}`}
        />
      )}
      {current.label}
    </span>
  );
};
