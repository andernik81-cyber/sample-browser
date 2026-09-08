# Prompt — Stage 7 Data Model

Сделай последний UI-only refactor перед JUCE. Создай единые модели `SampleItem`, `AudioDeviceState`, `MidiState`, `TransportState`, `LoadingState` и Metadata.

Стабильный `SampleItem`: id, name, path, extension, lengthSeconds, channels, sampleRate, bitDepth, bpm, key, tags, rating, fileSize, modifiedTime, metadataState, waveformState.

Не добавляй C++ и не реализуй native API. Создай один адаптер/границу для backend, чтобы позже можно было подключить JUCE WebBrowserComponent native functions/events без переписывания компонентов UI.

Удали дублирующие источники истины, если они появились на предыдущих этапах. Сохрани текущее поведение. Проверь build.