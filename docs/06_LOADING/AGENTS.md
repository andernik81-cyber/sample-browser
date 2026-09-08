# Agent Rules — Loading

Работа только с UI/state presentation.

Запрещено реальное scanning/indexing/filesystem work.

Long-running operation state должен быть единым и расширяемым: idle, running, complete, error, cancelled.

Progress values не должны зависеть от конкретного backend. Поддерживать неизвестный total.

Не блокировать UI без необходимости. Не менять текущий sample selection/playback semantics.