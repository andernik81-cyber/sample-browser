# Sample Browser — Settings panel shell

## Original problem statement
Implement ONLY a Settings panel shell. Add a small accessible gear at the far right of the existing AppHeader; gear toggles a fixed-width right-side panel without navigation, replacing the browser, or resizing the existing layout. Panel has a Settings title, close button, scrollable navigation/content, and exactly General, Audio, Playback, MIDI, Library, Metadata, Search, Browser sections with simple future-settings text. App owns open/closed state and callbacks; SettingsPanel owns active section/panel state and remains mounted when closed. Preserve all existing UI, dimensions, colors, interactions, folder import, selection, sorting, scrolling, playback, and waveform. No actual settings controls, persistence, global state library, dependencies, JUCE/native/audio/device implementation, or unrelated refactoring. Verify build, gear/close/navigation, browser regressions and narrow widths; review diff. Save to GitHub with `refactor: add settings panel shell`, then STOP and report files/build/verification/hash.

## Architecture decisions
- Preserve the existing React 18 / Vite 5 desktop-style application.
- The previous `fmtLength` extraction remains unchanged.
- AppHeader remains presentation-only; its original four folder-related props are unchanged. Settings adds settingsOpen, settingsButtonRef, and onToggleSettings.
- Keep folderInputRef, press helper, handleFolderPick, all application state, and IconFolder in App.jsx.
- App owns settingsOpen plus the gear ref and close/focus-return callback. SettingsPanel owns activeSection through useState and is always mounted, using hidden when closed.
- Non-modal, right-side 320px overlay; maximum width is capped to the app width. It starts below the unchanged 32px app header and does not participate in flex layout.
- New styles are scoped in `frontend/src/features/settings/settings.css`; original `styles.css` is unchanged.
- New controls use left-mousedown immediate commands, ignore right-click, and support keyboard-generated click without duplicate mouse activation.
- No new dependencies, other component refactoring, persistence, actual settings controls, or native integrations.

## Previously implemented
- Added `frontend/src/utils/formatters.js` with the original formatter implementation and an export.
- Removed the local function from `frontend/src/App.jsx` and added its import.
- Production build passed using `yarn build --outDir /tmp/sample-browser-formatter-build.Sgme3V`; build artifacts remain outside the repository.
- All 18 explicit formatting checks passed, including zero and rounding immediately around minute/hour boundaries.
- 10,001 additional duration values matched the original implementation.
- Verified the function source is byte-for-byte identical and App.jsx differs only by the import and function removal.
- Reviewed both source-file diffs; `git diff --check` passed.

## Previously verified AppHeader extraction
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

## Current Settings shell implemented and verified
- Added `SettingsPanel.jsx` and scoped `settings.css` under `frontend/src/features/settings/`; modified App.jsx/AppHeader.jsx only for the gear and shell wiring.
- Baseline revision: `f9f5a3fd1ada5be9719fbd5be823cf9443694eb2`. Existing browser body/waveform DOM and all measured geometry match baseline with Settings both closed and open at 1920x800 and 390x844.
- Fixed 320px panel: desktop x1599/y34/w320/h765, narrow-window x69/y34/w320/h809. No existing layout adjustment was necessary and Settings introduces no horizontal overflow.
- Verified gear open/toggle-close, close button, focus return, Enter/Space activation, all eight sections and exact order, hidden state, non-modal background use, and section retention after closing/reopening.
- Folder imports/reimports, extension filtering/nested flattening, cancel-event/empty-change simulation, selection/sort/keyboard/playback/waveform/volume regressions passed with Settings open and closed. Native OS chooser cancellation was not automated.
- Independently verified scrolling with 80 imported samples and 24 imported folders: tree/table scroll separately. Settings content scroll and navigation scroll in a short app window do not move the browser underneath. Temporary long-text/short-height fixtures were removed after testing.
- Production builds passed (35 modules). Retained output outside repository: `/tmp/sample-browser-settings-build.OXk857`. Removed tester-generated `frontend/dist` artifacts.
- Report: `test_reports/iteration_2.json`; no new product bugs. Existing narrow-window file-table clipping remains an intentionally preserved baseline limitation.
- Diff reviewed: original styles.css, main.jsx, formatter, package/lock and Vite config unchanged; no unrelated browser handlers/state were changed.

## Prioritized backlog
- P0: User saves the verified shell via Save to GitHub. No direct git commit/push was performed; no new pushed hash is available. Message: `refactor: add settings panel shell`.
- P1: No actual settings controls or further implementation authorized.
- P2: Existing narrow-window table clipping remains separate baseline debt, not part of this task.

## Next tasks
Stop. Wait for the user's next instruction; do not continue refactoring.