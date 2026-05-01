import type { RunState } from '../types/events';
import { RunStatusIndicator } from './StatusBadge';

// ─── Research Header ───────────────────────────────────────
// The top-level context for the analyst: what are we researching,
// how's it going, how long has it been running

interface ResearchHeaderProps {
  state: RunState;
  elapsedMs: number;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (minutes > 0) {
    return `${minutes}m ${secs.toString().padStart(2, '0')}s`;
  }
  return `${secs}s`;
}

// Progress stage description based on task states
function getProgressDescription(state: RunState): string {
  if (state.status === 'complete') return 'Research complete — findings ready below';
  if (state.status === 'failed') return 'Research interrupted — partial findings available';

  const running = Array.from(state.tasks.values()).filter(t => t.status === 'running').length;
  const complete = Array.from(state.tasks.values()).filter(t => t.status === 'complete').length;
  const total = state.tasks.size;

  if (total === 0) return 'Preparing research plan...';
  if (running > 0 && complete === 0) return `Gathering data from ${running} source${running > 1 ? 's' : ''}...`;
  if (running > 0 && complete > 0) return `${complete} of ${total} data sources complete — ${running} still in progress`;
  if (complete === total) return 'All data gathered — preparing synthesis...';
  return 'Coordinating research...';
}

export function ResearchHeader({ state, elapsedMs }: ResearchHeaderProps) {
  if (!state.runId) return null;

  const isRunning = state.status === 'running';
  const displayDuration = state.durationMs ?? elapsedMs;

  // Calculate progress percentage
  const totalTasks = state.tasks.size;
  const completedTasks = Array.from(state.tasks.values()).filter(
    t => t.status === 'complete' || t.status === 'cancelled'
  ).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="rounded-xl border border-navy-200 bg-white overflow-hidden">
      {/* Dark navy top bar — like a financial terminal header */}
      <div className="bg-navy-900 px-5 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <svg className="h-4 w-4 text-gold-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-[10px] font-semibold uppercase tracking-widest text-navy-400">
                Research Query
              </span>
            </div>
            <h2 className="text-base font-semibold text-white leading-snug">
              {state.query}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* Elapsed time */}
            <div className="flex items-center gap-1.5 rounded-lg bg-navy-800 px-3 py-1.5">
              <svg
                className={`h-3.5 w-3.5 ${isRunning ? 'text-research-300' : 'text-navy-500'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`font-mono text-sm font-medium ${isRunning ? 'text-white' : 'text-navy-400'}`}>
                {formatDuration(displayDuration)}
              </span>
            </div>

            <RunStatusIndicator status={state.status} />
          </div>
        </div>
      </div>

      {/* Progress bar + status description */}
      <div className="px-5 py-3 border-b border-navy-100">
        {/* Progress bar */}
        {isRunning && totalTasks > 0 && (
          <div className="mb-2.5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-navy-400">
                Progress
              </span>
              <span className="text-xs font-medium text-navy-600">
                {completedTasks}/{totalTasks} steps complete
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-navy-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-research-500 transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* Status description */}
        <p className="text-xs text-navy-500">
          {getProgressDescription(state)}
        </p>
      </div>

      {/* Coordinator's latest thought — shown as "Research Strategy" */}
      {state.coordinatorThoughts.length > 0 && (
        <div className="px-5 py-2.5 bg-gold-50/30 border-b border-navy-100">
          <div className="flex items-start gap-2">
            <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-gold-600">
                Research Strategy
              </span>
              <p className="mt-0.5 text-xs text-navy-500 italic">
                {state.coordinatorThoughts[state.coordinatorThoughts.length - 1].thought}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
