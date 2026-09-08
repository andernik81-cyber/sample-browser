# Agent Rules — Audio Device

Только UI/status layer. Не реализовывать audio backend.

Разрешено: компоненты, CSS, mock state, adapter interface.
Запрещено: ASIO SDK calls, JUCE audio classes, Web Audio, real device enumeration.

Не менять существующие interaction contracts. Состояния должны быть явно представлены и расширяемы. Build обязателен.