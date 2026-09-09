# Stage 11–21 — Native Integration Plan

Этот документ описывает последовательность превращения текущего React/WebView2 прототипа в полноценный Windows sample browser.

## Общий принцип

Не делать один большой переход от mock UI к огромному C++ backend.

Каждый этап должен добавлять одну законченно проверяемую native capability и оставлять предыдущие функции рабочими.

Архитектура:

```text
React UI
  │
  │ thin bridge
  ▼
JUCE C++
  ├── Windows / Filesystem
  ├── Library / Index
  ├── Audio Engine
  ├── ASIO
  ├── MIDI
  ├── Metadata
  ├── Waveform Cache
  └── VST3
```

React остаётся presentation layer. Native layer выполняет реальные OS/audio операции.

---

# Stage 11 — Native Folder Picker

## Цель

Заменить browser-only `webkitdirectory` folder selection на настоящий native Windows folder picker.

## Поведение

```text
Open Folder
    ↓
React command
    ↓
JUCE native folder picker
    ↓
absolute path
    ↓
application state
```

## Что реализовать

- native folder dialog через JUCE;
- возврат абсолютного пути выбранной папки;
- cancellation без изменения текущего состояния;
- проверку существования выбранной директории;
- thin React ↔ C++ command/result boundary.

## Что НЕ реализовывать

- recursive scanning;
- database;
- metadata extraction;
- playback.

## Acceptance test

Выбрать реальную папку Windows и убедиться, что C++ получает корректный абсолютный путь. React UI визуально не должен быть переделан.

---

# Stage 12 — Native Filesystem Scanner

## Цель

Получить реальное дерево папок и список аудиофайлов.

## Rules

- сканировать выбранную библиотеку рекурсивно;
- проходить все вложенные папки;
- не ограничивать глубину заранее;
- Folder Tree содержит только папки;
- File Table показывает файлы выбранной папки;
- поддержать реальные absolute paths;
- отсекать неподдерживаемые/временные файлы;
- корректно обрабатывать inaccessible/offline directories.

## Formats

Начать с поддерживаемых JUCE/decoder formats, необходимых проекту, прежде всего WAV/AIFF/FLAC. Список окончательно зафиксировать перед реализацией.

## Concurrency

Сканирование должно выполняться не в message thread UI.

UI должен получать progress/state events, например:

```text
Idle
Scanning
Ready
Error
Offline
```

## Acceptance test

Выбрать папку с несколькими уровнями вложенности и убедиться, что всё дерево построено, а File Table показывает только файлы текущей папки.

---

# Stage 13 — JUCE ↔ React Bridge

## Цель

Создать маленький, стабильный API обмена между WebView и C++.

## Направления

### React → C++

- choose folder;
- select sample;
- play;
- stop;
- seek;
- request rescan;
- audio settings changes.

### C++ → React

- library state;
- folders/files;
- selection;
- loading/scanning state;
- playback state;
- device state;
- metadata;
- waveform data.

## Rule

Bridge не содержит бизнес-логику файловой системы или audio engine. Он только адаптирует commands/events/data.

## Acceptance test

Каждая команда имеет определённый payload, обработчик и понятный success/error result.

---

# Stage 14 — Real Library Model / Index

## Цель

Заменить `INITIAL_TREE` / `INITIAL_FILES` реальной библиотекой.

## Data model

Каждая Folder/Sample запись должна иметь стабильный ID и native path. Для sample предусмотреть поля, необходимые будущим этапам:

- id;
- path;
- name;
- folderId;
- duration;
- file size;
- status;
- waveformState;
- metadata fields;
- timestamps as needed.

## Indexing policy

- полный recursive scan запускается после добавления/изменения library location;
- выбранная пользователем папка получает приоритет по готовности данных;
- фоновой индекс не должен блокировать UI;
- изменения отдельных files/folders должны обновляться инкрементально, где это имеет смысл.

## Persistence

Тип storage (SQLite/другая БД/файловый индекс) определить после оценки объёма библиотек, startup time и update cost. Не выбирать БД только ради усложнения архитектуры.

---

# Stage 15 — Real Audio Playback

## Цель

Первый настоящий аудиосигнал из Sample Browser.

## Pipeline

```text
selected sample path
      ↓
native decoder
      ↓
audio engine
      ↓
audio device
      ↓
output
```

## Features

- play;
- stop;
- pause only if explicitly added later;
- seek;
- duration;
- current position;
- sample switching;
- Auto Play;
- playback ended state.

## Rule

Web Audio API не использовать как production backend.

## Acceptance test

Выбрать WAV и услышать реальный звук через выбранное аудиоустройство. React controls должны отражать native playback state.

---

# Stage 16 — Waveform Generation + Cache

## Цель

Заменить псевдослучайную React waveform на реальную waveform data.

## Pipeline

```text
audio file
   ↓
decode / analyse
   ↓
reduced waveform representation
   ↓
cache
   ↓
React waveform
```

## Rules

- тяжёлая обработка не должна блокировать UI;
- кэшировать результат;
- иметь состояния `notReady / processing / ready / error`;
- для выбранного sample waveform готовится с высоким приоритетом.

---

# Stage 17 — Audio Device + ASIO

## Цель

Подключить существующие Audio Settings к реальному native audio device state.

## Parameters

- driver type;
- device;
- sample rate;
- buffer size;
- output channels.

## Rule

React только отображает состояние и отправляет commands. Открытие device и ASIO выполняется native side.

## Acceptance test

Переключение реального устройства и buffer size отражается в UI и не приводит к зависанию/крашу.

---

# Stage 18 — MIDI

## Цель

Подключить native MIDI enumeration и application-level MIDI support, если оно требуется интерфейсу.

## First step

Сначала:

- enumerate input/output devices;
- status;
- connect/disconnect state.

Далее добавлять только реально нужные MIDI features.

Web MIDI API не использовать как production backend.

---

# Stage 19 — Metadata / Tags / Search

## Metadata

Добавить реальные поля:

- BPM;
- Key / Tonality;
- Tags;
- Rating;
- Date;
- Size;
- Path;
- duration и другие необходимые технические свойства.

## Search

Разделить:

- text search;
- folder filtering;
- tag search;
- tag-tree navigation.

Search/filter state остаётся в UI, но реальные searchable records приходят из native library/index.

## Acceptance test

После сканирования metadata появляется в Preview/Metadata area, а поиск по tags/filter возвращает реальные файлы.

---

# Stage 20 — Native Explorer / REAPER Drag & Drop

## Цель

Интеграция с Windows Explorer и DAW workflow.

## Features

- drag sample out of browser;
- drop into Explorer where appropriate;
- drop into REAPER;
- preserve correct native paths;
- distinguish click from drag using the existing interaction contract;
- no playback triggered by drag start.

---

# Stage 21 — VST3 Hosting

## Цель

Добавить VST3 hosting после стабилизации основных library/playback workflows.

## Principles

- отдельная native subsystem;
- не смешивать plugin lifecycle с library scanning;
- не блокировать message thread during plugin load;
- обеспечить clean unload/error states;
- UI bridge только передаёт команды и состояния.

---

# Dependency order

```text
11 Folder Picker
       ↓
12 Scanner
       ↓
13 Bridge
       ↓
14 Real Library / Index
       ↓
15 Playback
       ↓
16 Waveform Cache
       ↓
17 Audio Device / ASIO
       ↓
18 MIDI
       ↓
19 Metadata / Tags / Search
       ↓
20 Explorer / REAPER Drag & Drop
       ↓
21 VST3 Hosting
```

Это порядок реализации, а не обязательный порядок каждого внутреннего кода. Отдельные технические подзадачи могут подготавливаться заранее только при отсутствии риска преждевременного усложнения.

# Global acceptance rules

Каждый этап должен:

1. иметь короткий план до правки;
2. изменять минимальное количество файлов;
3. сохранять существующий UI, кроме явной необходимости;
4. сохранять frontend build;
5. сохранять JUCE build;
6. иметь ручной runtime test, если затрагивается GUI/audio/filesystem;
7. не добавлять будущие функции преждевременно;
8. не коммитить build output или SDK;
9. документировать реальные результаты тестов;
10. не заявлять о работоспособности того, что фактически не проверено.

# Immediate next task

**Stage 11 — Native Folder Picker.**

Первый рабочий результат должен быть очень маленьким: кнопка `Open Folder` из существующего React UI вызывает native Windows folder picker, C++ получает выбранный absolute path, а UI остаётся визуально неизменным.

После успешной проверки только этого шага можно переходить к recursive scanner.