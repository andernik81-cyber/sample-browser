# AGENTS.md

# Sample Browser — UI / UX Behavior Contract

## 1. Назначение

Это desktop sample browser для Windows.

Интерфейс должен вести себя как современное профессиональное приложение для работы с аудиофайлами: предсказуемо, быстро, последовательно и без неожиданных действий.

При принятии решений о поведении UI всегда придерживайся следующих принципов:

1. Одинаковое действие должно давать одинаковый результат во всех частях приложения.
2. Пользователь не должен случайно изменить данные простым кликом.
3. Hover только показывает состояние и никогда сам по себе не выполняет действие.
4. Клик должен иметь минимальную задержку и ощущаться мгновенным.
5. Drag и Click должны быть однозначно различимы.
6. Малые непреднамеренные движения мыши не должны превращать обычный клик в drag.
7. Состояние интерфейса всегда должно быть визуально очевидным.
8. Не создавать неожиданных toggle/action behavior.
9. Использовать стандартные desktop UI conventions.
10. При отсутствии специального правила применять наиболее распространённое поведение аналогичных file/sample browsers.

---

# 2. Mouse interaction model

## 2.1 Pointer Down

`mousedown` используется для:

- фиксации начала потенциального click;
- фиксации позиции курсора;
- начала drag только для элементов, поддерживающих drag;
- визуального pressed-state кнопок.

Не выполнять разрушительные или существенные действия только из-за `mousedown`, если действие не является обычной push-button операцией.

Для обычной кнопки:

- при `mousedown` кнопка сразу визуально становится pressed;
- действие кнопки выполняется на `mousedown`, если это обычная мгновенная команда;
- не ждать `mouseup`, если команда не требует подтверждения нахождения курсора над кнопкой.

## 2.2 Pointer Up

`mouseup` используется для:

- завершения drag;
- завершения resize;
- завершения selection operation;
- снятия pressed-state;
- определения результата drag operation.

Для обычной push-button не использовать `mouseup` как единственное событие запуска команды, если для этого нет специальной причины.

---

# 3. Click detection / protection from small mouse movement

Обычный click не должен отменяться из-за случайного небольшого движения мыши.

После `mousedown` считать действие click, если расстояние движения указателя до `mouseup` находится в пределах небольшого tolerance.

Использовать desktop-style click threshold:

```text
5 px
```

То есть:

```text
mousedown
    ↓
movement <= 5 px
    ↓
mouseup
    ↓
CLICK
```

Если пользователь сдвинул мышь на 1–5 px во время клика, это всё ещё обычный click.

Если движение превышает threshold:

```text
movement > 5 px
```

и элемент поддерживает drag:

```text
CLICK → DRAG
```

После перехода в drag click больше не должен выполняться.

Важно:

- не запускать drag мгновенно при первом 1–2 px движения;
- не считать микроскопическое дрожание руки пользователя drag;
- использовать одинаковый threshold во всём приложении.

---

# 4. Hover

Hover никогда не должен выполнять действие.

Hover может:

- изменять фон;
- подсвечивать строку;
- показывать resize cursor;
- показывать tooltip;
- показывать доступное действие;
- изменять визуальное состояние элемента.

Hover не должен:

- выбирать файл;
- запускать файл;
- открывать папку;
- сортировать таблицу;
- менять состояние toggle;
- начинать drag;
- менять данные.

---

# 5. Buttons

Обычная push button:

### Pointer down

- немедленно показать pressed-state;
- выполнить действие кнопки.

### Pointer up

- убрать pressed-state;
- не выполнять действие второй раз.

Не допускать двойного выполнения команды из-за обработки одновременно `mousedown` и `mouseup`.

Кнопка должна иметь минимум состояния:

```text
Default
Hover
Pressed
Disabled
```

Для toggle-кнопок:

```text
Off
Off + Hover
On
On + Hover
Pressed
Disabled
```

---

# 6. Auto Play

`Auto Play` — toggle option.

Если:

```text
Auto Play = ON
```

то выбор файла пользователем должен автоматически запускать этот файл.

Пример:

```text
клик по Sample A
→ Sample A становится selected
→ Sample A начинает playback
```

Если:

```text
Auto Play = OFF
```

то выбор файла:

```text
выбирает файл
но НЕ запускает его
```

Auto Play не должен:

- запускаться от hover;
- запускаться от простого наведения;
- автоматически запускать каждый файл при прокрутке;
- повторно запускать тот же файл без нового выбора, если это не предусмотрено логикой playback.

Если пользователь выбирает другой файл при включённом Auto Play:

```text
previous sample → stop / release
new sample → select
new sample → playback
```

---

# 7. File selection

Обычный left click по строке файла:

```text
select row
```

Выделение должно происходить сразу.

После выбора:

- строка получает selected-state;
- Preview обновляется;
- waveform обновляется;
- metadata preview обновляется;
- при Auto Play = ON начинается playback.

Обычный click не должен:

- переименовывать файл;
- открывать файл в стороннем приложении;
- открывать папку;
- удалять файл.

---

# 8. Double click

Double click использовать только там, где это логично для desktop application.

Например:

```text
double click folder
→ open / enter folder
```

Для sample file не использовать double click для другого действия, если single click уже используется для выбора и Auto Play.

Не допускать конфликта:

```text
single click
+
double click
```

когда первое действие неожиданно выполняет нежелательную команду перед вторым.

---

# 9. Folder Tree

Folder Tree должен вести себя как стандартное desktop folder tree.

Каждый `FolderTreeItem` может находиться в состоянии:

```text
Normal
Hover
Selected
Expanded
Collapsed
Disabled
```

## 9.1 Папка имеет дочерние папки

Если папка содержит хотя бы одну дочернюю папку:

```text
state != None
```

и отображается expand/collapse indicator.

## 9.2 Папка не содержит дочерних папок

Если в папке нет дочерних папок:

```text
Arrow state = None
```

Стрелка вообще не должна отображаться.

Не показывать пустую или неактивную стрелку только ради сохранения геометрии.

## 9.3 Expand / Collapse

Click по самой стрелке:

```text
Expanded → Collapsed
Collapsed → Expanded
```

Click по названию папки:

```text
select folder
```

По общепринятому desktop behavior, если это удобно для интерфейса, двойной клик по папке может выполнять:

```text
open + expand
```

Но одиночный click не должен одновременно неожиданно выполнять несколько разных действий без явной причины.

## 9.4 Selection

Выбранная папка визуально выделяется.

При выборе папки содержимое `FileTable` должно показывать файлы именно выбранной папки.

---

# 10. File Table

File table является основным представлением файлов выбранной папки.

Обычная строка:

```text
Normal
Hover
Selected
Pressed
Playing
```

Selected и Playing могут существовать одновременно.

Например:

```text
Selected + Playing
```

означает:

- файл выбран;
- этот файл сейчас воспроизводится.

---

# 11. Column headers

Click по заголовку столбца выполняет сортировку по этому столбцу.

Пример:

```text
click Name
→ sort by Name ascending
```

Повторный click по тому же заголовку:

```text
click Name again
→ sort by Name descending
```

Третий click не должен неожиданно сбрасывать сортировку, если интерфейсом явно не предусмотрено состояние "unsorted".

Для стандартного sample browser предпочтительно:

```text
Ascending
↓
Descending
```

## Sort indicator

У активного столбца всегда должен отображаться соответствующий indicator.

Например:

```text
Name ↑
```

или:

```text
Name ↓
```

При переключении направления:

```text
↑ → ↓
```

Другие столбцы:

```text
без active sort indicator
```

Только один столбец должен быть активным сортировочным столбцом одновременно, если multi-column sorting специально не реализована.

---

# 12. Column resizing

Если курсор находится около границы между колонками:

```text
cursor = resize
```

Начало resize:

```text
mousedown near column edge
```

Продолжение:

```text
mouse move
```

Завершение:

```text
mouseup
```

Во время resize:

- не выбирать строку;
- не сортировать колонку;
- не запускать drag файла;
- не запускать click действия.

Небольшое движение после `mousedown` на границе должно интерпретироваться как resize, а не как click.

После завершения resize ширина колонки сохраняется в текущем состоянии UI.

---

# 13. Column reordering

Если интерфейс поддерживает перестановку колонок:

- drag должен начинаться только после превышения drag threshold;
- обычный клик по заголовку остаётся сортировкой;
- resize edge имеет приоритет над reorder;
- визуально показывать место, куда будет перемещена колонка.

Не путать:

```text
click header = sort
drag header = reorder
drag edge = resize
```

Это три разных interaction modes.

---

# 14. File row drag

Если строки поддерживают drag & drop:

```text
mousedown
→ possible drag
```

Пока движение <= 5 px:

```text
still considered click
```

После превышения threshold:

```text
start drag
```

При drag:

- строка получает drag-state;
- показывать drag feedback;
- не запускать Auto Play;
- не выполнять обычный click;
- не менять сортировку.

---

# 15. Drag & Drop files

Если пользователь перетаскивает файл извне приложения:

```text
dragenter
→ dragover
→ drop
```

Во время dragover интерфейс должен визуально показывать допустимую область drop.

При `drop` выполнить действие один раз.

Не выполнять действие на `dragenter` или `dragover`.

Если drop невозможен:

```text
not-allowed cursor / visual state
```

---

# 16. Search field

Search input:

- click → focus;
- typing → обновление поиска;
- Backspace → удаление символов;
- Escape → clear search, если это соответствует стандартному поведению приложения;
- Enter не должен выполнять неизвестное действие.

Поиск должен быть предсказуемым и не менять выбранную папку.

При фильтрации:

```text
Folder Tree = unchanged
File Table = filtered
```

---

# 17. Keyboard navigation

Mouse interaction не должна быть единственным способом управления.

Использовать стандартные desktop conventions:

```text
↑ / ↓
```

перемещают selection по строкам.

```text
Enter
```

выполняет стандартное действие текущего selected item, только если такое действие определено интерфейсом.

```text
Space
```

может использоваться для playback выбранного sample, если это согласовано с keyboard mapping приложения.

```text
Escape
```

закрывает временное состояние / отменяет текущую операцию / сбрасывает transient UI state.

Не перехватывать системные сочетания клавиш без необходимости.

---

# 18. Preview / Waveform

При выборе файла Preview должен обновляться на selected file.

Если Auto Play OFF:

```text
select
→ preview update
→ no playback
```

Если Auto Play ON:

```text
select
→ preview update
→ playback
```

Waveform должен всегда соответствовать текущему preview sample.

Не показывать waveform одного файла одновременно с metadata другого файла.

---

# 19. Playback button

Play button:

```text
Stopped → Playing
Playing → Paused / Stopped
```

в зависимости от определённой модели playback.

Кнопка должна мгновенно менять визуальное состояние после команды.

Если другой sample начинает playback:

```text
previous playing state → removed
new sample → playing
```

Не должно быть двух одновременно визуально playing samples, если приложение не поддерживает одновременное воспроизведение нескольких файлов.

---

# 20. Volume

Volume control должен соответствовать стандартному slider behavior.

- drag → изменение значения;
- click на track → изменение значения, если это предусмотрено дизайном;
- mouse wheel → небольшое изменение;
- Shift/Ctrl modifiers могут использоваться для fine adjustment, только если это предусмотрено приложением.

Не менять значение при простом hover.

---

# 21. Tooltips

Tooltip показывать только после небольшой задержки hover.

Tooltip не должен:

- блокировать мышь;
- мешать click;
- появляться мгновенно при каждом движении;
- оставаться после ухода курсора.

Для очевидных элементов tooltip не обязателен.

---

# 22. Disabled controls

Disabled element:

- не реагирует на click;
- не реагирует на double click;
- не реагирует на drag;
- не реагирует на wheel;
- визуально показывает disabled-state.

Hover над disabled element может показывать tooltip, объясняющий причину недоступности.

---

# 23. Context menu

Right click:

```text
contextmenu
```

должен открывать context menu, только если для объекта существуют соответствующие действия.

Right click по невыбранному элементу:

- сначала выбрать элемент;
- затем открыть context menu.

Контекстное меню должно относиться к объекту, возле которого оно вызвано.

Left click вне context menu:

```text
close context menu
```

---

# 24. Mouse wheel

Wheel должен воздействовать только на элемент/область, над которой находится курсор.

Примеры:

```text
wheel over FileTable
→ scroll FileTable
```

```text
wheel over FolderTree
→ scroll FolderTree
```

```text
wheel over Volume
→ change volume
```

Не менять значение control, если курсор находится за пределами него.

Wheel не должен неожиданно менять selection.

---

# 25. Scroll behavior

Scrolling должен быть стандартным и предсказуемым.

Вертикальный scroll:

```text
wheel
→ vertical scroll
```

Horizontal scroll использовать только там, где действительно нужен горизонтальный overflow.

Не менять размер элементов интерфейса при обычной прокрутке.

Scroll одного panel не должен прокручивать соседний panel.

---

# 26. Focus

Focus должен быть виден для keyboard-operable controls.

Mouse click может переносить focus на clicked control.

После выполнения действия focus не должен неожиданно исчезать без причины.

Не использовать фокус как замену selected-state.

Это разные состояния:

```text
Focus ≠ Selection
```

---

# 27. Selection vs Focus vs Hover

Всегда различать:

```text
Hover
= курсор сейчас находится над элементом

Focus
= элемент получает keyboard input

Selection
= элемент выбран пользователем

Playing
= элемент сейчас воспроизводится

Pressed
= кнопка сейчас нажата
```

Нельзя использовать одно состояние вместо другого.

---

# 28. Prevent accidental actions

Любое потенциально destructive или труднообратимое действие не должно выполняться от случайного drag/click.

Особенно:

- delete;
- remove;
- replace;
- overwrite;
- reset;
- clear;
- destructive file operations.

Для таких действий использовать явное действие пользователя и, где необходимо, confirmation.

---

# 29. Immediate feedback

UI должен немедленно визуально отвечать на действие пользователя.

После click:

```text
selection → immediate
button pressed → immediate
toggle state → immediate
sort indicator → immediate
play state → immediate
```

Не создавать искусственные задержки между действием мыши и визуальным изменением интерфейса.

---

# 30. Interaction priority

Если несколько interaction modes потенциально совпадают, использовать приоритет:

```text
Disabled
↓
Resize
↓
Drag
↓
Click
↓
Hover
```

Но actual command execution должен происходить только после подтверждения соответствующего gesture.

Пример:

```text
click near column edge
```

если движение не превышает threshold:

```text
normal click
```

если пользователь действительно двигает границу:

```text
resize
```

---

# 31. Never surprise the user

Не реализовывать поведение только потому, что оно технически возможно.

Перед добавлением любой новой interaction проверить:

1. Понятно ли пользователю, что произойдёт?
2. Соответствует ли это стандартному desktop behavior?
3. Есть ли визуальная обратная связь?
4. Может ли действие быть вызвано случайно?
5. Не конфликтует ли оно с click / drag / resize / selection?
6. Одинаково ли оно работает в аналогичных местах интерфейса?

Если специальное поведение нигде не определено, использовать **наиболее распространённую и ожидаемую desktop UX convention**, а не придумывать новое.

---

# 32. Consistency rule

Одинаковые UI-элементы должны вести себя одинаково.

Например:

Все обычные кнопки:

```text
mousedown → pressed + action
mouseup → release
```

Все draggable elements:

```text
mousedown
→ threshold
→ drag
→ mouseup
```

Все sortable headers:

```text
click → ascending
click again → descending
```

Все expandable folders:

```text
has children → arrow
no children → arrow = None
```

Не создавать исключения без явной причины.

---

# 33. State must be derived from real application state

Не использовать визуальные состояния как самостоятельные "флаги".

Например:

```text
Playing
```

должно определяться реальным playback state.

```text
Selected
```

должно определяться текущим selection state.

```text
Expanded
```

должно определяться состоянием folder tree.

```text
Sorted
```

должно определяться sort column + sort direction.

UI должен отображать состояние приложения, а не имитировать его.

---

# 34. Prototype rule

Даже если это только frontend prototype, взаимодействия должны быть реализованы реалистично.

Не делать "фальшивый" UI, в котором кнопки визуально меняются, но state не связан с логикой.

Prototype должен демонстрировать:

- реальные selection states;
- реальные folder expansion states;
- реальные sorting states;
- реальные playback states;
- реальные search/filter states;
- реальные hover/pressed states;
- реальные drag/resize interactions.

---

# 35. Final decision rule for the AI agent

Когда пользователь явно не указал поведение какого-либо элемента:

**не задавать пользователю вопрос о каждой мелочи.**

Сначала самостоятельно определить наиболее логичное поведение на основе:

1. стандартных Windows desktop conventions;
2. стандартов file browsers;
3. стандартов audio/sample browsers;
4. существующей логики этого приложения;
5. согласованности с уже реализованными компонентами.

Выбирать наиболее предсказуемый вариант.

Не менять ранее установленное поведение других элементов ради нового решения.

Главная цель:

> **Пользователь должен интуитивно понимать, что произойдёт до того, как он нажмёт кнопку, перетащит объект или сделает другой жест.**