# JUCE Source

Будущие C++ исходники приложения будут находиться здесь.

Планируемое разделение:

- `Main.cpp` / application bootstrap
- `MainComponent.*` / окно приложения
- `WebViewUI.*` / JUCE WebView
- `JuceBridge.*` / JavaScript ↔ C++ API
- `AudioEngine.*` / playback и audio processing
- `AudioDeviceManager.*` / audio device state и ASIO
- `MidiManager.*` / MIDI devices и messages
- `SampleFileManager.*` / filesystem и sample files
- `MetadataScanner.*` / metadata extraction
- `SampleDatabase.*` / indexing и cache
- `WaveformCache.*` / waveform data
- `SettingsManager.*` / persistent preferences

Не добавлять C++ только для создания структуры. Реализация начинается отдельным этапом после подготовки frontend.