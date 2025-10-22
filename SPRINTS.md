# SPRINTS

This document converts the requested upgrades into clear, actionable sprint items with subtasks, acceptance criteria, estimates, and PR checklist.

---

## Sprint 1 — Units and onboarding (2–3 days)
Goal: Ensure unit switching (metric/imperial) updates all displayed values consistently across onboarding and the add-entry overlay.

Tasks:
- T1.1: Audit current unit usage
  - Files to inspect: `frontend/src/components/Onboarding.jsx`, `frontend/src/components` (overlay components), `frontend/src/utils/units.js`, `frontend/src/utils/storage.js`
  - Deliverable: short report listing where units are read, displayed, and persisted.
- T1.2: Make global units context/provider
  - Implement a React context `UnitsContext` that exposes chosen units and conversion helpers.
  - Replace ad-hoc unit reads with context consumer.
- T1.3: Update onboarding to use UnitsContext
  - Ensure all numeric values (weights, heights, distances) update when unit toggles.
  - Ensure previews and calculated examples convert immediately.
- T1.4: Update 'Log new lifts' overlay to consume UnitsContext
  - Update labels and value placeholders to show correct unit symbols.
  - If pre-filled values exist, convert them on unit change or preserve intent (see acceptance criteria).
- T1.5: Tests & QA
  - Unit tests for conversion helpers.
  - Manual QA checklist (toggle units, inspect onboarding pages, overlay). 

Acceptance criteria:
- Switching units immediately updates all displayed numeric values in Onboarding.
- Unit preference is persisted and re-applied on reload.
- `Log new lifts` overlay shows matching units.

PR checklist:
- Passes lint/typecheck
- Unit tests added/updated
- Screenshots or short GIF demonstrating unit toggle

Estimated effort: 2–3 days

---

## Sprint 2 — Recovery metrics improvements (1–2 days)
Goal: Improve recovery inputs to capture both objective and subjective sleep, clarify stress and soreness metrics.

Tasks:
- T2.1: Add "Average hours of sleep" input
  - Add numeric input (hours, decimal allowed) to recovery metrics.
  - Persist value to storage using existing schema or migrate.
- T2.2: Add "Sleep quality" subjective input
  - Add a 1–5 or 1–10 slider for perceived sleep quality with short descriptors (e.g., 1: very poor — 5: excellent).
- T2.3: Clarify stress metric copy
  - Update label to: "Stress level (subjective)" and add tooltip: "How stressed have you felt on average? (work, personal, financial, etc.)"
- T2.4: Rework muscle soreness metric
  - Options: clarify the question with examples and a small definition, or replace with a more operational metric like "localized soreness" with body-part selector.
  - Deliver a recommended copy and a small UI change.
- T2.5: Data handling
  - Update any calculations/aggregations to include new sleep inputs where relevant.

Acceptance criteria:
- New sleep inputs are present and persisted.
- Stress metric label and tooltip are clear.
- Muscle soreness has either clearer guidance or an improved operationalized variant.

Estimated effort: 1–2 days

---

## Sprint 3 — UI copy and iconography (0.5–1 day)
Goal: Rename "Log new lifts" to a general label and swap icons for strength and mobility.

Tasks:
- T3.1: Replace button text
  - New label options: "Log Activity", "Add Entry", or "Log Session". Decide and update code.
- T3.2: Update strength & mobility icons
  - Add provided strength SVG from repo root into `frontend/src/assets/icons` and reference it.
  - Replace mobility icon with a rubber-band/elastic SVG (create or pick from icon set).
- T3.3: Update alt text and accessibility labels
  - Ensure aria-labels reflect the new purpose.
- T3.4: Tests
  - Update any snapshot/tests referencing the button text or icons.

Acceptance criteria:
- Button text updated across the app.
- New icons display correctly and pass basic accessibility checks.

Estimated effort: 0.5–1 day

---

## Implementation notes & assumptions
- Assume the frontend is a React app (based on `App.jsx` and `main.jsx`) and uses local storage via `frontend/src/utils/storage.js`.
- Prefer adding a `UnitsContext` rather than sprinkling conversion logic.
- Backwards compatibility: existing stored recovery values will be read; migrations or defaults will be added if needed.

---

## PR checklist (global)
- Linting and type checks pass.
- Tests for new behaviors added.
- Migration notes included for schema changes.
- Screenshots or short recordings for visual changes.

---

## Next steps
1. Pick a sprint to start and create a branch (e.g., `feat/units-onboarding`).
2. Implement T1.1 audit and share findings.
3. Implement `UnitsContext` and wire onboarding + overlay.

