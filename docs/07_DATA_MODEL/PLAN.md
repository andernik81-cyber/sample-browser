# Stage 7 — Data model for JUCE bridge

Привести UI state к устойчивой модели данных, пригодной для native backend.

Центральная сущность: `SampleItem`.

Рекомендуемые поля:
`id`, `name`, `path`, `extension`, `lengthSeconds`, `channels`, `sampleRate`, `bitDepth`, `bpm`, `key`, `tags`, `rating`, `fileSize`, `modifiedTime`, `metadataState`, `waveformState`.

Отдельные runtime objects:
- `audioDeviceState`
- `midiState`
- `transportState`
- `loadingState`

UI state должен отличаться от backend state. Все IDs стабильные. Null/unknown допустимы.

Подготовить adapter boundary для будущего `window.__JUCE__.backend` / JUCE frontend helper, но не подключать C++ сейчас.