import type { ToolCallPair } from '../types/events';

// ─── Data Source Lookups (Tool Calls) ──────────────────────
// Reframed for analysts: "Data Source" instead of "Tool Call"
// Shows WHERE data comes from, not HOW it's fetched

interface DataSourceLookupsProps {
  toolCalls: ToolCallPair[];
}

// Map technical tool names to analyst-friendly labels
function getDataSourceLabel(tool: string): { label: string; icon: 'database' | 'analysis' | 'search' } {
  if (tool.includes('edgar') || tool.includes('sec')) {
    return { label: 'SEC EDGAR', icon: 'database' };
  }
  if (tool.includes('analysis') || tool.includes('compare')) {
    return { label: 'Data Analysis', icon: 'analysis' };
  }
  if (tool.includes('search') || tool.includes('fetch')) {
    return { label: 'Data Retrieval', icon: 'search' };
  }
  return { label: tool.replace(/_/g, ' '), icon: 'search' };
}

function DatabaseIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

function AnalysisIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

export function DataSourceLookups({ toolCalls }: DataSourceLookupsProps) {
  if (toolCalls.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      {toolCalls.map((pair, i) => {
        const source = getDataSourceLabel(pair.call.tool);
        return (
          <div key={i} className="space-y-1.5">
            {/* Data source lookup */}
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-source-50 text-source-500">
                {source.icon === 'database' ? <DatabaseIcon /> : source.icon === 'analysis' ? <AnalysisIcon /> : <SearchIcon />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-navy-700">{source.label}</span>
                </div>
                <p className="mt-0.5 text-xs text-navy-400">{pair.call.input_summary}</p>
              </div>
            </div>

            {/* Result from data source */}
            {pair.result && (
              <div className="ml-7.5 flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded bg-emerald-50 text-emerald-600">
                  <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <p className="text-xs text-navy-600">{pair.result.output_summary}</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
