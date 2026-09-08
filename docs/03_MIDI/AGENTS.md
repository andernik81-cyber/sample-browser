# Agent Rules — MIDI

Работать только с presentation/state model MIDI status.

Запрещено реализовывать реальный MIDI I/O.
Не использовать Web MIDI API как backend.
Не создавать MIDI device manager в React.

Activity state должен быть transient и приходить от backend позже.
Не менять существующие UI contracts.
После работы — `npm run build`.