# Agent Rules — Data Model

Это архитектурный этап, не audio implementation.

Использовать стабильные IDs, явные null/unknown states и один source of truth.

Не превращать backend payload в DOM-specific structure.

`lengthSeconds` и playback position хранить числами, форматировать только на UI.

Tags — массив/коллекция. Rating — numeric/nullable. Date/modifiedTime — стандартный машинно-читаемый формат.

Не использовать Web Audio, Web MIDI или browser filesystem как будущий production backend.

После рефакторинга обязательно проверить `npm run build`.