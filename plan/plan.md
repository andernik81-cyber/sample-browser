# Sample Browser — Analysis-Only Review

## Requested outcome

Review the existing project at https://github.com/andernik81-cyber/sample-browser and produce an evidence-based architecture and refactoring report. The purpose is to understand the existing desktop application before proposing changes, not to build or redesign anything.

Approval authorizes inspection and recommendations only. It does not authorize implementation or changes to application files.

## Review scope

Inspect the frontend thoroughly, together with the repository's agent instructions, context documentation, project structure documentation, roadmap, and existing package and configuration files.

Explain the current organization, UI boundaries, state management, mock data, waveform implementation, file browser, folder tree, column behavior, drag and drop, keyboard navigation, and other existing interactions. Distinguish confirmed findings from proposals and anything that cannot be verified.

## Boundaries to preserve

- Preserve the existing visual design and desktop interaction behavior.
- Do not modify repository files, add features, rewrite the application, or implement refactoring during this review.
- Treat React as the presentation layer, suitable for eventual embedding in a JUCE WebView.
- Reserve real audio, ASIO, MIDI, filesystem scanning, metadata analysis, playback, database/cache, and native functionality for the future JUCE/C++ backend.
- Do not propose Web Audio API as the future real audio engine.
- Avoid a generic web-app/dashboard replacement and unnecessary libraries. Prefer simple, maintainable React code.
- Propose the placement and responsibilities of Settings without inventing or implementing a new set of settings features.

## Required report

The report will contain exactly these seven sections:

1. **CURRENT ARCHITECTURE** — Explain how the existing React application is organized.
2. **CURRENT COMPONENT STRUCTURE** — Describe current UI groupings and logical component boundaries.
3. **REFACTORING OPPORTUNITIES** — Identify the safest maintainability improvements, emphasizing separation of concerns and reuse without behavior changes.
4. **SETTINGS ARCHITECTURE** — Recommend where Settings should belong and how its responsibilities should be separated.
5. **JUCE PREPARATION** — Distinguish future native-backend responsibilities and communication boundaries from frontend-only responsibilities.
6. **RISKS** — Identify changes that could unintentionally affect appearance or interactions.
7. **STEP-BY-STEP PLAN** — Recommend a small, low-risk set of independently verifiable implementation tasks. End this section by recommending the first small refactoring task, based on the actual findings.

## Assumptions and limits

- Existing behavior is the baseline to preserve, not an invitation to redesign it.
- Implementation remains a separate decision after the report is reviewed.
- If repository access or missing context prevents a reliable conclusion, the report will identify that limitation rather than invent findings.