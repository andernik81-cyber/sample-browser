# Prompt — Stage 4 Transport

Изучи все предыдущие этапы. Рефакторинг должен выделить единый `transportState` с state machine: stopped, playing, paused, loading, error. Добавь time display формата `00:02.230 / 00:05.470`.

Раздели UI state и источник времени: React показывает состояние, JUCE позже является источником истины для position/duration/playback.

Не добавляй Web Audio API. Не реализуй реальный decoder/audio engine. Не ломай waveform, Auto Play и keyboard behavior.

Проверь переходы состояний и `npm run build`.