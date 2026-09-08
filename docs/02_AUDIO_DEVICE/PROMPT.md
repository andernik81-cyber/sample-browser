# Prompt — Stage 2 Audio Device

Прочитай корневые `AGENTS.md`, `CONTEXT.md` и `docs/01_SETTINGS/*`.

Добавь в существующий header компактный Audio Device status indicator. Предусмотри состояния No Device, Initializing, Ready, Error. В Ready отображай backend, device, sample rate и buffer size. Сделай responsive/compact state для узкого окна.

Пока используй mock data. Не добавляй ASIO API, AudioDeviceManager или Web Audio. UI должен быть готов получать объект состояния от JUCE позже.

Не ломай существующий layout. Проверить `npm run build`.