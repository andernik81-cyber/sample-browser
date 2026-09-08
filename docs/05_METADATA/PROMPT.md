# Prompt — Stage 5 Metadata

Прочитай корневые правила и предыдущие этапы. Добавь Metadata panel для selected sample. Поля: BPM, Key, Tags, Rating, Date, Size, Path. Сделай layout расширяемым.

Не реализуй tag scanning, audio analysis, ID3/BWF/RIFF parsing, file I/O или database. Используй mock/unknown values.

Важно: UI модель должна быть compatible с будущим объектом `SampleMetadata` от JUCE. Не дублируй metadata в нескольких независимых state branches.

Сохрани текущий дизайн и проверь `npm run build`.