# Stage 2 — Audio Device status

Добавить компактный status indicator в header.

UI states: `No Device`, `Initializing`, `Ready`, `Error`.

Подготовить отображение:
`Audio: ASIO • Device Name • 44.1 kHz • 128`
и компактный вариант для узкой ширины.

Значения mock. Реальное устройство, sample rate, buffer size и ASIO selection позже приходят из JUCE.