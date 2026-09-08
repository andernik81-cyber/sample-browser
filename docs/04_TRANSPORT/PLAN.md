# Stage 4 — Transport state

Отделить transport state от визуальных кнопок.

Предусмотреть состояния:
`stopped`, `playing`, `paused`, `loading`, `error`.

Добавить явный time display:
`00:02.230 / 00:05.470`

Подготовить UI/model для реального playback position и duration от JUCE.

Play/Stop/Auto Play должны работать через transport state, а не через разрозненные boolean values.