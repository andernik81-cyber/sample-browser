# Frontend

Здесь находится текущий интерфейс Sample Browser.

## Стек

- React 18
- Vite 5
- обычный CSS
- WebView-ready frontend

## Назначение

Frontend отвечает за UI, визуальное состояние и взаимодействие пользователя.

На этом уровне не реализуются:

- ASIO;
- MIDI backend;
- native filesystem operations;
- audio callback;
- realtime DSP;
- настоящий audio engine.

Эти функции в будущем будут предоставлены JUCE C++ через WebView bridge.

## Запуск

```bash
npm install
npm run dev
```

## Проверка

```bash
npm run build
```

Существующий UI на этом этапе переносится без изменения дизайна и поведения.