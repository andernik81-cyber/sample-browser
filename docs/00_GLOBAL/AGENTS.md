# Global Agent Instructions — UI preparation for JUCE

## Mission

Подготавливать существующий sample-browser UI к переносу в desktop application на JUCE 9.0.2 + CMake + Windows WebView2.

## Architecture

React/Vite/WebView = presentation layer.
JUCE/C++ = native backend.

Будущий backend выполняет filesystem, audio decoding/playback, ASIO/device management, MIDI, metadata scanning, indexing/database/cache и OS integration.

## Hard rules

1. Не реализовывать настоящий ASIO/MIDI/audio engine внутри React.
2. Не использовать Web Audio API как production audio backend.
3. Не использовать Web MIDI API как production MIDI backend.
4. Не читать реальные аудиофайлы для mock UI stages.
5. Не менять существующий дизайн и UX без прямой необходимости этапа.
6. Не делать большой rewrite всего `App.jsx`, если задача локальная.
7. После каждого этапа запускать `npm run build`.
8. Сохранять стабильные IDs и backend-friendly data shapes.
9. Разделять presentation state и native/backend state.
10. Любой будущий native bridge должен быть изолирован adapter/service boundary.

## JUCE bridge target

Будущий frontend должен работать через контролируемый boundary, совместимый с JUCE `WebBrowserComponent` native integration. Не хардкодить браузерные URLs и не делать UI зависимым от dev server.

## Workflow

Работать строго по `docs/ROADMAP.md`. Один stage за раз. Не брать следующий этап, пока текущий build не проходит.

В ответе после работы указывать:
- изменённые файлы;
- что добавлено;
- что намеренно НЕ реализовано;
- результат build;
- будущую точку подключения JUCE.
