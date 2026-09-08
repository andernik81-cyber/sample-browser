# Prompt — Stage 1 Settings

Ты работаешь в существующем React/Vite sample-browser. Прочитай `AGENTS.md` и `CONTEXT.md` перед изменениями.

Задача: добавить только Settings / Preferences UI.

Добавь кнопку Settings в существующий header и отдельную панель Preferences. Предусмотри секции Audio, MIDI, Interface и Shortcuts. Данные пока mock/local state. Архитектура должна позволять позже заменить local state на вызовы JUCE native functions через WebBrowserComponent.

Не реализуй audio engine, ASIO, MIDI I/O, Web Audio API, filesystem backend или реальные device enumeration.

Не переделывай существующий UI. Не меняй существующие размеры, цвета, typography и interaction behavior, кроме мест, необходимых для новой функции.

После изменения проверь `npm run build`. В конце кратко перечисли изменённые файлы и точки будущего подключения C++ backend.