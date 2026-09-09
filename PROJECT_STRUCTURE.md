# Sample Browser — структура проекта

## Назначение

Sample Browser — desktop sample browser для Windows. Проект использует существующий React/Vite UI как presentation layer внутри native-приложения на JUCE 9.0.2.

Текущая граница ответственности:

- `frontend/` — React/Vite UI, UI state и presentation logic;
- `juce/` — native Windows host и будущий filesystem/audio backend;
- `docs/` — планы, контракты и документация по этапам.

## Текущее состояние

**Stage 10 завершён:** React production build встроен в JUCE 9.0.2 через `juce::WebBrowserComponent`, WebView2 и `ResourceProvider`.

Приложение уже запускается как Windows `.exe` и показывает существующий React Sample Browser UI.

Native filesystem, scanner, real playback, ASIO, MIDI, metadata и VST3 ещё не реализованы.

## Структура

```text
sample-browser/
│
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   ├── dist/                    # production build для embedded WebView
│   └── src/
│       ├── main.jsx
│       ├── AppUnified.jsx
│       ├── styles.css
│       ├── components/
│       │   └── AppHeader.jsx
│       ├── features/
│       │   ├── settings/
│       │   └── library/
│       ├── models/
│       │   └── sampleModel.js
│       └── utils/
│           └── formatters.js
│
├── juce/
│   ├── CMakeLists.txt
│   ├── BUILD_JUCE.bat
│   ├── README.md
│   ├── README_STAGE9.md
│   └── Source/
│       ├── Main.cpp
│       ├── MainComponent.cpp
│       ├── MainComponent.h
│       └── README.md
│
├── docs/
│   ├── ROADMAP.md
│   ├── FINAL_CHECKLIST.md
│   ├── 00_GLOBAL/
│   ├── 01_SETTINGS/
│   ├── 02_AUDIO_DEVICE/
│   ├── 03_MIDI/
│   ├── 04_TRANSPORT/
│   ├── 05_METADATA/
│   ├── 06_LOADING/
│   ├── 07_DATA_MODEL/
│   └── 08_NATIVE_INTEGRATION/
│       └── PLAN.md
│
├── AGENTS.md
├── CONTEXT.md
├── README.md
└── PROJECT_STRUCTURE.md
```

`juce/build/` является локальным build output и исключён из Git.

## `frontend/`

React отвечает за:

- отображение Folder Tree;
- File Table;
- waveform presentation;
- Settings UI;
- selection state;
- search/filter UI;
- UI playback state;
- mock data до подключения native backend.

Production build:

```text
cd frontend
npm run build
```

Vite использует `base: './'`, чтобы compiled frontend мог обслуживаться embedded ResourceProvider.

## `juce/`

JUCE native layer использует:

- JUCE 9.0.2;
- CMake;
- Visual Studio/MSVC;
- `juce::WebBrowserComponent`;
- Windows WebView2;
- `WebBrowserComponent::ResourceProvider`.

Сейчас native host уже загружает `frontend/dist` через:

```text
https://juce.backend/
```

Следующие native подсистемы будут добавляться поэтапно:

1. native folder picker;
2. filesystem scanner;
3. React ↔ C++ bridge;
4. real library index;
5. audio playback;
6. waveform generation/cache;
7. audio device/ASIO;
8. MIDI;
9. metadata/tags/search;
10. Explorer/REAPER drag & drop;
11. VST3 hosting.

## Архитектура

```text
                         Sample Browser.exe
                                │
                        JUCE 9.0.2 host
                                │
                         WebBrowserComponent
                                │
                             WebView2
                                │
                       ResourceProvider
                                │
                         frontend/dist
                                │
                           React UI
                                │
                    future JUCE ↔ React bridge
                                │
             ┌──────────────────┴──────────────────┐
             │                                     │
       Filesystem backend                    Audio backend
             │                                     │
      scanner / library                    playback / ASIO
      metadata / tags                         waveform
      native file paths                         MIDI
```

## Архитектурное правило

React не должен становиться местом реализации native/audio функций.

JUCE C++ отвечает за:

- filesystem;
- native OS dialogs;
- scanning;
- audio engine;
- ASIO;
- MIDI;
- metadata;
- database/cache;
- native drag & drop;
- VST3 hosting.

Bridge должен только передавать данные и команды между UI и native layer.

## Что не нужно коммитить

Не добавлять в Git:

- `juce/build/`;
- `.pdb`;
- `.obj`;
- `.lib`, сгенерированные build system;
- Visual Studio intermediate files;
- другие временные build artifacts.

Не коммитить сам WebView2 SDK внутрь репозитория. Локальный путь SDK задаётся в native build configuration.
