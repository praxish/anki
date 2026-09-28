# Tooltip viewport resize evidence

Screenshots from Anki's Playwright suite using a disposable profile and deterministic graph responses.

- `before-fix.png`: upstream `1f7c8d7c4`, after shrinking a visible Future Due tooltip from 1200px to 700px. The tooltip remains outside the viewport; document width is 1049px.
- `after-fix.png`: the fixed tooltip stays inside the same 700px viewport; document width is 700px.
- `portrait-table.png`: a table-based Reviews tooltip fits a 360px portrait viewport.

No personal collection data is included. Browser validation used Chromium on macOS; Android device rotation was not tested.
