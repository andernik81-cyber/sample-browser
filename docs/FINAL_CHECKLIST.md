# Final UI Preparation Checklist

Перед началом JUCE/CMake integration проверь:

- [ ] Settings / Preferences есть и имеет стабильные sections.
- [ ] Audio Device status отделён от audio engine implementation.
- [ ] MIDI status отделён от MIDI implementation.
- [ ] Есть единый transportState.
- [ ] Есть position/duration display `00:02.230 / 00:05.470`.
- [ ] Waveform UI готов принимать реальные данные и position из backend.
- [ ] Есть Metadata panel: BPM, Key, Tags, Rating, Date, Size, Path.
- [ ] Loading/scanning states и progress существуют.
- [ ] Sample model имеет path, metadata и runtime-friendly IDs.
- [ ] Search/filter state не смешан с filesystem implementation.
- [ ] Нет Web Audio API как production backend.
- [ ] Нет Web MIDI API как production backend.
- [ ] Все новые backend-facing features имеют adapter boundary.
- [ ] `npm run build` проходит.

После этого можно начинать JUCE 9.0.2 + CMake + WebView2 integration и подключать C++ backend по одному контракту за раз.