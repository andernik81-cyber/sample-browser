# Sample Browser — Roadmap

Цель проекта: desktop sample browser для Windows с современным React-интерфейсом внутри JUCE 9.0.2 и с постепенной заменой mock-данных на настоящий native/audio backend.

## Current status

**Stage 10 завершён.** Существующий React UI встроен в JUCE-приложение через WebView2 и ResourceProvider. Приложение собирается и вручную проверено запуском `.exe`.

Текущая архитектура:

```text
React/Vite UI
    ↓ production build
frontend/dist
    ↓ JUCE ResourceProvider
https://juce.backend/
    ↓
juce::WebBrowserComponent
    ↓ WebView2
Sample Browser.exe
```

React пока работает на mock-данных. Нативный filesystem/audio backend ещё не подключён.

## Completed stages

### Stages 01–07 — UI preparation

Завершены подготовительные этапы:

1. `01_SETTINGS` — Settings / Preferences shell.
2. `02_AUDIO_DEVICE` — подготовка Audio Device state.
3. `03_MIDI` — подготовка MIDI state.
4. `04_TRANSPORT` — transport state и time display.
5. `05_METADATA` — подготовка metadata panel.
6. `06_LOADING` — loading/scanning states.
7. `07_DATA_MODEL` — единая модель Sample/Folder для будущего native backend.

### Stage 09 — JUCE foundation

Создан native Windows-проект:

- JUCE 9.0.2;
- CMake;
- Visual Studio 2026 / MSVC;
- `juce::juce_gui_extra`;
- рабочая Debug-сборка.

### Stage 10 — React inside JUCE WebView2

Завершено.

Реализовано:

- WebView2 SDK подключён через CMake;
- WebView2 Runtime установлен в Windows;
- `juce::WebBrowserComponent` использует backend `webview2`;
- `ResourceProvider` отдаёт `frontend/dist` через `https://juce.backend/`;
- Vite использует `base: './'`;
- приложение работает без localhost и без Vite dev server;
- существующий React UI отображается внутри `.exe`;
- build output `juce/build/` исключён из Git.

## Next development stages

### Stage 11 — Native Folder Picker

Цель: существующая кнопка `Open Folder` должна открывать настоящий native Windows folder picker.

Результат:

```text
React: Open Folder
      ↓
JUCE native folder dialog
      ↓
реальный абсолютный путь
      ↓
C++ backend
```

На этом этапе ещё не выполнять полный recursive scan.

### Stage 12 — Native Filesystem Scanner

Цель: рекурсивно сканировать выбранную библиотеку и все вложенные папки.

Поддержать минимум:

- WAV;
- AIFF/AIF;
- FLAC;
- другие форматы только после отдельного решения.

Результат должен содержать Folder/Sample records с реальными absolute paths.

Правила:

- сканируются все вложенные директории;
- папки без доступных файлов всё равно могут существовать в дереве;
- offline/unavailable locations сохраняются как `Offline`;
- UI текущей выбранной папки получает приоритет;
- полный индекс может продолжать строиться в фоне.

### Stage 13 — JUCE ↔ React bridge

Создать тонкий и стабильный bridge между C++ и React.

Bridge должен передавать:

- выбранную папку;
- список folders/files;
- selection state;
- scanning/loading state;
- playback state;
- metadata;
- waveform state.

Не помещать audio/filesystem implementation внутрь React.

### Stage 14 — Real Library Model / Index

Заменить mock `INITIAL_TREE` / `INITIAL_FILES` реальными backend-данными.

Предусмотреть:

- стабильные IDs;
- absolute path;
- folder/file relation;
- status;
- metadata;
- waveform cache state;
- обновление отдельных записей без полного перерендера всей библиотеки.

Формат хранения индекса/БД определить после проверки требований к размеру библиотеки и скорости старта.

### Stage 15 — Real Audio Playback

Подключить native audio engine.

Цели:

- открыть реальный audio file;
- decode;
- playback;
- play/stop;
- seek;
- current position / duration;
- sample switching;
- Auto Play.

Сначала добиться надёжного базового playback без сложных DSP-функций.

### Stage 16 — Waveform Generation and Cache

Заменить mock waveform на реальные данные.

Pipeline:

```text
audio file
   ↓
decode/analyse
   ↓
waveform data
   ↓
cache
   ↓
React waveform
```

Waveform cache должен быть готов к работе в фоне и не блокировать UI.

### Stage 17 — Audio Device / ASIO

Подключить реальные audio device settings:

- driver;
- device;
- sample rate;
- buffer size;
- output routing.

Существующая React Audio Settings становится presentation layer для native audio state.

ASIO реализовать в JUCE/native layer, а не через Web Audio API.

### Stage 18 — MIDI

Подключить native MIDI subsystem.

Сначала статус устройств и enumeration, затем нужные application-level MIDI features.

Не использовать Web MIDI API как production backend.

### Stage 19 — Metadata / Tags / Search

Добавить реальное чтение и хранение:

- BPM;
- Key/Tonality;
- Tags;
- Rating;
- Date;
- Size;
- Path.

Отдельно реализовать:

- tag tree;
- поиск по тегам;
- file search/filter;
- metadata update policy.

### Stage 20 — Explorer / REAPER Drag & Drop

Подключить native drag & drop и работу с Explorer/DAW.

Цели:

- drag sample из browser в Explorer;
- drag sample из browser в REAPER;
- корректные native file paths;
- отсутствие конфликтов между click и drag.

### Stage 21 — VST3 Hosting

После стабилизации library + playback + filesystem реализовать VST3 hosting внутри desktop application.

Эту часть не смешивать с базовым sample scanning/playback pipeline без необходимости.

## Cross-stage rules

1. После каждого этапа приложение должно собираться.
2. Не ломать существующий React UI без явной причины.
3. React отвечает за presentation/UI state.
4. JUCE C++ отвечает за filesystem, audio, ASIO, MIDI, metadata, caching и native OS operations.
5. Bridge должен оставаться тонким и явным.
6. Не использовать Web Audio API как production audio engine.
7. Не использовать Web MIDI API как production MIDI backend.
8. Не добавлять функции раньше этапа, на котором они запланированы.
9. Каждый этап должен иметь отдельную проверку build/runtime.
10. Build output и другие генерируемые файлы не должны попадать в Git.

## Immediate next step

**Stage 11 — Native Folder Picker.**

Первая задача следующего этапа — связать существующую React-кнопку `Open Folder` с native JUCE folder picker, не меняя внешний вид интерфейса и не начиная ещё сканирование файлов.