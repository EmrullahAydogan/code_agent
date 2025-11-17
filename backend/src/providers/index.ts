import { AIProvider } from '@local-code-agent/shared';
import { BaseAIProvider } from './base';
import { ClaudeProvider } from './claude';
import { OpenAIProvider } from './openai';
import { GeminiProvider } from './gemini';
import { DeepSeekProvider } from './deepseek';

export function createProvider(
  provider: AIProvider,
  apiKey: string,
  baseUrl?: string
): BaseAIProvider {
  switch (provider) {
    case AIProvider.CLAUDE:
      return new ClaudeProvider(apiKey, baseUrl);
    case AIProvider.OPENAI:
      return new OpenAIProvider(apiKey, baseUrl);
    case AIProvider.GEMINI:
      return new GeminiProvider(apiKey, baseUrl);
    case AIProvider.DEEPSEEK:
      return new DeepSeekProvider(apiKey, baseUrl);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

export * from './base';
export * from './claude';
export * from './openai';
export * from './gemini';
export * from './deepseek';
