import { useState, useEffect, useCallback } from "react";
import { AgentRunPanel } from "./components/AgentRunPanel";
import { EmptyState } from "./components/EmptyState";
import { useAgentRun } from "./hooks/useAgentRun";
import type { AgentEvent } from "./types/events";

// Import fixtures
import successFixture from "../mock/fixtures/run_success.json";
import errorFixture from "../mock/fixtures/run_error.json";

type FixtureKey = "success" | "error";

const fixtures: Record<FixtureKey, AgentEvent[]> = {
  success: successFixture as AgentEvent[],
  error: errorFixture as AgentEvent[],
};

function App() {
  const [activeFixture, setActiveFixture] = useState<FixtureKey | null>(null);
  const [speed, setSpeed] = useState(1);
  const [fixtureData, setFixtureData] = useState<AgentEvent[]>([]);
  const [runKey, setRunKey] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { state, elapsedMs, start, stop } = useAgentRun({
    fixture: fixtureData,
    speed,
    autoStart: false,
  });

  const handleStartRun = useCallback(() => {
    setFixtureData(fixtures.success);
    setActiveFixture("success");
    setRunKey((k) => k + 1);
  }, []);

  const handleSwitchFixture = useCallback(
    (key: FixtureKey) => {
      stop();
      setFixtureData(fixtures[key]);
      setActiveFixture(key);
      setRunKey((k) => k + 1);
      setMobileMenuOpen(false);
    },
    [stop],
  );

  const handleRestart = useCallback(() => {
    stop();
    setRunKey((k) => k + 1);
    setMobileMenuOpen(false);
  }, [stop]);

  useEffect(() => {
    if (fixtureData.length > 0) {
      const timer = setTimeout(() => {
        start();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [fixtureData, runKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasActiveRun = state.runId !== null;

  return (
    <div className="min-h-screen bg-navy-50">
      {/* ─── Platform Header ─────────────────────────────── */}
      <header className="sticky top-0 z-10 border-b border-navy-200 bg-navy-900">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-2.5 lg:max-w-4xl xl:max-w-6xl lg:px-8">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-gold-400 lg:h-8 lg:w-8">
              <svg
                className="h-4 w-4 text-navy-900 lg:h-5 lg:w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-sm font-bold text-white tracking-tight lg:text-base">
                JcurveIQ
              </span>
              <span className="text-[10px] font-medium text-navy-400 bg-navy-800 rounded px-1.5 py-0.5 lg:text-xs">
                Research
              </span>
            </div>
          </div>

          {/* Desktop Controls */}
          <div className="hidden sm:flex items-center gap-2 lg:gap-3">
            {/* Speed control */}
            <div className="flex items-center gap-0.5 rounded-md bg-navy-800 px-1 py-0.5">
              {([1, 2, 4] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`rounded px-2 py-0.5 text-[10px] font-semibold transition-all lg:px-2.5 lg:text-xs ${
                    speed === s
                      ? "bg-navy-600 text-white"
                      : "text-navy-400 hover:text-navy-200"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Fixture switcher */}
            <div className="flex items-center gap-0.5 rounded-md bg-navy-800 px-1 py-0.5">
              {(["success", "error"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => handleSwitchFixture(key)}
                  className={`rounded px-2.5 py-0.5 text-[10px] font-semibold transition-all lg:px-3 lg:text-xs ${
                    activeFixture === key
                      ? key === "success"
                        ? "bg-emerald-600/30 text-emerald-300"
                        : "bg-red-600/30 text-red-300"
                      : "text-navy-400 hover:text-navy-200"
                  }`}
                >
                  {key === "success" ? "✓ Success" : "✕ Error"}
                </button>
              ))}
            </div>

            {/* Replay */}
            {activeFixture && (
              <button
                onClick={handleRestart}
                className="rounded-md bg-gold-400 px-3 py-1 text-[10px] font-bold text-navy-900 transition-colors hover:bg-gold-300 lg:px-4 lg:text-xs"
                title="Replay current analysis"
              >
                ↻ REPLAY
              </button>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden flex items-center justify-center h-8 w-8 rounded-md bg-navy-800 text-navy-300 hover:text-white transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-navy-800 bg-navy-900 px-4 py-3 space-y-3 animate-in">
            {/* Speed control */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-navy-400 mb-1.5">
                Speed
              </p>
              <div className="flex items-center gap-1">
                {([1, 2, 4] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setSpeed(s);
                    }}
                    className={`flex-1 rounded px-3 py-1.5 text-xs font-semibold transition-all ${
                      speed === s
                        ? "bg-navy-600 text-white"
                        : "bg-navy-800 text-navy-400 hover:text-navy-200"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            {/* Fixture switcher */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-navy-400 mb-1.5">
                Fixture
              </p>
              <div className="flex items-center gap-2">
                {(["success", "error"] as const).map((key) => (
                  <button
                    key={key}
                    onClick={() => handleSwitchFixture(key)}
                    className={`flex-1 rounded px-3 py-1.5 text-xs font-semibold transition-all ${
                      activeFixture === key
                        ? key === "success"
                          ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500/30"
                          : "bg-red-600/30 text-red-300 border border-red-500/30"
                        : "bg-navy-800 text-navy-400 hover:text-navy-200"
                    }`}
                  >
                    {key === "success" ? "✓ Success" : "✕ Error"}
                  </button>
                ))}
              </div>
            </div>

            {/* Replay button */}
            {activeFixture && (
              <div>
                <button
                  onClick={handleRestart}
                  className="w-full rounded-md bg-gold-400 px-4 py-2 text-sm font-bold text-navy-900 transition-colors hover:bg-gold-300"
                >
                  ↻ Replay Analysis
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="px-4 py-6 lg:px-8 lg:py-8">
        {hasActiveRun ? (
          <AgentRunPanel state={state} elapsedMs={elapsedMs} />
        ) : (
          <EmptyState onStartRun={handleStartRun} />
        )}
      </main>
    </div>
  );
}

export default App;
