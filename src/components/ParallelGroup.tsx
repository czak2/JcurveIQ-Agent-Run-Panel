import type { TaskState } from '../types/events';
import { ResearchStep } from './TaskItem';

// ─── Simultaneous Research Group ───────────────────────────
// Reframed: "Simultaneous Research" instead of "Parallel Tasks"
// Analysts understand "we're checking multiple companies at once"

interface SimultaneousResearchGroupProps {
  tasks: TaskState[];
}

export function SimultaneousResearchGroup({ tasks }: SimultaneousResearchGroupProps) {
  if (tasks.length === 0) return null;

  const anyRunning = tasks.some((t) => t.status === 'running');
  const allComplete = tasks.every((t) => t.status === 'complete');
  const allResolved = tasks.every(
    (t) => t.status === 'complete' || t.status === 'cancelled'
  );

  return (
    <div className="relative">
      {/* Left accent bar — visual signal of simultaneity */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-1 rounded-full transition-colors duration-500 ${
          anyRunning
            ? 'bg-research-500'
            : allComplete
            ? 'bg-emerald-400'
            : allResolved
            ? 'bg-gold-400'
            : 'bg-navy-200'
        }`}
      />

      {/* Group header — explains the simultaneity */}
      <div className="mb-2.5 ml-4 flex items-center gap-2.5">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
            anyRunning
              ? 'bg-research-50 text-research-500 border border-research-200'
              : allComplete
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : allResolved
              ? 'bg-gold-50 text-gold-600 border border-gold-200'
              : 'bg-navy-50 text-navy-500 border border-navy-200'
          }`}
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Running simultaneously
        </span>

        {/* Per-task status dots */}
        <div className="flex items-center gap-1.5">
          {tasks.map((t) => (
            <span
              key={t.task_id}
              className={`inline-block h-2 w-2 rounded-full transition-colors ${
                t.status === 'running'
                  ? 'bg-research-500 animate-pulse'
                  : t.status === 'complete'
                  ? 'bg-emerald-500'
                  : t.status === 'cancelled'
                  ? 'bg-gold-400'
                  : t.status === 'failed'
                  ? 'bg-red-500'
                  : 'bg-navy-200'
              }`}
              title={`${t.label}: ${t.status}`}
            />
          ))}
        </div>
      </div>

      {/* Step cards */}
      <div className="ml-4 space-y-2">
        {tasks.map((task) => (
          <ResearchStep key={task.task_id} task={task} />
        ))}
      </div>
    </div>
  );
}
