# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MCP (Model Context Protocol) сервер для интеграции с Gemini AI. Предоставляет инструменты для выполнения запросов к Gemini через CLI с поддержкой автоконфирма небезопасных операций.

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **MCP SDK**: @modelcontextprotocol/sdk ^1.13.2
- **Protocol**: Model Context Protocol с stdio transport
- **Build Tool**: TypeScript Compiler (tsc)

## Development Commands

```bash
# Установка зависимостей
npm install

# Сборка проекта
npm run build

# Запуск сервера
npm start

# Разработка (сборка + запуск)
npm run dev

# Запуск через npx
npx gemini-mcp
```

## Project Structure

```
├── src/
│   └── index.ts          # MCP сервер с инструментами Gemini
├── dist/                 # Скомпилированный JavaScript
├── package.json          # Конфигурация и зависимости
├── tsconfig.json         # Конфигурация TypeScript
└── CLAUDE.md            # Документация для Claude Code
```

## MCP Server Architecture

1. **Server Setup**: Использует @modelcontextprotocol/sdk Server class
2. **Transport**: StdioServerTransport для коммуникации с Claude Code
3. **Tools**: Два основных инструмента для работы с Gemini
4. **Command Execution**: Spawn процессы для вызова gemini CLI

## Available Tools

### gemini_query
- **Описание**: Базовый инструмент для отправки запросов в Gemini AI
- **Параметры**: 
  - `prompt` (string, required) - текст запроса
- **Вызов**: `GEMINI_API_KEY=... gemini -p "{prompt}"`

### gemini_unsafe  
- **Описание**: Запросы с автоподтверждением небезопасных операций
- **Параметры**:
  - `prompt` (string, required) - текст запроса
  - `auto_confirm` (boolean, optional) - автоподтверждение
- **Вызов**: `GEMINI_API_KEY=... gemini -p "{prompt}" [--auto-confirm]`

## Integration with Claude Code

Для подключения к Claude Code добавьте в конфигурацию MCP:

```json
{
  "mcpServers": {
    "gemini": {
      "command": "npx",
      "args": ["gemini-mcp"]
    }
  }
}
```

## API Configuration

Использует API ключ: `AIzaSyAk12SVCOV2Wha3scYIijrVFX91kdhHIfY`
Автоматически устанавливается в переменную окружения GEMINI_API_KEY при выполнении команд.

## Error Handling

- Валидация обязательных параметров
- Обработка ошибок выполнения gemini CLI
- Возврат структурированных ошибок через MCP protocol
- Логирование ошибок сервера в stderr