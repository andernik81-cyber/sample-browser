# Stage 5 — Metadata panel

Подготовить отдельную expandable Metadata panel для выбранного sample.

Минимальные поля модели и UI:
- BPM
- Key
- Tags
- Rating
- Date
- Size
- Path

Поля могут быть `unknown`/empty. Не делать реальное чтение metadata.

Panel должна быть расширяемой, чтобы позже добавить codec, bit depth, sample rate, channels и другие свойства.