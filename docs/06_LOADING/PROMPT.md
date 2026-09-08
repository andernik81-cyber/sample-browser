# Prompt — Stage 6 Loading

Добавь UI contract для длительных операций: scanning, indexing, loading sample, loading waveform, ready, error. Нужны progress current/total/percentage, сообщение и возможность отмены/прерывания в будущем.

Все значения mock. Не реализовывать filesystem scanner, worker, database или decoder.

Сделай компонент переиспользуемым и пригодным для будущих событий JUCE native event. Не перекрывай основной UI без необходимости. Проверь все states и `npm run build`.