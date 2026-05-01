import { useMemo } from "react";
import type { RunState, TaskState } from "../types/events";
import { ResearchHeader } from "./RunHeader";
import { ResearchStep } from "./TaskItem";
import { SimultaneousResearchGroup } from "./ParallelGroup";
import { ResearchBrief } from "./FinalOutput";

// ─── Agent Run Panel ───────────────────────────────────────
// The main component. Presents a live research analysis run
// in terms a financial analyst would understand.

interface AgentRunPanelProps {
  state: RunState;
  elapsedMs: number;
}

export function AgentRunPanel({ state, elapsedMs }: AgentRunPanelProps) {
  // Build parallel groups lookup
  const parallelGroups = useMemo(() => {
    const groups: Map<string, TaskState[]> = new Map();

    for (const taskId of state.taskOrder) {
      const task = state.tasks.get(taskId);
      if (!task || !task.parallel_group) continue;

      if (!groups.has(task.parallel_group)) {
        const groupTasks = state.taskOrder
          .map((id) => state.tasks.get(id))
          .filter(
            (t): t is TaskState =>
              !!t && t.parallel_group === task.parallel_group,
          );
        groups.set(task.parallel_group, groupTasks);
      }
    }

    return groups;
  }, [state.tasks, state.taskOrder]);

  // Extract planned but never started tasks from coordinator thoughts
  const plannedTasks = useMemo(() => {
    if (state.status !== "failed") return [];

    const lastThought =
      state.coordinatorThoughts[state.coordinatorThoughts.length - 1];
    if (!lastThought) return [];

    // Parse planned task names from coordinator's thought
    const thought = lastThought.thought;
    const planned: string[] = [];

    if (thought.includes("planned") || thought.includes("never started")) {
      // Extract company names mentioned after "fetch" or "planned"
      const matches = thought.match(
        /(?:fetch|planned for)\s+([A-Z][a-z]+(?:\s[A-Z][a-z]+)*(?:\sand\s[A-Z][a-z]+(?:\s[A-Z][a-z]+)*)?)/gi,
      );
      if (matches) {
        matches.forEach((match) => {
          const name = match.replace(/(?:fetch|planned for)\s+/i, "").trim();
          if (name && !planned.includes(name)) {
            planned.push(name);
          }
        });
      }
    }

    return planned;
  }, [state.status, state.coordinatorThoughts]);

  const hasActiveRun = state.runId !== null;
  const renderedGroups = new Set<string>();

  // Get running tasks when run failed
  const runningTasks = useMemo(() => {
    if (state.status !== "failed") return [];
    return Array.from(state.tasks.values()).filter(
      (t) => t.status === "running",
    );
  }, [state.status, state.tasks]);

  return (
    <div className="mx-auto max-w-3xl lg:max-w-4xl xl:max-w-6xl">
      {/* Research header */}
      <ResearchHeader state={state} elapsedMs={elapsedMs} />

      {/* Research Brief — the star, shown first when complete */}
      {state.status === "complete" && state.finalOutput && (
        <div className="mt-4">
          <ResearchBrief state={state} />
        </div>
      )}

      {/* Analysis Failed banner */}
      {state.status === "failed" && state.errorMessage && (
        <div className="mt-4 rounded-xl border-2 border-red-300 bg-white overflow-hidden">
          <div className="bg-gradient-to-r from-red-600 to-red-500 px-5 py-3 lg:px-6 lg:py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 lg:h-10 lg:w-10">
                <svg
                  className="h-5 w-5 text-white lg:h-6 lg:w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white lg:text-base">
                  Analysis Incomplete
                </h3>
                <p className="text-xs text-red-100 lg:text-sm">
                  {state.errorMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Tasks still in progress when run failed */}
          {runningTasks.length > 0 && (
            <div className="px-5 py-4 border-b border-navy-100 lg:px-6">
              <div className="flex items-center gap-2 mb-2.5">
                <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-research-500"></span>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-navy-400 lg:text-xs">
                  In Progress When Failed
                </p>
              </div>
              <div className="space-y-2">
                {runningTasks.map((t) => (
                  <div
                    key={t.task_id}
                    className="rounded-lg border border-research-200 bg-research-50/30 p-3"
                  >
                    <p className="text-xs font-medium text-navy-700">
                      {t.label}
                    </p>
                    <p className="mt-1 text-xs text-navy-500">
                      Was actively retrieving data when the analysis failed
                    </p>
                    {t.partialOutputs.length > 0 && (
                      <div className="mt-2 rounded bg-white/50 p-2">
                        <p className="text-xs text-navy-600">
                          Latest data:{" "}
                          {
                            t.partialOutputs[t.partialOutputs.length - 1]
                              .content
                          }
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Planned but never started tasks */}
          {plannedTasks.length > 0 && (
            <div className="px-5 py-4 border-b border-navy-100 bg-navy-50/30 lg:px-6">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-navy-400 mb-2.5 lg:text-xs">
                Planned But Never Started
              </p>
              <div className="space-y-2">
                {plannedTasks.map((name, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-navy-200 bg-white p-3"
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className="h-4 w-4 text-navy-300"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <p className="text-xs font-medium text-navy-500">
                        Fetch {name} data
                      </p>
                    </div>
                    <p className="mt-1 text-xs text-navy-400 ml-6">
                      Was in the research plan but never executed due to early
                      failure
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Partial findings from completed steps */}
          {Array.from(state.tasks.values()).some(
            (t) => t.status === "complete" && t.finalOutput,
          ) && (
            <div className="px-5 py-4 border-t border-navy-100 lg:px-6 lg:py-5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-navy-400 mb-2.5 lg:text-xs">
                Partial findings available
              </p>
              <div className="space-y-2 lg:space-y-3">
                {Array.from(state.tasks.values())
                  .filter((t) => t.status === "complete" && t.finalOutput)
                  .map((t) => (
                    <div
                      key={t.task_id}
                      className="rounded-lg border border-navy-100 bg-navy-50/30 p-3 lg:p-4"
                    >
                      <p className="text-xs font-medium text-navy-700 lg:text-sm">
                        {t.label}
                      </p>
                      <p className="mt-1 text-sm text-navy-600 lg:text-base">
                        {t.finalOutput!.content}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Research Steps (task list) */}
      {hasActiveRun && state.tasks.size > 0 && (
        <div className="mt-4 space-y-3 lg:mt-6 lg:space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-navy-400 lg:text-xs">
              Research Steps
            </h3>
            <span className="text-xs text-navy-300 lg:text-sm">
              {state.tasks.size} step{state.tasks.size !== 1 ? "s" : ""}
            </span>
          </div>

          {state.taskOrder.map((taskId) => {
            const task = state.tasks.get(taskId);
            if (!task) return null;

            if (task.parallel_group) {
              if (renderedGroups.has(task.parallel_group)) return null;
              renderedGroups.add(task.parallel_group);

              const groupTasks = parallelGroups.get(task.parallel_group);
              return groupTasks ? (
                <SimultaneousResearchGroup
                  key={task.parallel_group}
                  tasks={groupTasks}
                />
              ) : null;
            }

            return <ResearchStep key={taskId} task={task} />;
          })}
        </div>
      )}
    </div>
  );
}
