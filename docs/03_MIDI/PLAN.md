# Stage 3 — MIDI status

Добавить MIDI status indicator в header рядом с Audio status.

Предусмотреть состояния:
`No MIDI`, `Ready`, `Input Activity`, `Error`.

Нужен небольшой activity flash/indicator для входящего MIDI event, но пока mock.

UI должен быть готов к данным от JUCE MIDI manager.