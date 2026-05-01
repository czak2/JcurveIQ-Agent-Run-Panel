import { useReducer, useEffect, useCallback, useRef, useState } from 'react';
import type {
  AgentEvent,
  RunState,
  TaskState,
  ToolCallPair,
} from '../types/events';
import { MockEventEmitter } from '../mock/MockEventEmitter';

// ─── Initial State ─────────────────────────────────────────

const initialTaskState = (spawned: {
  task_id: string;
  label: string;
  agent: string;
  spawned_by: string;
  parallel_group: string | null;
  depends_on: string[];
  timestamp: number;
}): TaskState => ({
  task_id: spawned.task_id,
  label: spawned.label,
  agent: spawned.agent,
  spawned_by: spawned.spawned_by,
  parallel_group: spawned.parallel_group,
  depends_on: spawned.depends_on,
  status: 'running',
  error: null,
  cancelReason: null,
  cancelMessage: null,
  toolCalls: [],
  partialOutputs: [],
  finalOutput: null,
  thoughts: [],
  retryCount: 0,
  hasRetried: false,
  startedAt: spawned.timestamp,
  completedAt: null,
});

const createInitialState = (): RunState => ({
  runId: null,
  query: null,
  status: null,
  startedAt: null,
  completedAt: null,
  durationMs: null,
  tasks: new Map(),
  taskOrder: [],
  finalOutput: null,
  errorMessage: null,
  coordinatorThoughts: [],
});

// ─── Reducer ───────────────────────────────────────────────

type Action =
  | { type: 'EVENT'; event: AgentEvent }
  | { type: 'RESET' };

function reducer(state: RunState, action: Action): RunState {
  switch (action.type) {
    case 'RESET':
      return createInitialState();

    case 'EVENT': {
      const event = action.event;

      switch (event.type) {
        case 'run_started': {
          return {
            ...createInitialState(),
            runId: event.run_id,
            query: event.query,
            status: 'running',
            startedAt: event.timestamp,
          };
        }

        case 'agent_thought': {
          if (event.task_id === 'coordinator' || event.task_id === null) {
            return {
              ...state,
              coordinatorThoughts: [
                ...state.coordinatorThoughts,
                event,
              ],
            };
          }
          const task = state.tasks.get(event.task_id);
          if (!task) return state;
          return {
            ...state,
            tasks: new Map(state.tasks).set(event.task_id, {
              ...task,
              thoughts: [...task.thoughts, event],
            }),
          };
        }

        case 'task_spawned': {
          const newTasks = new Map(state.tasks);
          newTasks.set(
            event.task_id,
            initialTaskState(event)
          );
          return {
            ...state,
            tasks: newTasks,
            taskOrder: [...state.taskOrder, event.task_id],
          };
        }

        case 'tool_call': {
          const t = state.tasks.get(event.task_id);
          if (!t) return state;
          const newPair: ToolCallPair = { call: event };
          return {
            ...state,
            tasks: new Map(state.tasks).set(event.task_id, {
              ...t,
              toolCalls: [...t.toolCalls, newPair],
            }),
          };
        }

        case 'tool_result': {
          const t = state.tasks.get(event.task_id);
          if (!t) return state;
          const newToolCalls = [...t.toolCalls];
          for (let i = newToolCalls.length - 1; i >= 0; i--) {
            if (
              newToolCalls[i].call.tool === event.tool &&
              !newToolCalls[i].result
            ) {
              newToolCalls[i] = { ...newToolCalls[i], result: event };
              break;
            }
          }
          return {
            ...state,
            tasks: new Map(state.tasks).set(event.task_id, {
              ...t,
              toolCalls: newToolCalls,
            }),
          };
        }

        case 'partial_output': {
          const t = state.tasks.get(event.task_id);
          if (!t) return state;
          const updates: Partial<TaskState> = {
            partialOutputs: [...t.partialOutputs, event],
          };
          if (event.is_final) {
            updates.finalOutput = event;
            // If the task is still running and we get a final output,
            // infer completion (some tasks don't get explicit task_update: complete)
            if (t.status === 'running') {
              updates.status = 'complete';
              updates.completedAt = event.timestamp;
            }
          }
          return {
            ...state,
            tasks: new Map(state.tasks).set(event.task_id, {
              ...t,
              ...updates,
            }),
          };
        }

        case 'task_update': {
          const t = state.tasks.get(event.task_id);
          if (!t) return state;
          const updates: Partial<TaskState> = {
            status: event.status,
          };
          if (event.error) updates.error = event.error;
          if (event.reason) updates.cancelReason = event.reason;
          if (event.message) updates.cancelMessage = event.message;

          // Track retry: if going from failed back to running
          if (event.status === 'running' && t.status === 'failed') {
            updates.hasRetried = true;
            updates.retryCount = t.retryCount + 1;
            updates.error = null;
          }

          if (
            event.status === 'complete' ||
            event.status === 'cancelled'
          ) {
            updates.completedAt = event.timestamp;
          }

          return {
            ...state,
            tasks: new Map(state.tasks).set(event.task_id, {
              ...t,
              ...updates,
            }),
          };
        }

        case 'run_complete': {
          return {
            ...state,
            status: 'complete',
            completedAt: event.timestamp,
            durationMs: event.duration_ms,
            finalOutput: event.output,
          };
        }

        case 'run_error': {
          return {
            ...state,
            status: 'failed',
            completedAt: event.timestamp,
            errorMessage: event.message,
          };
        }

        default:
          return state;
      }
    }

    default:
      return state;
  }
}

// ─── Hook ──────────────────────────────────────────────────

interface UseAgentRunOptions {
  fixture: AgentEvent[];
  speed?: number;
  autoStart?: boolean;
}

export function useAgentRun({
  fixture,
  speed = 1,
  autoStart = true,
}: UseAgentRunOptions) {
  const [state, dispatch] = useReducer(reducer, undefined, createInitialState);
  const [elapsedMs, setElapsedMs] = useState(0);
  const emitterRef = useRef<MockEventEmitter | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);

  const stop = useCallback(() => {
    if (emitterRef.current) {
      emitterRef.current.stop();
      emitterRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    // Stop any existing emitter
    stop();
    dispatch({ type: 'RESET' });
    setElapsedMs(0);

    const emitter = new MockEventEmitter(fixture, speed);
    emitterRef.current = emitter;

    emitter.onEvent((event) => {
      dispatch({ type: 'EVENT', event });
    });

    emitter.start();

    // Start elapsed time counter
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedMs(Date.now() - startRef.current);
    }, 100);
  }, [fixture, speed, stop]);

  // Auto-start on mount or when fixture changes
  useEffect(() => {
    if (autoStart && fixture.length > 0) {
      start();
    }
    return () => {
      stop();
    };
  }, [fixture, autoStart]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    state,
    elapsedMs,
    start,
    stop,
    restart: start,
  };
}
