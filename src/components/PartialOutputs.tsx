import { useState } from 'react';
import type { PartialOutputEvent } from '../types/events';

// ─── Research Findings (Partial Outputs) ───────────────────
// Reframed for analysts: "Preliminary Finding" / "Confirmed Finding"
// Shows what the system has discovered so far

interface ResearchFindingsProps {
  outputs: PartialOutputEvent[];
  finalOutput: PartialOutputEvent | null;
  isTaskRunning: boolean;
}

export function ResearchFindings({
  outputs,
  finalOutput,
  isTaskRunning,
}: ResearchFindingsProps) {
  const intermediates = outputs.filter((o) => !o.is_final);

  if (outputs.length === 0 && !isTaskRunning) return null;

  return (
    <div className="mt-3 space-y-2">
      {/* Preliminary findings — collapsible */}
      {intermediates.length > 0 && (
        <PreliminaryFindings intermediates={intermediates} />
      )}

      {/* Confirmed finding — always visible, highlighted */}
      {finalOutput && <ConfirmedFinding output={finalOutput} />}

      {/* Working indicator */}
      {isTaskRunning && outputs.length === 0 && (
        <div className="flex items-center gap-2 text-xs text-navy-400">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-research-500" />
          Retrieving data...
        </div>
      )}
    </div>
  );
}

function PreliminaryFindings({
  intermediates,
}: {
  intermediates: PartialOutputEvent[];
}) {
  const [expanded, setExpanded] = useState(false);

  const latest = intermediates[intermediates.length - 1];
  const older = intermediates.slice(0, -1);

  return (
    <div>
      {older.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mb-1.5 flex items-center gap-1 text-xs text-navy-400 transition-colors hover:text-navy-600"
        >
          <svg
            className={`h-3 w-3 transition-transform ${expanded ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span>
            {expanded ? 'Hide' : `${older.length} earlier preview${older.length > 1 ? 's' : ''}`}
          </span>
        </button>
      )}

      {expanded && (
        <div className="mb-2 space-y-1">
          {older.map((o, i) => (
            <div
              key={i}
              className="rounded border border-navy-100 bg-navy-50/30 px-3 py-2 text-xs text-navy-400 line-through decoration-navy-200"
            >
              {o.content}
            </div>
          ))}
        </div>
      )}

      {/* Latest preliminary finding */}
      {latest && !latest.is_final && (
        <div className="rounded-lg border border-research-200 bg-research-50/50 px-3 py-2.5">
          <div className="mb-1.5 flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-research-500" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-research-500">
              Preliminary Finding
            </span>
          </div>
          <p className="text-sm text-navy-700">{latest.content}</p>
        </div>
      )}
    </div>
  );
}

function ConfirmedFinding({ output }: { output: PartialOutputEvent }) {
  return (
    <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 px-3.5 py-3">
      <div className="flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-3 w-3 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700">
          Confirmed Finding
        </span>
        {output.quality_score !== null && (
          <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
            <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {Math.round(output.quality_score * 100)}% confidence
          </span>
        )}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-navy-800">
        {output.content}
      </p>
    </div>
  );
}
