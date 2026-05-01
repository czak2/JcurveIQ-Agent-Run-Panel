import type { RunState } from '../types/events';

// ─── Research Brief (Final Output) ─────────────────────────
// The MOST IMPORTANT element — the synthesised research result.
// Presented as a "Research Brief" — the format financial analysts expect.
// Should feel like receiving a completed analyst note.

interface ResearchBriefProps {
  state: RunState;
}

export function ResearchBrief({ state }: ResearchBriefProps) {
  if (!state.finalOutput) return null;

  return (
    <div className="rounded-xl border-2 border-emerald-300 bg-white overflow-hidden shadow-sm">
      {/* Brief header — emerald banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Research Brief
            </h3>
            <p className="text-xs text-emerald-100">
              {state.durationMs
                ? `Completed in ${(state.durationMs / 1000).toFixed(1)}s — ${state.tasks.size} data sources analysed`
                : `${state.tasks.size} data sources analysed`}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1">
            <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xs font-semibold text-white">Verified</span>
          </div>
        </div>
      </div>

      {/* Brief content */}
      <div className="px-5 py-4">
        <p className="text-sm leading-relaxed text-navy-800">
          {state.finalOutput.summary}
        </p>
      </div>

      {/* Source provenance — where each data point came from */}
      {state.finalOutput.citations.length > 0 && (
        <div className="border-t border-navy-100 px-5 py-3.5 bg-navy-50/30">
          <div className="flex items-center gap-1.5 mb-2.5">
            <svg className="h-3.5 w-3.5 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h4 className="text-[10px] font-semibold uppercase tracking-widest text-navy-400">
              Source Provenance
            </h4>
          </div>
          <div className="space-y-1.5">
            {state.finalOutput.citations.map((citation) => (
              <div
                key={citation.ref_id}
                className="flex items-center gap-2 text-xs"
              >
                <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-navy-100 font-mono text-[10px] font-semibold text-navy-500">
                  {citation.ref_id}
                </span>
                <span className="font-medium text-navy-700">{citation.title}</span>
                <span className="text-navy-300">via</span>
                <span className="text-navy-500">{citation.source}</span>
                <span className="text-navy-300">·</span>
                <span className="text-navy-400">p.{citation.page}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
