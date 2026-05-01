import { useState } from "react";
import type { TaskState } from "../types/events";
import { StatusIndicator, DataSufficiencyNotice } from "./StatusBadge";
import { DataSourceLookups } from "./ToolCalls";
import { ResearchFindings } from "./PartialOutputs";
import { ResearchReasoning } from "./AgentThoughts";

// ─── Research Step Card ────────────────────────────────────
// Each task is a "Research Step" in the analyst's mental model
// Not a "task" — that's developer jargon

interface ResearchStepProps {
  task: TaskState;
}

// Map agent names to analyst-friendly role labels
function getAgentRole(agent: string): {
  role: string;
  icon: "filings" | "synthesis" | "fetcher";
} {
  if (agent.includes("filing") || agent.includes("fetcher")) {
    return { role: "Filing Specialist", icon: "filings" };
  }
  if (agent.includes("synthesiser") || agent.includes("synthesis")) {
    return { role: "Research Analyst", icon: "synthesis" };
  }
  return { role: agent.replace(/_/g, " "), icon: "fetcher" };
}

function FilingsIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function SynthesisIcon() {
  return (
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

export function ResearchStep({ task }: ResearchStepProps) {
  const isRunning = task.status === "running";
  const isFailed = task.status === "failed";
  const isCancelled = task.status === "cancelled";
  const isComplete = task.status === "complete";
  const agentRole = getAgentRole(task.agent);
  const [showDependencyTooltip, setShowDependencyTooltip] = useState(false);

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-300 ${
        isComplete
          ? "border-emerald-200 bg-white"
          : isCancelled
            ? "border-gold-200/60 bg-gold-50/20"
            : isFailed
              ? "border-red-200 bg-red-50/20"
              : isRunning
                ? "border-research-200 bg-white shadow-sm animate-pulse-glow"
                : "border-navy-200 bg-white"
      }`}
    >
      <div className="px-4 py-3.5 lg:px-5 lg:py-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {/* Agent role icon */}
              <span
                className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded lg:h-6 lg:w-6 ${
                  isComplete
                    ? "bg-emerald-50 text-emerald-600"
                    : isRunning
                      ? "bg-research-50 text-research-500"
                      : isFailed
                        ? "bg-red-50 text-red-500"
                        : isCancelled
                          ? "bg-gold-50 text-gold-500"
                          : "bg-navy-50 text-navy-400"
                }`}
              >
                {agentRole.icon === "filings" ? (
                  <FilingsIcon />
                ) : (
                  <SynthesisIcon />
                )}
              </span>

              <h3 className="text-sm font-medium text-navy-800 lg:text-base">
                {task.label}
              </h3>

              {/* Dependency indicator — shows what this step waited for */}
              {task.depends_on.length > 0 && (
                <div className="relative">
                  <button
                    onMouseEnter={() => setShowDependencyTooltip(true)}
                    onMouseLeave={() => setShowDependencyTooltip(false)}
                    className="inline-flex items-center gap-0.5 rounded bg-navy-50 px-1.5 py-0.5 text-[10px] font-medium text-navy-400 hover:bg-navy-100 transition-colors lg:text-xs"
                    title={`Waits for: ${task.depends_on.join(", ")}`}
                  >
                    <svg
                      className="h-2.5 w-2.5 lg:h-3 lg:w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                      />
                    </svg>
                    after {task.depends_on.length} step
                    {task.depends_on.length > 1 ? "s" : ""}
                  </button>

                  {/* Tooltip */}
                  {showDependencyTooltip && (
                    <div className="absolute left-0 top-full mt-1 z-20 w-64 rounded-lg border border-navy-200 bg-white p-2.5 shadow-lg">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-navy-400 mb-1.5">
                        Depends on completing
                      </p>
                      <div className="space-y-1">
                        {task.depends_on.map((depId) => (
                          <div
                            key={depId}
                            className="flex items-center gap-1.5"
                          >
                            <span className="inline-block h-1 w-1 rounded-full bg-navy-300"></span>
                            <span className="text-xs text-navy-600">
                              {depId}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p className="mt-1.5 text-[10px] text-navy-400 italic">
                        This step waits until all listed steps are complete or
                        resolved
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="mt-0.5 pl-7 text-xs text-navy-400 lg:pl-8 lg:text-sm">
              {agentRole.role}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Retry indicator */}
            {task.hasRetried && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-gold-50 px-2 py-0.5 text-[10px] font-medium text-gold-600 border border-gold-200 lg:text-xs lg:px-2.5"
                title={`Automatically retried after temporary failure`}
              >
                <svg
                  className="h-2.5 w-2.5 lg:h-3 lg:w-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Auto-retried
              </span>
            )}
            <StatusIndicator status={task.status} />
          </div>
        </div>

        {/* Error message — framed as data retrieval issue */}
        {isFailed && task.error && (
          <div className="mt-2.5 flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 lg:mt-3 lg:p-4">
            <svg
              className="mt-0.5 h-4 w-4 shrink-0 text-red-500 lg:h-5 lg:w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-xs font-medium text-red-700 lg:text-sm">
                Data source unavailable
              </p>
              <p className="mt-0.5 text-xs text-red-600 lg:text-sm">
                {task.error}
              </p>
            </div>
          </div>
        )}

        {/* Cancellation notice */}
        {isCancelled && (
          <DataSufficiencyNotice
            reason={task.cancelReason}
            message={task.cancelMessage}
          />
        )}

        {/* Data source lookups */}
        <DataSourceLookups toolCalls={task.toolCalls} />

        {/* Research findings */}
        <ResearchFindings
          outputs={task.partialOutputs}
          finalOutput={task.finalOutput}
          isTaskRunning={isRunning}
        />

        {/* Research strategy (agent thoughts) */}
        <ResearchReasoning thoughts={task.thoughts} />
      </div>
    </div>
  );
}
