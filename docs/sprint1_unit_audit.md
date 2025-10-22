# Sprint 1 – Unit Handling Audit

## Where units are read
- `frontend/src/App.jsx:80` toggles `userData.measurementSystem` via `toggleMeasurementSystem`, and the rest of the app reads from this field through `DataContext`.
- `frontend/src/components/Onboarding.jsx:13` defaults `measurementSystem` from `userData` (falling back to metric) when rendering onboarding flows.
- `frontend/src/App.jsx:327` computes `measurementSystem` for the “Log Your Progress” overlay and downstream helpers (`getPlaceholderValue`, `getInputValue`, `getUnitLabel`).

## Where units are displayed or converted
- `frontend/src/components/Onboarding.jsx:15-50` derives display units with `getDisplayUnit`, formats values using `convertValueToDisplay`, and overrides placeholders (e.g., `SUGGESTED_IMPERIAL_WEIGHTS` for imperial defaults).
- `frontend/src/components/Onboarding.jsx:112-125` normalizes input by converting display values back to metric with `convertValueToBase` before storing.
- `frontend/src/App.jsx:335-391` prepares modal placeholders and field values by passing exercise defaults and stored values through `convertValueToDisplay`, formatting the result per-unit.
- `frontend/src/App.jsx:409-437` watches for measurement-system changes while the overlay is open and re-hydrates buffered inputs by converting through base units.
- `frontend/src/utils/units.js` centralizes conversions/formatting helper functions consumed in both onboarding and the overlay; `getDisplayUnit`, `convertValueToDisplay`, and `convertValueToBase` are the only conversion APIs currently used.

## Where units are persisted
- `frontend/src/App.jsx:47-120` owns the canonical `userData` state (including `measurementSystem`), loading it from IndexedDB on mount and debounced-saving via `saveUserData`.
- `frontend/src/components/Onboarding.jsx:260-268` writes the user’s selection directly into `userData.measurementSystem`, which is immediately eligible for persistence through the debounced saver.
- `frontend/src/utils/storage.js` persists `userData` and thus the unit preference in IndexedDB via `saveUserData`; no other store tracks units.

## Gaps & risks spotted during audit
- No dedicated provider/context for units yet; components reach into `userData` directly, so every consumer reimplements the same conversion glue.
- Some parts of the UI (e.g., summary cards in `App.jsx:485-590`) still hard-code metric strings like `ml/kg/min`, which may need review once a global context is introduced.
- Measurement toggling is synchronous but lacks persistence metadata (e.g., versioning) if conversion rules change in the future.
