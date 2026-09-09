# Sample Browser — formatter extraction

## Original problem statement
Extract the existing `fmtLength` function from `frontend/src/App.jsx` into `frontend/src/utils/formatters.js`, preserving its implementation and behavior. Update App.jsx only to import the function. Do not change the DOM, CSS, state, handlers, components, dependencies, UI, or interactions. Run the production build; verify 2.23, 63.44, 3754.345, zero, and minute/hour rounding boundaries; review the diff. The user requested a GitHub commit and commit hash. Stop afterward: no AppHeader or Settings work.

## Architecture decisions
- Preserve the existing React 18 / Vite 5 desktop-style application.
- Use a named ES module export for the unchanged pure formatter.
- No new dependencies, component changes, or native integrations.

## Implemented
- Added `frontend/src/utils/formatters.js` with the original formatter implementation and an export.
- Removed the local function from `frontend/src/App.jsx` and added its import.
- Production build passed using `yarn build --outDir /tmp/sample-browser-formatter-build.Sgme3V`; build artifacts remain outside the repository.
- All 18 explicit formatting checks passed, including zero and rounding immediately around minute/hour boundaries.
- 10,001 additional duration values matched the original implementation.
- Verified the function source is byte-for-byte identical and App.jsx differs only by the import and function removal.
- Reviewed both source-file diffs; `git diff --check` passed.

## Prioritized backlog
- P0: User saves the verified change using Save to GitHub; no direct git commit or push was performed. Suggested message: `refactor: extract fmtLength into shared formatter utility`.
- P1: None authorized.
- P2: AppHeader and Settings remain explicitly out of scope.

## Next tasks
Stop. Wait for the user's next instruction; do not continue refactoring.