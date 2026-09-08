# Prompt — Stage 3 MIDI

Прочитай корневые `AGENTS.md`, `CONTEXT.md` и предыдущие этапы.

Добавь MIDI status indicator в header. Состояния: No MIDI, Ready, Input Activity, Error. Сделай понятный, ненавязчивый визуальный activity indicator.

Все данные пока mock. Не реализуй MIDI API, WinMM, DirectMusic, RtMidi или JUCE MIDI. Предусмотри объект состояния, который позже сможет приходить от C++ через JUCE WebView native events.

Сохрани текущий дизайн. Проверить `npm run build`.