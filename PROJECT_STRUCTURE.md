# Sample Browser — структура проекта

## Назначение

Этот репозиторий разделён на три логические части:

- `frontend/` — текущий React/Vite интерфейс sample browser.
- `juce/` — будущая native-часть приложения на JUCE 9.0.2 + CMake.
- `docs/` — планы, промты и правила для поэтапного вайбкодинга интерфейса и последующего внедрения JUCE backend.

На текущем этапе реальный audio engine, ASIO, MIDI, файловый backend и metadata scanner здесь не реализуются. Сначала стабилизируется frontend и его UI/state-контракты.

## Структура

```text
sample-browser/
│
├── frontend/
│   ├── index.html              # HTML entry point React-приложения
│   ├── package.json            # зависимости и npm scripts frontend
│   ├── package-lock.json       # зафиксированные версии npm-зависимостей
│   ├── vite.config.js          # конфигурация Vite
│   └── src/
│       ├── App.jsx             # основной UI и текущая логика прототипа
│       ├── main.jsx            # точка входа React
│       └── styles.css          # визуальная система и layout
│
├── juce/
│   ├── README.md               # назначение будущей native части
│   └── Source/
│       └── README.md            # место для будущих C++ файлов
│
├── docs/
│   ├── ROADMAP.md              # общий порядок этапов
│   ├── FINAL_CHECKLIST.md      # финальная проверка готовности UI
│   ├── 00_GLOBAL/              # общие правила для нейросети
│   ├── 01_SETTINGS/            # Settings / Preferences
│   ├── 02_AUDIO_DEVICE/        # Audio Device status
│   ├── 03_MIDI/                # MIDI status
│   ├── 04_TRANSPORT/           # transport state и time display
│   ├── 05_METADATA/            # metadata panel и расширяемые поля
│   ├── 06_LOADING/             # loading / scanning states
│   └── 07_DATA_MODEL/          # модель Sample/File для JUCE bridge
│
├── AGENTS.md                   # основной контракт поведения UI
├── CONTEXT.md                  # текущее состояние и решения проекта
├── README.md                   # краткое описание проекта
└── PROJECT_STRUCTURE.md        # этот файл
```

## Что где изменять

### `frontend/`

Здесь сейчас находится весь рабочий UI.

Изменения интерфейса выполняются здесь. На подготовительном этапе не переносить сюда C++ и не реализовывать здесь ASIO/MIDI/audio engine.

Запуск frontend:

```bash
cd frontend
npm install
npm run dev
```

Сборка для проверки:

```bash
cd frontend
npm run build
```

После каждого UI-этапа сборка должна оставаться рабочей.

### `juce/`

Это зарезервированное место для будущего native приложения.

Планируемые подсистемы:

- JUCE 9.0.2
- CMake
- WebView2 / `juce::WebBrowserComponent`
- Audio device management
- ASIO
- MIDI
- audio playback
- filesystem access
- metadata scanning
- sample database / cache
- waveform generation
- React ↔ C++ bridge

Пока не размещать здесь незаконченный C++ код только ради создания файлов.

### `docs/`

Каждый этап UI имеет отдельные:

- `PLAN.md` — что должно быть сделано;
- `PROMPT.md` — готовое задание для нейросети;
- `AGENTS.md` — ограничения конкретного этапа.

Работать с этапами строго по порядку, начиная с `01_SETTINGS`.

## Архитектурная граница

Будущая архитектура:

```text
React UI (frontend/)
        │
        │ JUCE WebView bridge
        ▼
JUCE C++ (juce/)
        │
        ├── Audio Engine
        ├── ASIO
        ├── MIDI
        ├── Filesystem
        ├── Metadata
        ├── Database / Cache
        └── Playback
```

React отвечает за визуальное представление и UI state. JUCE отвечает за настоящие native/audio операции.

## Важное правило

Не переделывать существующий дизайн на JUCE Widgets только ради native UI. Цель проекта — использовать существующий React интерфейс внутри JUCE WebView и постепенно заменить mock/test data на данные от C++ backend.
