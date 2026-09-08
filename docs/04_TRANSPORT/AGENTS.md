# Agent Rules — Transport

Transport must have one authoritative state object. Не оставлять конкурирующие `playing`/`paused` booleans, если они дублируют transport state.

Position и duration — numeric seconds in state; formatting only in presentation.

UI never owns the real playback clock. JUCE will be source of truth later.

Не использовать Web Audio API. Не implement decoder. Сохранить существующие play/stop semantics.