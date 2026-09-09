# Sample Browser — Project Context

**Обновлено:** 10 сентября 2026 г.
**Текущее состояние:** Stage 10 завершён; React UI встроен в JUCE 9.0.2 Windows-приложение через WebView2.

## 1. Что это

Sample Browser — desktop sample browser для Windows для просмотра, поиска и предпрослушивания аудиофайлов и sample packs.

Текущий UI состоит из:

- Folder Tree слева;
- File Table по центру;
- waveform/playback panel снизу;
- header и Settings panel.

Интерфейс реализован на React/Vite и сейчас работает на mock-данных.

## 2. Текущая архитектура

```text
React/Vite UI
      ↓
frontend/dist
      ↓
JUCE ResourceProvider
      ↓
https://juce.backend/
      ↓
juce::WebBrowserComponent
      ↓
WebView2
      ↓
Sample Browser.exe
```

JUCE является native host. React остаётся presentation/UI layer.

## 3. Stage 10 — завершено

Выполнено:

- JUCE 9.0.2 + CMake native project;
- WebView2 Runtime установлен;
- Microsoft.Web.WebView2 SDK подготовлен локально;
- `JUCE_USE_WIN_WEBVIEW2=1`;
- `JUCE_USE_WIN_WEBVIEW2_WITH_STATIC_LINKING=1`;
- `juce::juce_webview2` подключён;
- `juce::WebBrowserComponent` использует backend `webview2`;
- `ResourceProvider` обслуживает `frontend/dist`;
- root URL — `https://juce.backend/`;
- Vite использует `base: './'`;
- frontend production build успешно создаётся;
- React UI работает внутри собранного `.exe`;
- WebView занимает всю область `MainComponent`;
- build directory `juce/build/` исключён из Git.

## 4. Frontend

Основная структура:

```text
frontend/
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── dist/
└── src/
    ├── main.jsx
    ├── AppUnified.jsx
    ├── styles.css
    ├── components/
    │   └── AppHeader.jsx
    ├── features/
    │   ├── settings/
    │   └── library/
    ├── models/
    │   └── sampleModel.js
    └── utils/
        └── formatters.js
```

React уже содержит:

- Folder Tree;
- File Table;
- sorting;
- selection;
- keyboard navigation;
- waveform presentation;
- playback mock;
- Auto Play state;
- Settings;
- Audio settings mock;
- Library settings mock;
- loading/scanning UI state;
- unified Sample/Folder model.

## 5. Native JUCE

Основные файлы:

```text
juce/
├── CMakeLists.txt
├── BUILD_JUCE.bat
└── Source/
    ├── Main.cpp
    ├── MainComponent.cpp
    └── MainComponent.h
```

`Main.cpp` создаёт `JUCEApplication` и `DocumentWindow`.

`MainComponent` размещает WebView и отдаёт ему весь available bounds.

`MainComponent.cpp` содержит ResourceProvider, который безопасно отдаёт файлы только из `frontend/dist`.

## 6. Что пока является mock

Пока не подключены реальные native данные/операции:

- выбранные папки;
- recursive filesystem scan;
- library index/database;
- реальные audio files в File Table;
- native playback;
- ASIO/device control;
- MIDI devices;
- waveform generation;
- metadata extraction;
- tag database/search;
- native drag & drop;
- VST3 hosting.

## 7. Архитектурные решения

### React

React отвечает за presentation и UI state. Он не должен становиться местом реализации native filesystem, ASIO или production audio engine.

### JUCE

JUCE отвечает за native OS operations, filesystem, scanning, audio, ASIO, MIDI, metadata, cache и VST3.

### Bridge

JS ↔ C++ bridge должен быть тонким API между этими слоями. Bridge ещё не реализован и будет отдельным этапом.

### Audio

Не использовать Web Audio API как production audio engine.

### MIDI

Не использовать Web MIDI API как production MIDI backend.

## 8. UI/UX rules

Подробный действующий контракт поведения хранится в `AGENTS.md`.

Ключевые принципы:

- hover не выполняет действий;
- click и drag различаются по threshold;
- selection и playback state не должны конфликтовать;
- Folder Tree показывает только папки;
- File Table показывает файлы выбранной папки;
- waveform остаётся отдельной нижней панелью;
- UI не переделывать на JUCE Widgets только ради native integration.

## 9. Следующий этап

**Stage 11 — Native Folder Picker.**

Цель первого native backend этапа:

```text
Open Folder
    ↓
React → C++ command
    ↓
JUCE native Windows folder picker
    ↓
real absolute path
    ↓
C++ application state
```

На Stage 11 не выполнять полный filesystem scan. Сначала нужен надёжный native folder selection и bridge command.

## 10. Полный порядок native development

1. Stage 11 — Native Folder Picker.
2. Stage 12 — Native Filesystem Scanner.
3. Stage 13 — JUCE ↔ React bridge.
4. Stage 14 — Real Library Model / Index.
5. Stage 15 — Real Audio Playback.
6. Stage 16 — Waveform Generation and Cache.
7. Stage 17 — Audio Device / ASIO.
8. Stage 18 — MIDI.
9. Stage 19 — Metadata / Tags / Search.
10. Stage 20 — Explorer / REAPER Drag & Drop.
11. Stage 21 — VST3 Hosting.

## 11. Development rules

1. Перед сложной правкой сначала составляется план.
2. Каждая native feature реализуется отдельным этапом.
3. После каждого этапа должен проходить frontend build и native build.
4. Не менять визуальный UI без явной необходимости.
5. Не удалять существующий рабочий функционал без отдельного решения.
6. Не коммитить build output.
7. Не коммитить WebView2 SDK.
8. Все backend-facing features должны иметь явную adapter/bridge boundary.
