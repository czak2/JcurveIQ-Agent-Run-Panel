import { useState } from 'react';
import type { AgentThoughtEvent } from '../types/events';

// ─── Research Reasoning (Agent Thoughts) ───────────────────
// Reframed for analysts: "Research Strategy" instead of "Agent Reasoning"

interface ResearchReasoningProps {
  thoughts: AgentThoughtEvent[];
  label?: string;
}

function ReasoningBubble({ thought }: { thought: AgentThoughtEvent }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-navy-100 bg-navy-50/50 px-3 py-2">
      <svg
        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-navy-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
      <p className="text-xs leading-relaxed text-navy-500 italic">
        {thought.thought}
      </p>
    </div>
  );
}

export function ResearchReasoning({
  thoughts,
  label = 'Research strategy',
}: ResearchReasoningProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (thoughts.length === 0) return null;

  return (
    <div className="mt-2.5">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="inline-flex items-center gap-1.5 text-xs text-navy-400 transition-colors hover:text-navy-600"
      >
        <svg
          className={`h-3 w-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span className="font-medium">
          {label} ({thoughts.length})
        </span>
      </button>
      {isExpanded && (
        <div className="mt-1.5 space-y-1.5">
          {thoughts.map((t, i) => (
            <ReasoningBubble key={i} thought={t} />
          ))}
        </div>
      )}
    </div>
  );
}
