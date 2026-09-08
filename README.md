# Sample Browser

Desktop sample browser for Windows.

## Repository layout

- `frontend/` — текущий React/Vite UI-прототип.
- `juce/` — будущая native-часть на JUCE 9.0.2 + CMake.
- `docs/` — пошаговые планы, промты и AGENTS для подготовки UI и последующего подключения JUCE.
- `PROJECT_STRUCTURE.md` — подробное описание структуры и назначения каждой части проекта.

## Current stage

Сейчас проект находится на этапе подготовки и стабилизации frontend. Интерфейс сохраняется как React-приложение и в дальнейшем будет использоваться внутри JUCE WebView2.

ASIO, MIDI, audio engine, filesystem, metadata scanning и другие native/audio функции реализуются позже в `juce/`, а не внутри React.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Проверка сборки:

```bash
npm run build
```

Начинай работу с UI-этапами в `docs/ROADMAP.md` и выполняй их строго по порядку.