# Sample Browser

Desktop sample browser for Windows.

## Current status

**Stage 10 завершён.** Существующий React/Vite интерфейс встроен в native JUCE 9.0.2 Windows-приложение через WebView2.

Текущий pipeline:

```text
React/Vite
   ↓
frontend/dist
   ↓
JUCE ResourceProvider
   ↓
https://juce.backend/
   ↓
juce::WebBrowserComponent + WebView2
   ↓
Sample Browser.exe
```

Приложение запускается как Windows `.exe`, а React UI продолжает использовать существующие mock-данные.

## Technology stack

- Windows
- JUCE 9.0.2
- CMake
- Visual Studio / MSVC
- WebView2 Runtime
- Microsoft.Web.WebView2 SDK
- React 18
- Vite 5

## Repository layout

- `frontend/` — React/Vite UI and presentation logic.
- `juce/` — native JUCE host and future filesystem/audio backend.
- `docs/` — roadmap, architecture notes and stage plans.
- `AGENTS.md` — UI/UX behaviour contract.
- `CONTEXT.md` — current project context and decisions.
- `PROJECT_STRUCTURE.md` — detailed repository structure.

## Build frontend

```bash
cd frontend
npm install
npm run build
```

Development mode for browser UI:

```bash
cd frontend
npm run dev
```

## Build JUCE application

The JUCE project is in `juce/`.

`juce/BUILD_JUCE.bat` configures and builds the Debug application using the local JUCE installation and the prepared WebView2 SDK.

The local build output is:

```text
juce/build/
```

This directory is intentionally excluded from Git.

## WebView2 SDK

The current development machine uses a locally prepared Microsoft.Web.WebView2 SDK. The project CMake configuration points JUCE's `FindWebView2.cmake` at the local SDK location.

The SDK itself is not stored in this repository.

## Current native/UI boundary

React is responsible for:

- UI rendering;
- selection and interaction state;
- Settings UI;
- search/filter presentation;
- current mock library data;
- waveform presentation.

JUCE will progressively take responsibility for:

- native folder picker;
- filesystem scanning;
- real library/index;
- audio playback;
- waveform generation/cache;
- audio devices and ASIO;
- MIDI;
- metadata/tags;
- native drag & drop;
- VST3 hosting.

## Roadmap

Next milestone:

**Stage 11 — Native Folder Picker**

The first native backend task is to connect the existing `Open Folder` UI action to a real native Windows folder picker, return the selected absolute path to the application, and keep the React UI visually unchanged.

See `docs/ROADMAP.md` and `docs/08_NATIVE_INTEGRATION/PLAN.md` for the full sequence of native integration stages.
