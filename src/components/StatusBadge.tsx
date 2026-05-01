import type { TaskStatus } from '../types/events';

// ─── Status Indicator for Financial Research Context ───────

interface StatusIndicatorProps {
  status: TaskStatus | 'running' | 'complete' | 'failed' | 'cancelled';
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig: Record<
  string,
  { label: string; description: string; bgClass: string; dotClass: string; icon: string }
> = {
  running: {
    label: 'In Progress',
    description: 'Gathering data...',
    bgClass: 'bg-research-50 text-research-500 border-research-200',
    dotClass: 'bg-research-500 animate-pulse',
    icon: 'research',
  },
  complete: {
    label: 'Complete',
    description: 'Data retrieved',
    bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
    icon: 'check',
  },
  failed: {
    label: 'Failed',
    description: 'Could not retrieve data',
    bgClass: 'bg-red-50 text-red-700 border-red-200',
    dotClass: 'bg-red-500',
    icon: 'error',
  },
  cancelled: {
    label: 'Not Needed',
    description: 'Sufficient data already collected',
    bgClass: 'bg-gold-50 text-gold-600 border-gold-200',
    dotClass: 'bg-gold-500',
    icon: 'skipped',
  },
};

export function StatusIndicator({ status, size = 'sm' }: StatusIndicatorProps) {
  const config = statusConfig[status] || statusConfig.running;
  const sizeClasses =
    size === 'sm'
      ? 'text-xs px-2.5 py-0.5'
      : size === 'md'
      ? 'text-sm px-3 py-1'
      : 'text-sm px-4 py-1.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${config.bgClass} ${sizeClasses}`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 rounded-full ${config.dotClass}`}
      />
      {config.label}
    </span>
  );
}

// ─── Run-Level Status (the overall research analysis) ─────

interface RunStatusIndicatorProps {
  status: 'running' | 'complete' | 'failed' | null;
}

const runStatusConfig: Record<
  string,
  { label: string; bgClass: string; dotClass: string }
> = {
  running: {
    label: 'Analysis in Progress',
    bgClass: 'bg-research-50 text-research-500 border-research-200',
    dotClass: 'bg-research-500 animate-pulse',
  },
  complete: {
    label: 'Analysis Complete',
    bgClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dotClass: 'bg-emerald-500',
  },
  failed: {
    label: 'Analysis Failed',
    bgClass: 'bg-red-50 text-red-700 border-red-200',
    dotClass: 'bg-red-500',
  },
};

export function RunStatusIndicator({ status }: RunStatusIndicatorProps) {
  if (!status) return null;
  const config = runStatusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${config.bgClass}`}
    >
      <span
        className={`inline-block h-2 w-2 rounded-full ${config.dotClass}`}
      />
      {config.label}
    </span>
  );
}

// ─── Data Sufficiency Notice (cancelled with sufficient_data) ──

interface DataSufficiencyNoticeProps {
  reason: string | null;
  message: string | null;
}

export function DataSufficiencyNotice({ reason, message }: DataSufficiencyNoticeProps) {
  if (reason === 'sufficient_data') {
    return (
      <div className="mt-2.5 flex items-start gap-2.5 rounded-lg border border-gold-200 bg-gold-50 p-3">
        <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold-100">
          <svg className="h-3 w-3 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-medium text-gold-600">
            Not needed — enough data collected
          </p>
          {message && (
            <p className="mt-0.5 text-xs text-gold-500/80">{message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2.5 flex items-start gap-2 rounded-lg border border-navy-200 bg-navy-50 p-2.5">
      <p className="text-xs text-navy-600">Step skipped{message ? ` — ${message}` : ''}</p>
    </div>
  );
}
