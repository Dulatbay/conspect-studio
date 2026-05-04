# Topic Content Studio — техническое углубление: ИИ-пайплайн, графы на канве, оркестрация и контракты данных

Документ опирается на три репозитория:

| Репозиторий | Роль |
|-------------|------|
| **`topic-content-studio`** | React SPA: модули, roadmap, редактор, граф (`react-archer`), RTK Query |
| **`conspect-service`** | Spring Boot + MongoDB: сущности, REST, вызов AI, приём callback, десериализация дерева |
| **`conspect-ai`** | FastAPI: извлечение текста из файлов, Bedrock Converse, джобы, callback в Java |

Обзор для статьи без избыточной детализации: [`RESEARCH_SYSTEM_DOCUMENTATION.md`](./RESEARCH_SYSTEM_DOCUMENTATION.md).

---

## 1. Формальная модель: дерево + оверлей-граф

### 1.1 Дерево композиции

Корневой объект конспекта — узел с `nodeType: "STACK"` (или эквивалент на сервере). Поле **`children`** у `STACK` задаёт **иерархию вложенности**: «родитель содержит дочерние узлы». Остальные типы (`TEXT`, `ICON_TEXT`, `TITLED_CONTAINER`, `CENTERED_CONTAINER`, `IMAGE`, `VIDEO`) либо терминальны по структуре, либо содержат **ограниченные поддеревья** (например `TITLED_CONTAINER`: `titleText` + `content` как вложенный `STACK`).

Это **дерево документа** в смысле теории графов: ориентированный корневой граф без циклов по рёбрам `parent → child` (если не допускать циклические ссылки в данных).

### 1.2 Оверлей рёбер `links`

Помимо `children`, у узла может быть массив **`links`**: список пар `{ fromId, toId }` (см. `BaseNode` в Java и TypeScript). Семантика в UI:

- В рендерере (`Parser.tsx`) для текущего узла `obj` берутся только те записи, где **`link.fromId === obj.id`** — исходящие дуги «от этого блока».
- Визуализация: библиотека **`react-archer`** — каждый узел оборачивается в **`ArcherElement`** с `id={node.id}`; исходящие связи передаются как **`relations`**: `{ targetId, sourceAnchor, targetAnchor }`.

Таким образом **полный граф конспекта** = дерево по `children` **∪** множество дуг из всех `links` (мультиграф, если модель допускает несколько дуг; на практике обычно простые связи).

**Исследовательский акцент:** это **DSL для учебного макета**: композиция (flex/stack) + явная аннотация связей между удалёнными блоками без переноса их в один родитель.

### 1.3 Почему граф не «layout-алгоритм»

Позиции блоков задаются **версткой** (flex, gap, padding), а не force-directed layout (Graphviz, d3-force). Рёбра `react-archer` — **накладной слой** поверх уже разложенного дерева: кривые соединяют DOM-элементы по `id`. Это важно для раздела *«геометрия чтения»* vs *«семантика связи»* в статье.

---

## 2. Рендеринг графа на клиенте (детали реализации)

### 2.1 Слой архера

Файл: `topic-content-studio/src/components/MainDrawBar.tsx`.

- **`ArcherContainer`** задаёт общий SVG-слой для кривых (`strokeColor`, `strokeWidth`, `endMarker` и т.д.).
- Внутри контейнера рекурсивно вызывается **`Parser`**, который для каждого узла возвращает **`ArcherElement`** с уникальным строковым **`id`**, совпадающим с `node.id`.

### 2.2 Маппинг `links` → `relations`

Файл: `topic-content-studio/src/utills/parser/Parser.tsx`.

```text
relations(links) =
  links
    ?.filter(l => l.fromId === obj.id)
    .map(link => ({
      targetId: link.toId,
      sourceAnchor: 'bottom',
      targetAnchor: 'top',
    }))
```

То есть визуально дуга **выходит снизу** источника и **приходит сверху** цели. Это фиксированная политика UI (можно было бы parametризовать — сейчас жёстко для читаемости «сверху вниз» по уроку).

### 2.3 Взаимодействие с pan/zoom

Канва обёрнута в **`react-zoom-pan-pinch`** (`TransformWrapper` / `TransformComponent`). Архер привязывает линии к **bounding box** DOM-узлов с соответствующими `id`; при масштабировании и панорамировании SVG пересчитывает координаты относительно трансформированного контейнера (поведение библиотеки). Исследовательское замечание: при экстремальных масштабах возможны артефакты пересечения с UI — это ограничение связки «CSS transform + SVG overlay», а не модели данных.

### 2.4 Дублирование представления: канва и дерево

`SidePanel` / `TreeNode` строят **другое представление** того же JSON: раскрытие узлов, DnD внутри стека, другой UX. Для статьи это пример **двунаправленной синхронизации** через React Context (`SelectedNodeContext`) и единый источник правды `fullData`.

---

## 3. ИИ-подсистема (`conspect-ai`): от байтов файла до JSON-дерева

### 3.1 Точка входа HTTP

- **`POST /api/v1/jobs/conspect`** — `multipart/form-data`: поля `file`, `lesson_text`, `language` (`ru` | `kz` | `en`), опционально **`callback_url`**, **`callback_secret`**.
- Ответ **202** + тело `{ "job_id", "status": "queued" }`.
- **`GET /api/v1/jobs/{job_id}`** — polling: `queued` → `running` → `completed` | `failed`; при `completed` в теле есть **`result`** (Pydantic-модель `GenerateConspectResponse`).

### 3.2 Асинхронная модель выполнения

Файл: `conspect-ai/app/main.py`.

1. Создаётся запись в **`ConspectJobStore`** (in-memory `OrderedDict`, лимит ~2000 джобов, вытеснение старых).
2. `asyncio.create_task(run_conspect_job(...))` — джоб не блокирует ответ клиента.
3. `run_conspect_job` (`app/jobs/runner.py`): `set_running` → **`asyncio.to_thread(build_conspect_response, payload)`** — тяжёлый синхронный пайплайн (Bedrock, PDF) в thread pool, чтобы не блокировать event loop FastAPI.

### 3.3 Извлечение текста (pre-LLM)

Файл: `conspect-ai/app/services/conspect_pipeline.py` + `app/extractors/registry.py`.

- По суффиксу имени / MIME выбирается экстрактор: **PDF**, **DOCX**, **XLSX**, **plain** (.txt/.md).
- PDF: отдельный модуль (`extract_pdf`) — комбинация текстового слоя, **VLM** (картинки страниц в Bedrock Converse), **OCR** fallback; в результате возвращается `(text, method_slug)` например `pdf_mixed`, `pdf_vlm`, и т.д. (попадает в `source_extraction_method` ответа).
- Текст режется до **`max_input_chars`** (по умолчанию 120000) с предупреждением в `warnings`.

### 3.4 Вызов LLM: Bedrock Converse

Файлы: `app/llm/bedrock_common.py`, `app/llm/conspect_generator.py`.

- Клиент: `boto3.client("bedrock-runtime")`, метод **`converse`**.
- **System**: один большой текст `_system_prompt(lang)` — инструкция на русском с жёстким требованием **одного JSON-объекта** без markdown-обёртки; перечислены допустимые `nodeType` и поля; явно сказано **не включать `id`** — сервер/нормализатор присвоит UUID.
- **Few-shot / in-context structure**: из каталога **`app/sample/*.json`** подмешивается до **`CONSPECT_SAMPLE_EXAMPLES_MAX_CHARS`** символов эталонов (`build_sample_examples_block`), чтобы модель копировала **форму**, а не текст.
- **User**: строка «Материал урока:» + обрезанный текст + напоминание вернуть только `{ title, conspect_document }`.
- **Inference**: `maxTokens` из настроек (`bedrock_max_output_tokens`), `temperature` = `llm_temperature` (по умолчанию 0.35) для основного JSON-конспекта. Для VLM по PDF страницам используется отдельная более низкая температура (`pdf_vlm_temperature` в `config.py`) — см. пайплайн PDF (не дублируем здесь весь файл).

### 3.5 Парсинг ответа модели

Файл: `app/llm/conspect_generator.py`.

- Снимается возможная обёртка ```json … ``` (`_strip_markdown_json_fence`).
- `json.loads` + fallback `JSONDecoder.raw_decode` с позиции первого `{`.
- При неуспехе — ветка с `normalize_conspect_output({}, raw_unparsed=raw)`.

### 3.6 Нормализация и идентификаторы узлов

Файл: `app/llm/conspect_document.py` — функция **`normalize_conspect_output`**:

1. Если есть **`conspect_document`** и это dict с `nodeType == "STACK"` → принимается как дерево; затем **`assign_node_ids`** рекурсивно обходит dict/list и **вешает новый UUID на каждый узел с `nodeType`**, перезаписывая любые `id` от модели.
2. Иначе если есть legacy **`conspect_markdown` / `markdown`** → **`markdown_fallback_document`**: упаковка в минимальный STACK с TEXT.
3. Иначе если есть сырой непарсенный текст → fallback с обрезкой.
4. Иначе → **`minimal_stack_with_title`** — заглушка с одним заголовком.

Итог: **инвариант** — на выходе пайплайна всегда есть валидное по схеме дерево с UUID на всех узлах.

### 3.7 Схема ответа джоба

Pydantic (`app/schemas.py`): `GenerateConspectResponse` содержит `title`, `conspect_document` (dict), `source_extraction_method`, `extracted_char_count`, `warnings`. Это же сериализуется в `result` при `completed` и уходит в **callback** в Java.

### 3.8 Callback в сторону Java

Файл: `conspect-ai/app/jobs/runner.py`, функция **`_maybe_callback`**:

- POST на `callback_url` с JSON: `{ "job_id", "status", "result", "error" }`.
- Заголовок **`X-Callback-Secret`** если передан `callback_secret`.
- До **3** попыток, backoff `2 * attempt` секунд; при окончательной неудаче — только лог; **состояние джоба в AI уже финально** (клиент может опросить `GET /jobs/{id}`).

---

## 4. Оркестрация на Java (`conspect-service`)

### 4.1 Создание джоба из браузера

Файл: `ConspectAiClient.java`.

- **Multipart** тело: `file` (или только `lesson_text`), `language` в виде `ru`/`kz`/`en` (маппинг из enum `Language` сервиса).
- Всегда добавляются **`callback_url`** = `AI_CALLBACK_URL` + суффикс пути `/api/v1/conspects/internal/ai/callback` и **`callback_secret`**.
- **Timeouts** connect/read из `AI_TIMEOUT_MS` / `app.ai.timeout-ms`.
- Ответ парсится в `AiJobAccepted` с полем **`job_id`** (Jackson: `@JsonProperty("job_id")`).

### 4.2 Состояние сущности `Conspect` во время генерации

`ConspectServiceImpl.createFromUpload` / `regenerate`:

- В БД сохраняется документ с **`isGenerating=true`**, **`aiJobId`**, при необходимости **`sourceFilename`**; при `regenerate` — контент по языкам **обнуляется** до прихода результата.
- Если AI недоступен на POST — **`isGenerating=false`**, **`aiError`** с текстом, без выброса наружу в некоторых ветках (см. код — UX: запись остаётся в БД с ошибкой).

### 4.3 Приём callback

`ConspectServiceImpl.applyAiCallback`:

- Поиск конспекта по **`findByAiJobIdAndDeletedFalse(jobId)`**.
- **`status=completed`**: из `result` Map берутся **`title`** и **`conspect_document`**; `ObjectMapper.convertValue(documentObj, BaseNode.class)` — полиморфная десериализация по **`nodeType`** (Jackson `@JsonTypeInfo` на `BaseNode`, зеркально фронту).
- Содержимое записывается в **`contentRu`**, затем **клон** того же дерева в **`contentKaz`** и **`contentEng`** через сериализация→десериализация (`cloneNode`) — **три параллельных копии одного AI-результата** (упрощение i18n: один прогон модели на выбранном языке, три слота в MongoDB).
- **`isGenerating=false`**, `aiError=null`.
- **`failed`**: только сообщение и флаг генерации.

### 4.4 Безопасность callback

`ConspectController` / `ConspectAiClient.verifyCallbackSecret`: сравнение заголовка **`X-Callback-Secret`** с `AI_CALLBACK_SECRET`. В dev допускается пустой секрет (тогда проверка пропускается — см. код).

---

## 5. Клиент: согласованность с API и опрос состояния

### 5.1 RTK Query и инвалидация между срезами

`conspectApi` после мутаций, затрагивающих roadmap, диспатчит **`moduleApi.util.invalidateTags`** — т.к. теги `Module` живут в другом `createApi`, обычного `invalidatesTags` внутри одного среза недостаточно.

### 5.2 Поллинг

- **Страница модуля**: `useEffect` + `setInterval(1500)` на `refetch()` модуля, пока хотя бы один conspect в списке имеет `isGenerating`.
- **Редактор** (если пользователь оказался на URL во время генерации): аналогичный интервал + упрощённый chrome; с roadmap переход в редактор при `isGenerating` блокируется (см. текущую реализацию `ModulePage`).

---

## 6. Ограничения и предмет исследования (для Discussion)

1. **In-memory job store** в `conspect-ai` — реплики и рестарты; для продакшена нужны SQS + DynamoDB/Redis и идемпотентный callback.
2. **LLM → жёсткий JSON DSL** — риск невалидных ответов; многоуровневая защита: парсинг, `normalize_conspect_output`, `assign_node_ids`, на Java — try/catch вокруг `convertValue` с записью `aiError`.
3. **Граф только визуальный** — нет автоматической проверки ацикличности `links` или достижимости; противоречия с layout остаются на уровне автора контента.
4. **Тройное клонирование** контента на три языка после одного AI-прогона** — осознанный trade-off: нет отдельного перевода, зато единый снапшот дерева.

---

## 7. Карта файлов (быстрый указатель для ревью кода в статье)

| Тема | Путь |
|------|------|
| Граф на канве | `topic-content-studio/src/components/MainDrawBar.tsx` |
| Узлы + ArcherElement | `topic-content-studio/src/utills/parser/Parser.tsx` |
| Типы узлов / links | `topic-content-studio/src/utills/parser/types.ts` |
| HTTP джоб + callback form | `conspect-ai/app/main.py` |
| Worker + HTTP callback | `conspect-ai/app/jobs/runner.py` |
| Пайплайн файл→текст→LLM | `conspect-ai/app/services/conspect_pipeline.py` |
| Промпт + парсинг JSON | `conspect-ai/app/llm/conspect_generator.py` |
| UUID на узлах | `conspect-ai/app/llm/conspect_document.py` |
| Bedrock Converse | `conspect-ai/app/llm/bedrock_common.py` |
| Настройки модели / лимиты | `conspect-ai/app/config.py` |
| Клиент к AI + callback URL | `conspect-service/.../ConspectAiClient.java` |
| Слияние результата в Mongo | `conspect-service/.../ConspectServiceImpl.java` |

---

*Версия документа: 1.0 — расширение для research paper (Methods / System / AI pipeline).*
