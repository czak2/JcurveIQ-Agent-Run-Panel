# Agent Run Panel — JcurveIQ Frontend Assessment

A React component that visualises a live multi-agent research run in real time, built for JcurveIQ's AI research pipeline. Designed for **financial analysts, not developers** — every label, colour, and interaction is framed in domain language they already understand.

## Design Philosophy

This UI is built around one insight from the brief: the user is a financial analyst who currently sees a spinner and waits. They need to understand what the system is doing and trust the output. That means:

- **Domain language, not developer jargon**: "Research Step" not "Task", "Preliminary Finding" not "Partial Output", "Not Needed" not "Cancelled".
- **Colour system that feels like finance**: Navy + gold palette inspired by financial terminals and institutional research platforms — not the default blue/purple of dev tools.
- **Information hierarchy that serves the analyst**: The final research output is the star. Agent thoughts are hidden by default. Cancelled tasks are framed as positive decisions, not failures.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

The app runs on `http://localhost:5173` by default.

## Switching Between Fixtures

The app provides two pre-built fixtures accessible from the toolbar:

- **Success fixture** — A complete 28-event run that fetches Apple R&D data and 3 peer companies, handles a rate-limit failure with retry, cancels one task with `sufficient_data`, and synthesises a final research output with citations.
- **Error fixture** — A 16-event run that fails partway through when a critical data source becomes unavailable, showing partial results from completed tasks.

Click the **✓ Success** or **✕ Error** buttons in the top bar to switch between fixtures.

## Speed Control

The toolbar includes a speed multiplier (1x / 2x / 4x) that controls how fast the mock event stream replays. Use 1x for realistic timing or 4x for quick review.

## Replay

Click **↻ Replay** to restart the current fixture from the beginning.

## Architecture

```
src/
├── types/
│   └── events.ts          # TypeScript types for all event types and derived UI state
├── hooks/
│   └── useAgentRun.ts     # Core state management — reducer-based run state machine
├── mock/
│   └── MockEventEmitter.ts # Replays fixture events with realistic timing
├── components/
│   ├── AgentRunPanel.tsx   # Main orchestrator — renders header, output, task list
│   ├── RunHeader.tsx       # Run query, status badge, elapsed time, coordinator thoughts
│   ├── TaskItem.tsx        # Individual task card with status, tool calls, outputs, thoughts
│   ├── ParallelGroup.tsx   # Visual container for parallel tasks with accent bar
│   ├── ToolCalls.tsx       # Tool call/result pairs within a task
│   ├── PartialOutputs.tsx  # Intermediate and final outputs with collapsible history
│   ├── AgentThoughts.tsx   # Collapsible agent reasoning section
│   ├── StatusBadge.tsx     # Status indicators with colour coding
│   ├── FinalOutput.tsx     # Prominent synthesised result with citations
│   └── EmptyState.tsx      # Idle state when no run is active
mock/
└── fixtures/
    ├── run_success.json    # Complete success fixture (28 events)
    └── run_error.json      # Error fixture (16 events)
```

### State Management

The core uses `useReducer` with a single `RunState` object that tracks:

- Run metadata (ID, query, status, elapsed time)
- A `Map<string, TaskState>` for all tasks
- Task spawn order for correct rendering
- Coordinator thoughts
- Final output and error state

Each incoming event is dispatched to the reducer, which produces a new immutable state. The reducer handles several non-obvious edge cases:

- **Retry tracking**: A task going `running → failed → running` sets `hasRetried: true`, which the UI uses to show an "Auto-retried" badge.
- **Completion inference**: If a `partial_output` with `is_final: true` arrives without a preceding `task_update`, the reducer marks the task as complete — the event stream doesn't always send an explicit status transition.
- **Cancelled-dependency resolution**: When a synthesis task depends on a cancelled task, the UI doesn't show it as an unmet dependency — the coordinator's decision to proceed implies the dependency was satisfied.

The `MockEventEmitter` class replays fixture events with realistic inter-event timing using `setTimeout`, respecting a configurable speed multiplier.

### Key Design Decisions

See [DECISIONS.md](./DECISIONS.md) for detailed reasoning on the five under-specified requirements:

1. Agent thoughts — shown on demand, not by default
2. Parallel task layout — grouped container with accent bar
3. Partial outputs — progressive inline with collapsible history
4. Cancelled with `sufficient_data` — positive, not alarming
5. Task dependency display — subtle badge, resolved by completion

### Git History

The repo has 20+ incremental commits with conventional commit messages (`feat:`, `fix:`, `docs:`, `refactor:`), built in a bottom-up order: types → mock → state → leaf components → orchestrator → app → polish → docs. Each commit represents a logical stage of development.

## AI Tool Usage

I used AI tools (ChatGPT, GLM, and DeepSeek) heavily throughout this project — for writing code, not just looking things up. Specifically:

- **Code generation**: Most of the React components, the reducer-based state machine, the MockEventEmitter class, and the Tailwind styling were written with AI assistance. I'd describe what I wanted in terms of the product decision, and the AI generated the implementation.
- **Debugging**: AI helped track down bugs like the stale closure in `useAgentRun` where `state.status` was read inside a `setInterval` but the reference was stale — fixed by switching to a `useRef`.
- **Iteration**: I used AI to rapidly iterate on the UI — widening layouts, bumping font sizes, adjusting the colour system — after reviewing the output and deciding what needed to change.

**What I did not delegate to AI: product decisions.** The assessment asks whether _you_ are driving the product, not whether you typed every line yourself. My contributions were:

- Reading the brief and understanding that the user is a **financial analyst, not a developer** — every naming choice flows from this.
- Choosing domain-specific language: "Research Step" instead of "Task", "Preliminary Finding" instead of "Partial Output", "Not Needed" instead of "Cancelled".
- Designing the colour system (navy + gold) to feel like a financial platform, not a dev tool.
- Deciding the information hierarchy: final output as the star, agent thoughts hidden by default, cancelled tasks framed as positive decisions.
- All five decisions in [DECISIONS.md](./DECISIONS.md) — what to do, why, and what would change my mind.

AI was my implementation accelerator. I was the product owner.

## Hardest Part to Make Legible & Schema Change Suggestion

The hardest part of the agentic state design to make legible was the **retry sequence** — when `t_004` goes `running → failed → running → cancelled`. Showing this as a linear timeline is straightforward, but making the analyst understand _why_ it's not alarming is hard. The task failed (red = bad), then retried (back to blue = okay), then got cancelled (what does that mean?). Each transition makes sense in isolation, but the combined narrative — "it hit a rate limit, the system automatically retried, and then the coordinator decided it had enough data from the other peers anyway" — requires the analyst to hold three states in their head and resolve them into a coherent story. I addressed this with the "Auto-retried" badge and the "Not needed" cancellation label, but I'm not fully satisfied that a first-time user would immediately grasp the full arc without reading carefully.

One thing I'd change about the event schema: **add a `retry_count` field to `task_spawned` or `task_update` events.** Currently, detecting a retry requires the frontend to watch for `failed → running` transitions and infer that a retry happened. This is fragile — if two rapid `task_update` events arrive in the same tick, the intermediate `failed` state might be batched away by React's state updates, and the UI would never know a retry occurred. An explicit `retry_count: 1` on the second `running` update would make this unambiguous and trivial to render.

## Known Gaps (With More Time)

- **Accessibility**: ARIA labels on interactive elements, keyboard navigation for the task list, screen reader announcements for status changes. This is the biggest gap — the UI works well for sighted mouse users but would be difficult to navigate with assistive technology.
- **Test coverage**: Unit tests for the reducer (especially the retry, cancelled, and completion-inference edge cases) and integration tests for the event stream timing. The state machine has enough non-obvious logic that tests would significantly increase confidence.
- **Mobile layout**: Desktop and tablet layouts are solid. Very small screens (< 375px) would benefit from a collapsible toolbar and an accordion pattern for the parallel group container.
- **Streaming text animation**: The partial output from the synthesis task could use a typewriter effect instead of appearing as a block, which would feel more "live" and match the real-time nature of the event stream.
- **Persistence**: Run history — storing completed runs in localStorage and allowing the analyst to revisit them without re-running the fixture.
