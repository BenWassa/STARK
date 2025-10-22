# Sprint 1 – Manual QA Checklist

Use this checklist to verify the unit-switching experience after applying Sprint 1 changes.

- **Onboarding toggle:** Start the onboarding flow, switch the measurement select between Metric and Imperial, and confirm all weight/height placeholders update (including suggested imperial defaults).
- **Onboarding conversions:** Enter known metric values (e.g., 100 kg, 180 cm), toggle to Imperial, and ensure inputs display converted values. Toggle back to Metric and confirm originals return without drift.
- **Log overlay defaults:** Open “Log New Lifts”, inspect placeholders for strength metrics, and verify they match the active unit system.
- **Log overlay persistence:** While the overlay is open, enter numbers, toggle units, and confirm entries convert in-place without clearing or duplicating values.
- **Saved entries:** Submit logged data in each unit system, reopen the overlay, and confirm stored values rehydrate using the active unit labels.
- **Reload persistence:** Switch to Imperial, refresh the app, and check the selected system persists across onboarding state and the log overlay.
