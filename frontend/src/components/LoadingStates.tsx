import { Loader2 } from 'lucide-react';
import clsx from 'clsx';

// ============================================================================
// Skeleton Components
// ============================================================================

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton = ({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded',
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={clsx(
        baseClasses,
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
    />
  );
};

// ============================================================================
// Card Skeleton
// ============================================================================

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
    <div className="flex items-start gap-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1 space-y-3">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
        <div className="flex gap-2 mt-4">
          <Skeleton variant="rectangular" width={80} height={32} />
          <Skeleton variant="rectangular" width={80} height={32} />
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// Table Skeleton
// ============================================================================

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export const TableSkeleton = ({ rows = 5, columns = 4 }: TableSkeletonProps) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
    {/* Header */}
    <div className="grid gap-4 p-4 border-b border-gray-200 dark:border-gray-700" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} variant="text" width="70%" />
      ))}
    </div>

    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div
        key={rowIndex}
        className="grid gap-4 p-4 border-b border-gray-100 dark:border-gray-700"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} variant="text" width="85%" />
        ))}
      </div>
    ))}
  </div>
);

// ============================================================================
// List Skeleton
// ============================================================================

interface ListSkeletonProps {
  items?: number;
}

export const ListSkeleton = ({ items = 5 }: ListSkeletonProps) => (
  <div className="space-y-3">
    {Array.from({ length: items }).map((_, index) => (
      <div
        key={index}
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
      >
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="50%" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ============================================================================
// Chat Message Skeleton
// ============================================================================

export const ChatMessageSkeleton = () => (
  <div className="space-y-4">
    {/* User message */}
    <div className="flex gap-4 justify-end">
      <div className="max-w-3xl rounded-lg bg-blue-600 p-4 space-y-2" style={{ width: '300px' }}>
        <Skeleton variant="text" className="bg-blue-500" />
        <Skeleton variant="text" className="bg-blue-500" width="60%" />
      </div>
      <Skeleton variant="circular" width={32} height={32} />
    </div>

    {/* Assistant message */}
    <div className="flex gap-4 justify-start">
      <Skeleton variant="circular" width={32} height={32} />
      <div className="max-w-3xl rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 space-y-2" style={{ width: '400px' }}>
        <Skeleton variant="text" />
        <Skeleton variant="text" />
        <Skeleton variant="text" width="80%" />
      </div>
    </div>
  </div>
);

// ============================================================================
// Spinner Components
// ============================================================================

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  className?: string;
}

export const Spinner = ({ size = 'md', color, className }: SpinnerProps) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  return (
    <Loader2
      className={clsx(
        'animate-spin',
        sizeClasses[size],
        color || 'text-blue-600',
        className
      )}
    />
  );
};

// ============================================================================
// Full Page Loader
// ============================================================================

interface FullPageLoaderProps {
  message?: string;
}

export const FullPageLoader = ({ message = 'Loading...' }: FullPageLoaderProps) => (
  <div className="fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50">
    <div className="text-center">
      <Spinner size="xl" />
      <p className="mt-4 text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  </div>
);

// ============================================================================
// Overlay Loader
// ============================================================================

interface OverlayLoaderProps {
  message?: string;
  transparent?: boolean;
}

export const OverlayLoader = ({ message, transparent = false }: OverlayLoaderProps) => (
  <div
    className={clsx(
      'absolute inset-0 flex items-center justify-center z-40',
      transparent
        ? 'bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm'
        : 'bg-white dark:bg-gray-900'
    )}
  >
    <div className="text-center">
      <Spinner size="lg" />
      {message && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{message}</p>
      )}
    </div>
  </div>
);

// ============================================================================
// Inline Loader
// ============================================================================

interface InlineLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const InlineLoader = ({ message, size = 'md' }: InlineLoaderProps) => (
  <div className="flex items-center gap-2">
    <Spinner size={size} />
    {message && (
      <span className="text-sm text-gray-600 dark:text-gray-400">{message}</span>
    )}
  </div>
);

// ============================================================================
// Button Loading State
// ============================================================================

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

export const LoadingButton = ({
  loading = false,
  children,
  loadingText,
  disabled,
  className,
  ...props
}: LoadingButtonProps) => (
  <button
    {...props}
    disabled={disabled || loading}
    className={clsx(
      'inline-flex items-center justify-center gap-2',
      'px-4 py-2 rounded-lg font-medium transition-colors',
      'disabled:opacity-50 disabled:cursor-not-allowed',
      className
    )}
  >
    {loading && <Spinner size="sm" />}
    {loading ? loadingText || children : children}
  </button>
);

// ============================================================================
// Progress Bar
// ============================================================================

interface ProgressBarProps {
  progress: number; // 0-100
  showLabel?: boolean;
  color?: string;
  height?: number;
  animated?: boolean;
}

export const ProgressBar = ({
  progress,
  showLabel = true,
  color = 'bg-blue-600',
  height = 8,
  animated = true,
}: ProgressBarProps) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div>
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
          <span>Progress</span>
          <span>{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div
        className="w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
        style={{ height: `${height}px` }}
      >
        <div
          className={clsx(
            color,
            animated && 'transition-all duration-300 ease-out'
          )}
          style={{
            width: `${clampedProgress}%`,
            height: '100%',
          }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// Pulsing Dot (Live Indicator)
// ============================================================================

interface PulsingDotProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PulsingDot = ({ color = 'bg-green-500', size = 'md' }: PulsingDotProps) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span className="relative flex">
      <span
        className={clsx(
          'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
          color
        )}
      />
      <span className={clsx('relative inline-flex rounded-full', sizeClasses[size], color)} />
    </span>
  );
};

// ============================================================================
// Empty State
// ============================================================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState = ({ icon, title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    {icon && (
      <div className="mb-4 text-gray-300 dark:text-gray-600">
        {icon}
      </div>
    )}
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
      {title}
    </h3>
    {description && (
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
        {description}
      </p>
    )}
    {action && (
      <button
        onClick={action.onClick}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        {action.label}
      </button>
    )}
  </div>
);
