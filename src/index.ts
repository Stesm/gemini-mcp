#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import { spawn } from 'child_process';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const server = new Server(
  {
    name: 'gemini-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const tools: Tool[] = [
  {
    name: 'gemini_query',
    description: 'Отправить запрос в Gemini AI',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Текст запроса для Gemini',
        },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'gemini_unsafe',
    description: 'Отправить запрос в Gemini AI с автоподтверждением небезопасных операций',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Текст запроса для Gemini',
        },
        auto_confirm: {
          type: 'boolean',
          description: 'Автоматически подтверждать небезопасные операции',
          default: false,
        },
      },
      required: ['prompt'],
    },
  },
];

async function executeGeminiCommand(prompt: string, autoConfirm: boolean = false): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!GEMINI_API_KEY) {
      reject(new Error('GEMINI_API_KEY environment variable is required'));
      return;
    }

    const args = [];
    if (autoConfirm) {
      args.push('--yolo');
    }

    const child = spawn('gemini', args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        GEMINI_API_KEY,
      },
    });

    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error('Gemini command timed out after 30 seconds'));
    }, 30000);

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      clearTimeout(timeout);
      if (code === 0) {
        const cleanOutput = stdout.trim()
          .replace(/MCP STDERR.*$/gm, '')
          .replace(/^\[INFO\].*$/gm, '')
          .replace(/^\s*$/gm, '')
          .replace(/\n\n+/g, '\n')
          .trim();
        resolve(cleanOutput);
      } else {
        reject(new Error(`Gemini command failed with code ${code}: ${stderr}`));
      }
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to execute gemini command: ${error.message}`));
    });

    child.stdin.write(prompt + '\n');
    child.stdin.end();
  });
}

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'gemini_query': {
        const { prompt } = args as { prompt: string };
        if (!prompt) {
          throw new Error('Параметр prompt обязателен');
        }
        
        const result = await executeGeminiCommand(prompt);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      case 'gemini_unsafe': {
        const { prompt, auto_confirm = false } = args as { prompt: string; auto_confirm?: boolean };
        if (!prompt) {
          throw new Error('Параметр prompt обязателен');
        }
        
        const result = await executeGeminiCommand(prompt, auto_confirm);
        return {
          content: [
            {
              type: 'text',
              text: result,
            },
          ],
        };
      }

      default:
        throw new Error(`Неизвестный инструмент: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Ошибка: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

runServer().catch((error) => {
  console.error('Ошибка сервера:', error);
  process.exit(1);
});