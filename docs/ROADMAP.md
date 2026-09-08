# UI Preparation Roadmap

Цель: поэтапно подготовить существующий React UI к внедрению в JUCE 9.0.2 + CMake + WebView2, не ломая текущий внешний вид и поведение.

## Порядок работы

1. 01_SETTINGS — Settings / Preferences shell
2. 02_AUDIO_DEVICE — Audio Device status indicator
3. 03_MIDI — MIDI status indicator
4. 04_TRANSPORT — отдельная transport-state модель и time display
5. 05_METADATA — расширяемая Metadata panel
6. 06_LOADING — loading / scanning states
7. 07_DATA_MODEL — единая модель Sample/File для будущего JUCE backend

После каждого этапа приложение должно продолжать собираться через `npm run build` и выглядеть так же, кроме явно добавленных элементов.

## Архитектурное правило

React отвечает за UI/state presentation. JUCE C++ позже отвечает за filesystem, audio engine, ASIO, MIDI, metadata scanning, playback, database/cache и native OS operations.

Не использовать Web Audio API как будущий audio engine. Не пытаться реализовать ASIO/MIDI внутри браузерного слоя.

## Финальный результат

Интерфейс должен иметь стабильные UI-контракты, через которые JUCE сможет передавать:
- audio device state;
- MIDI state;
- transport state;
- current/total playback time;
- sample metadata;
- scanning/loading progress;
- sample data и selection state.

См. также `FINAL_CHECKLIST.md`.