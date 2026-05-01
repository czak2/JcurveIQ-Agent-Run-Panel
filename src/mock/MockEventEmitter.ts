import type { AgentEvent } from '../types/events';

type EventHandler = (event: AgentEvent) => void;

/**
 * MockEventEmitter replays a fixture event sequence with realistic timing.
 *
 * Timing strategy:
 * - Uses the delta between consecutive event timestamps to determine delay
 * - Applies an optional speed multiplier for faster testing
 * - Each event fires at the correct relative time so the run feels "live"
 */
export class MockEventEmitter {
  private events: AgentEvent[];
  private speedMultiplier: number;
  private handler: EventHandler | null = null;
  private timeouts: ReturnType<typeof setTimeout>[] = [];
  private started = false;
  private baseTimestamp: number;

  constructor(events: AgentEvent[], speedMultiplier = 1) {
    this.events = events;
    this.speedMultiplier = speedMultiplier;
    // Base timestamp is the first event's timestamp
    this.baseTimestamp = events.length > 0 ? events[0].timestamp : 0;
  }

  /** Subscribe to events as they are emitted */
  onEvent(handler: EventHandler): void {
    this.handler = handler;
  }

  /** Start replaying the fixture */
  start(): void {
    if (this.started) return;
    this.started = true;

    for (let i = 0; i < this.events.length; i++) {
      const event = this.events[i];
      const delayMs =
        i === 0
          ? 0
          : (event.timestamp - this.baseTimestamp) / this.speedMultiplier;

      const timeout = setTimeout(() => {
        this.handler?.(event);
      }, delayMs);

      this.timeouts.push(timeout);
    }
  }

  /** Stop all pending emissions */
  stop(): void {
    for (const t of this.timeouts) {
      clearTimeout(t);
    }
    this.timeouts = [];
    this.started = false;
  }

  /** Get the total duration of the fixture in ms (adjusted for speed) */
  get totalDuration(): number {
    if (this.events.length === 0) return 0;
    const last = this.events[this.events.length - 1];
    return (last.timestamp - this.baseTimestamp) / this.speedMultiplier;
  }

  /** Whether the emitter is currently running */
  get isRunning(): boolean {
    return this.started;
  }
}
