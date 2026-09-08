# JUCE Native Application

Папка зарезервирована под будущую native часть Sample Browser.

Целевая технология:

- JUCE 9.0.2
- CMake
- C++
- Windows
- WebView2 через `juce::WebBrowserComponent`

Планируемые подсистемы:

- Audio device management
- ASIO
- MIDI
- audio playback
- filesystem
- metadata scanner
- sample database / cache
- waveform generation
- React ↔ C++ bridge
- Settings / Preferences persistence

На текущем этапе здесь только документация и место под исходники. Native backend добавляется после подготовки и стабилизации frontend.