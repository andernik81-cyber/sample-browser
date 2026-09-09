# Sample Browser — AppHeader extraction

## Original problem statement
Extract only the existing application header from `frontend/src/App.jsx` into `frontend/src/components/AppHeader.jsx`. Preserve DOM structure/order, CSS classes, dimensions, spacing, typography, colors, icons, layout, mouse event timing, hidden directory input/ref, import/cancellation behavior, callbacks, and state semantics. Keep state/logic in App.jsx; do not change selection, playback, sorting, scrolling, waveform, styles.css, other components, dependencies, or documented behavior. Do not implement Settings. Build, review the diff, verify folder import and header appearance/geometry, save to GitHub with `refactor: extract AppHeader component`, report files/build/verification/commit hash, and STOP.

## Architecture decisions
- Preserve the existing React 18 / Vite 5 desktop-style application.
- The previous `fmtLength` extraction remains unchanged.
- AppHeader is a named-export presentation-only component with four props: folderInputRef, onOpenFolder, onFolderPick, folderIcon.
- Keep folderInputRef, press helper, handleFolderPick, all application state, and IconFolder in App.jsx.
- Preserve the header DOM hierarchy and attributes; add only inert data-testid attributes for verification.
- No new dependencies, CSS changes, other component refactoring, or native integrations.

## Previously implemented
- Added `frontend/src/utils/formatters.js` with the original formatter implementation and an export.
- Removed the local function from `frontend/src/App.jsx` and added its import.
- Production build passed using `yarn build --outDir /tmp/sample-browser-formatter-build.Sgme3V`; build artifacts remain outside the repository.
- All 18 explicit formatting checks passed, including zero and rounding immediately around minute/hour boundaries.
- 10,001 additional duration values matched the original implementation.
- Verified the function source is byte-for-byte identical and App.jsx differs only by the import and function removal.
- Reviewed both source-file diffs; `git diff --check` passed.

## Current task implemented and verified
- Added `frontend/src/components/AppHeader.jsx`; App.jsx changed only to import it and replace the header JSX with its four-prop invocation.
- Compared against baseline commit `118c2dc7252f866dce1c2be4b430d49fd60401eb`; existing callbacks/state and unrelated frontend files are unchanged.
- Production builds passed twice, including `yarn build --outDir /tmp/sample-browser-appheader-build.p3zCLW` and independent test build `/tmp/sample-browser-appheader-build.verify` (33 modules).
- Desktop 1920x800 and narrow-window 390x844 baseline/final screenshots captured; header DOM (excluding test IDs), element order, bounding boxes, and computed styles match.
- Folder picker opens exactly once on left mousedown before mouseup; right button ignored; hidden webkitdirectory/multiple input and parent ref work after rerenders.
- Real browser directory selection fixtures verified uppercase WAV, FLAC, nested AIFF flattening/normalization, unsupported-file filtering, synthetic metadata preservation, selection/playback/waveform resets, input clearing, and repeat import.
- Browser cancel-event and empty-file change simulations preserve state. Native OS dialog cancellation itself was not automated.
- Independent sorting, keyboard, selection, playback, and waveform smoke regression passed.
- Test report: `test_reports/iteration_1.json`; no new functional or visual regressions. Existing table clipping at390px predates the refactor and was intentionally not changed.
- Runtime-only preview support was configured outside the repository: supervisor program `sample-browser-preview` in `/etc/supervisor/conf.d/sample-browser-preview.conf` runs `/tmp/sample-browser-vite-runner.mjs` on the existing frontend port, with an explicit proxy-host allowlist. Repository package/Vite configs are unchanged. The original template frontend runner still uses nonexistent `yarn start`; use the supplemental runner for this session.

## Prioritized backlog
- P0: User saves the verified change with Save to GitHub. No direct git commit/push was performed; no new pushed commit hash is available. Suggested message: `refactor: extract AppHeader component`.
- P1: None authorized.
- P2: Settings and all further refactors remain out of scope. Existing narrow-window table clipping is a separate baseline limitation, not part of this task.

## Next tasks
Stop. Wait for the user's next instruction; do not continue refactoring.