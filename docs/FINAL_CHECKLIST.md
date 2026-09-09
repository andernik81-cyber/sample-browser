# Sample Browser — Integration Checklist

## UI preparation — completed

- [x] Settings / Preferences shell exists.
- [x] Audio Device state prepared separately from audio engine implementation.
- [x] MIDI state prepared separately from MIDI implementation.
- [x] Unified transport state prepared.
- [x] Position/duration display prepared.
- [x] Waveform UI can accept future backend data.
- [x] Metadata panel prepared for BPM, Key, Tags, Rating, Date, Size, Path.
- [x] Loading/scanning states prepared.
- [x] Unified Sample/Folder model prepared for future JUCE backend.
- [x] Search/filter state is separated from filesystem implementation.
- [x] No Web Audio API as production backend.
- [x] No Web MIDI API as production backend.
- [x] Backend-facing features have adapter boundaries.
- [x] `npm run build` passes.

## JUCE/WebView2 integration — completed

- [x] JUCE 9.0.2 native CMake project exists.
- [x] Visual Studio/MSVC Debug build passes.
- [x] WebView2 Runtime is installed on the development machine.
- [x] Microsoft.Web.WebView2 SDK is prepared outside the repository.
- [x] `JUCE_USE_WIN_WEBVIEW2=1` is enabled.
- [x] `JUCE_USE_WIN_WEBVIEW2_WITH_STATIC_LINKING=1` is enabled.
- [x] `juce::juce_webview2` is linked.
- [x] `juce::WebBrowserComponent` uses the WebView2 backend.
- [x] `ResourceProvider` serves `frontend/dist`.
- [x] Embedded root is `https://juce.backend/`.
- [x] Vite production paths use `base: './'`.
- [x] React UI loads inside the Windows `.exe`.
- [x] WebView occupies the native application content area.
- [x] Build output `juce/build/` is excluded from Git.

## Native backend — not yet implemented

- [ ] Native Windows folder picker.
- [ ] React → C++ command for selecting a folder.
- [ ] Recursive filesystem scanner.
- [ ] Native library/index model.
- [ ] Thin JUCE ↔ React bridge for backend data.
- [ ] Real sample files in the File Table.
- [ ] Native audio playback.
- [ ] Real seek / transport synchronization.
- [ ] Real waveform generation and cache.
- [ ] Audio device management.
- [ ] ASIO support.
- [ ] MIDI device enumeration and functionality.
- [ ] Real metadata extraction.
- [ ] Tag database and tag-tree search.
- [ ] Native Explorer / REAPER drag & drop.
- [ ] VST3 hosting.

## Per-stage acceptance rule

Every native stage must:

1. preserve the existing React UI unless an explicit UI change is required;
2. keep frontend build working;
3. keep JUCE build working;
4. have a clearly defined React/native boundary;
5. be manually tested in the Windows `.exe` when GUI behaviour is involved;
6. avoid unrelated refactors;
7. leave generated build output outside Git.

## Current next step

**Stage 11 — Native Folder Picker.**

The next acceptance test is simple: press the existing `Open Folder` action, choose a real Windows folder, and confirm that JUCE receives the real absolute path. Do not implement recursive scanning in Stage 11 yet.
