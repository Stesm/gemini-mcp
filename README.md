# Gemini MCP Server

MCP (Model Context Protocol) сервер для интеграции с Gemini AI. Предоставляет инструменты для выполнения запросов к Gemini через Claude Code.

## Возможности

- **gemini_query** - базовые запросы к Gemini AI
- **gemini_unsafe** - запросы с автоподтверждением небезопасных операций
- Работа через stdio transport
- Интеграция с Claude Code через MCP протокол

## Установка

### Требования

- Node.js
- Установленный [gemini CLI](https://github.com/google/generative-ai-cli)
- API ключ Gemini

### Быстрый старт

1. Клонируйте репозиторий:
```bash
git clone https://github.com/Stesm/gemini-mcp.git
cd gemini-mcp
```

2. Установите зависимости:
```bash
npm install
```

3. Соберите проект:
```bash
npm run build
```

4. Добавьте MCP сервер в Claude Code:
```bash
claude mcp add gemini node /path/to/gemini-mcp/dist/index.js -e GEMINI_API_KEY=your_api_key
```

## Конфигурация

### Переменные окружения

- `GEMINI_API_KEY` - API ключ для Gemini AI (обязательно)

### Альтернативный способ подключения

Добавьте в конфигурацию Claude Code (`~/.config/claude-code/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "gemini": {
      "command": "node",
      "args": ["/path/to/gemini-mcp/dist/index.js"],
      "env": {
        "GEMINI_API_KEY": "your_api_key"
      }
    }
  }
}
```

## Использование

После подключения к Claude Code доступны два инструмента:

### gemini_query
Базовый инструмент для отправки запросов в Gemini AI.

**Параметры:**
- `prompt` (string, required) - текст запроса

### gemini_unsafe
Инструмент для запросов с автоподтверждением небезопасных операций.

**Параметры:**
- `prompt` (string, required) - текст запроса  
- `auto_confirm` (boolean, optional) - автоматически подтверждать операции

## Разработка

### Команды

```bash
# Установка зависимостей
npm install

# Сборка проекта
npm run build

# Запуск сервера
npm start

# Разработка (сборка + запуск)
npm run dev
```

### Структура проекта

```
├── src/
│   └── index.ts          # MCP сервер с инструментами Gemini
├── dist/                 # Скомпилированный JavaScript
├── package.json          # Конфигурация и зависимости
├── tsconfig.json         # Конфигурация TypeScript
└── CLAUDE.md            # Документация для Claude Code
```

## Архитектура

1. **MCP Server** - использует @modelcontextprotocol/sdk
2. **Transport** - StdioServerTransport для коммуникации с Claude Code
3. **Tools** - инструменты для работы с Gemini CLI
4. **Command Execution** - spawn процессы для вызова gemini CLI

## Лицензия

MIT

## Автор

Created with [Claude Code](https://claude.ai/code)