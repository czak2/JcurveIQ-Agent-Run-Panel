// ─── Empty State — No Research in Progress ─────────────────
// Contextual for financial analysts: shows what kinds of
// queries they can submit and what to expect

interface EmptyStateProps {
  onStartRun: () => void;
}

const sampleQueries = [
  'Analyse Apple R&D intensity vs large-cap peers (2019–2023)',
  'Compare Microsoft and Alphabet revenue growth trajectories',
  'Evaluate Meta\'s Reality Labs spend as % of total revenue',
];

export function EmptyState({ onStartRun }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Icon */}
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-100">
        <svg className="h-8 w-8 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
        </svg>
      </div>

      <h2 className="text-lg font-semibold text-navy-800">
        No Research in Progress
      </h2>
      <p className="mt-2 max-w-md text-sm text-navy-400 leading-relaxed">
        When you submit a research query, you'll see the analysis unfold
        in real time — data being gathered from SEC filings, cross-referenced
        across sources, and synthesised into a research brief.
      </p>

      {/* Sample queries */}
      <div className="mt-6 space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-navy-400">
          Example queries
        </p>
        {sampleQueries.map((q, i) => (
          <div
            key={i}
            className="rounded-lg border border-navy-100 bg-white px-4 py-2 text-xs text-navy-500 text-left"
          >
            <span className="text-navy-300 mr-2">→</span>
            {q}
          </div>
        ))}
      </div>

      <button
        onClick={onStartRun}
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-navy-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-navy-800 active:bg-navy-950 hover:shadow-lg"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Run Demo Analysis
      </button>
    </div>
  );
}
