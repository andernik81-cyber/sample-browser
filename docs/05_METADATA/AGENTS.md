# Agent Rules — Metadata

Metadata is presentation/state only at this stage.

Запрещено реальное filesystem reading, metadata parsing, audio analysis и database.

Все поля должны поддерживать `unknown` / `null` без поломки layout.

Не создавать отдельные источники истины для одного sample. Metadata должна находиться внутри единой sample model или ссылаться на неё.

Tags должны быть готовы к будущему массиву/множеству тегов, а не только к одной строке.