# DECISIONS.md

Design decisions for the five intentionally under-specified requirements in the JcurveIQ Agent Run Panel assessment.

Each decision is framed from the perspective of the primary user: **a financial analyst, not a developer**. The analyst submits a research query and needs to understand what the system did, why they can trust the output, and whether the result is reliable enough to act on.

---

## 1. Agent Thoughts — Show as "Research Strategy", On Demand Only

**Decision:** Agent thoughts are hidden by default and revealed via a collapsible "Research strategy" toggle. The coordinator's latest thought is always visible in the run header as a "Research Strategy" note.

**Reasoning:** The primary user is a financial analyst who wants results, not implementation details. Raw agent thoughts like "Breaking into: (1) Apple 10-K fetch, (2) peer identification..." are developer-oriented language. Reframed as "Research Strategy", the same content answers the analyst's real question: "What's the plan?" Analysts are familiar with research plans — their own work starts with a thesis and methodology. Showing the coordinator's strategy validates that the system is methodical, not random. The per-task thoughts stay hidden because an analyst doesn't need to see internal deliberation for each data retrieval step. They care about the plan and the result, not the mechanics.

**What would change my mind:** If analytics showed that >40% of users expand the thoughts section on every run, I'd promote them to inline display. If users were primarily engineers debugging the pipeline, I'd default to expanded, label them "Agent Reasoning", and add a "copy reasoning" action for bug reports.

---

## 2. Parallel Task Layout — "Running Simultaneously" Group with Accent Bar

**Decision:** Parallel tasks are rendered inside a grouped container with a left accent bar and a "Running simultaneously" label. Mini status dots show each task's progress at a glance.

**Reasoning:** Financial analysts understand the concept of "checking multiple companies at the same time" — they do it themselves when they pull data from Bloomberg for several tickers in parallel. The phrase "Running simultaneously" maps directly to their mental model: "the system is gathering data from multiple sources in parallel." The left accent bar (blue while running, green when complete, gold when resolved via cancellation) gives a single-glance status for the whole group. The mini status dots are modelled after the progress indicators in financial platforms like Capital IQ or FactSet — small, colour-coded, and instantly readable. This avoids the two failure modes: (1) listing parallel tasks sequentially creates a false impression of sequential execution, and (2) a horizontal layout wastes vertical space and breaks on mobile.

**What would change my mind:** If parallel groups regularly exceeded 6–8 tasks, I'd switch to a compact grid with abbreviated task labels. If user testing showed the accent bar wasn't noticed, I'd add explicit connector lines or a timeline-style visualisation.

---

## 3. Partial Outputs — "Preliminary Finding" → "Confirmed Finding" Progression

**Decision:** Intermediate outputs (`is_final: false`) are shown as "Preliminary Finding" with a blue streaming indicator. When the final output arrives (`is_final: true`), it's displayed as a "Confirmed Finding" with a green shield icon and confidence percentage. Older preliminaries are collapsed behind a toggle.

**Reasoning:** Financial analysts deal with preliminary and confirmed data all the time — earnings estimates start as "preliminary" and become "confirmed" when the 10-K is filed. This framing maps directly to their existing mental model. A "Preliminary Finding" tells them "this is useful directional data but don't quote it yet." A "Confirmed Finding" with a confidence score tells them "this is verified and you can act on it." The quality_score is presented as "confidence" because that's the language analysts use — "how confident are we in this number?" not "what's the quality score?" Striking through older preliminary outputs mirrors how analysts cross out stale estimates in their models.

**What would change my mind:** If partial outputs were very frequent (5+ per task, streaming word-by-word), I'd show only the live-streaming content without history. If quality scores were unreliable or always null, I'd remove the confidence badge rather than show an empty state.

---

## 4. Cancelled with `reason: "sufficient_data"` — "Not Needed", Gold/Amber, Positive

**Decision:** Cancelled tasks with `reason: "sufficient_data"` are shown with a gold/amber colour scheme, a checkmark icon, and the label "Not needed — enough data collected". The explanatory message (e.g., "3 of 4 peers fetched. Coordinator proceeding with available data.") is displayed as supporting context.

**Reasoning:** This is the edge case that most reveals whether the UI designer understood the domain. In financial research, stopping early because you have enough data is not just acceptable — it's *best practice*. Analysts routinely say "we have enough coverage" and move to synthesis rather than waiting for every last data point. Showing this as a failure would be actively misleading. The gold/amber colour says "this was a deliberate decision" without the alarm of red or the finality of green. "Not needed" is better than "Cancelled" because it frames the action from the analyst's perspective — they don't need this data point, not that the system failed to get it. The checkmark icon reinforces that the coordinator made a sound decision.

**What would change my mind:** If analysts were confused by "Not needed" and searched for "cancelled" terminology, I'd use "Cancelled (sufficient data)" but keep the positive colour. If the coordinator could cancel for problematic reasons beyond `sufficient_data`, I'd differentiate more aggressively between "good" and "bad" cancellations.

---

## 5. Task Dependency Display — "After N Steps" Badge, Resolved by Completion

**Decision:** Tasks with `depends_on` show a small "after N steps" badge with a link icon. The badge tooltip lists the specific step labels (not IDs). When a dependency was cancelled (like t_004), the UI does NOT show it as an unmet dependency — the completed synthesis implicitly resolves it.

**Reasoning:** Analysts understand the concept of "this step depends on earlier results" — it's like building a financial model where the output of one cell feeds into another. "After 3 steps" is their language, not "depends_on: [t_001, t_002, t_003]". The key insight for the cancelled-dependency edge case is that the analyst doesn't need to see t_004 as a "missing dependency" when looking at the synthesis step. If the research brief is complete and verified, its dependencies were satisfied by definition — the coordinator already decided t_004 wasn't needed. Showing it as an unmet dependency would create doubt about the result's reliability, which would be misleading. The cancelled step is still visible in the simultaneous research group with its "Not needed" explanation, so the full execution trace is available for anyone who wants to audit it.

**What would change my mind:** If analysts needed to audit the pipeline for compliance or regulatory reasons, I'd add an expandable "Dependency graph" section showing all edges including cancelled ones. If the coordinator could produce incorrect results by ignoring cancelled dependencies, I'd add a warning on the dependent task.
