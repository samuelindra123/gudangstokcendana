'use client';

import { TrendingUp, TrendingDown, Package, Boxes, Zap } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  color: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
}

export function StatsCard({ title, value, change, icon, color }: StatsCardProps) {
  const getColorClasses = () => {
    const colors = {
      blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
      emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
      rose: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
    };
    return colors[color];
  };

  return (
    <div className={`border rounded-xl p-5 backdrop-blur-xl transition-all hover:border-opacity-100 ${getColorClasses()}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-300">{title}</h3>
        <div className="p-2 rounded-lg bg-white/5">{icon}</div>
      </div>
      <div className="flex items-end gap-2">
        <p className="text-2xl md:text-3xl font-bold text-white">{value}</p>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg ${
            change >= 0 
              ? 'bg-emerald-500/10 text-emerald-400' 
              : 'bg-red-500/10 text-red-400'
          }`}>
            {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
    </div>
  );
}

interface RecentActivityProps {
  userName: string;
  action: string;
  itemName: string;
  details: string;
  timestamp: string;
  badge: 'increment' | 'decrement' | 'edit' | 'create';
}

export function RecentActivityItem({ userName, action, itemName, details, timestamp, badge }: RecentActivityProps) {
  const getBadgeColor = () => {
    const badges = {
      increment: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      decrement: 'bg-red-500/10 text-red-400 border-red-500/20',
      edit: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      create: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    };
    return badges[badge];
  };

  const getActionIcon = () => {
    const icons = {
      increment: '➕',
      decrement: '➖',
      edit: '✏️',
      create: '✨',
    };
    return icons[badge];
  };

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${getBadgeColor()} border`}>
        {getActionIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-sm font-medium text-white truncate">{userName}</p>
          <span className="text-xs text-zinc-500">{action}</span>
        </div>
        <p className="text-xs text-zinc-400 truncate">{itemName}</p>
        <p className="text-xs text-zinc-500 mt-1">{details}</p>
      </div>
      <div className="flex-shrink-0 text-xs text-zinc-500 whitespace-nowrap">{timestamp}</div>
    </div>
  );
}

interface SearchFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  placeholder?: string;
}

export function SearchFilter({ searchTerm, onSearchChange, placeholder = 'Search...' }: SearchFilterProps) {
  return (
    <div className="relative">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
      />
    </div>
  );
}

interface LoadingSkeletonProps {
  count?: number;
}

export function LoadingSkeleton({ count = 1 }: LoadingSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-16 bg-white/5 border border-white/10 rounded-lg animate-pulse" />
      ))}
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10 text-zinc-400">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
