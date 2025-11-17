import { GeminiProvider } from './gemini';
import { DeepSeekProvider } from './deepseek';
import { ClaudeProvider } from './claude';
import { OpenAIProvider } from './openai';
import { AIMessage, AIResponse, AIProviderConfig } from './gemini';

export { AIMessage, AIResponse, AIProviderConfig };

export enum AIProviderType {
  GEMINI = 'gemini',
  DEEPSEEK = 'deepseek',
  CLAUDE = 'claude',
  OPENAI = 'openai',
}

export interface AIProvider {
  chat(messages: AIMessage[]): Promise<AIResponse>;
  complete(prompt: string): Promise<AIResponse>;
}

export class AIProviderFactory {
  private static providers: Map<string, AIProvider> = new Map();

  static createProvider(
    type: AIProviderType,
    config: AIProviderConfig
  ): AIProvider {
    const key = `${type}-${config.apiKey.slice(0, 8)}`;

    if (this.providers.has(key)) {
      return this.providers.get(key)!;
    }

    let provider: AIProvider;

    switch (type) {
      case AIProviderType.GEMINI:
        provider = new GeminiProvider(config);
        break;
      case AIProviderType.DEEPSEEK:
        provider = new DeepSeekProvider(config);
        break;
      case AIProviderType.CLAUDE:
        provider = new ClaudeProvider(config);
        break;
      case AIProviderType.OPENAI:
        provider = new OpenAIProvider(config);
        break;
      default:
        throw new Error(`Unsupported AI provider: ${type}`);
    }

    this.providers.set(key, provider);
    return provider;
  }

  static getProviderInfo() {
    return [
      {
        type: AIProviderType.GEMINI,
        name: 'Google Gemini',
        models: ['gemini-pro', 'gemini-pro-vision', 'gemini-ultra'],
        description: 'Google\'s advanced AI model',
        requiresApiKey: true,
      },
      {
        type: AIProviderType.DEEPSEEK,
        name: 'DeepSeek',
        models: ['deepseek-chat', 'deepseek-coder'],
        description: 'DeepSeek AI models optimized for coding',
        requiresApiKey: true,
      },
      {
        type: AIProviderType.CLAUDE,
        name: 'Anthropic Claude',
        models: [
          'claude-3-5-sonnet-20241022',
          'claude-3-opus-20240229',
          'claude-3-sonnet-20240229',
          'claude-3-haiku-20240307',
        ],
        description: 'Anthropic\'s Claude AI models',
        requiresApiKey: true,
      },
      {
        type: AIProviderType.OPENAI,
        name: 'OpenAI',
        models: [
          'gpt-4-turbo-preview',
          'gpt-4',
          'gpt-3.5-turbo',
          'gpt-4o',
          'gpt-4o-mini',
        ],
        description: 'OpenAI\'s GPT models',
        requiresApiKey: true,
      },
    ];
  }

  static clearCache() {
    this.providers.clear();
  }
}

// Helper function to get provider from agent config
export async function getAIProviderForAgent(agent: {
  provider?: string;
  apiKey?: string;
  model?: string;
}): Promise<AIProvider> {
  const providerType = (agent.provider || AIProviderType.GEMINI) as AIProviderType;
  const apiKey = agent.apiKey || process.env[`${providerType.toUpperCase()}_API_KEY`] || '';

  if (!apiKey) {
    throw new Error(`No API key configured for provider: ${providerType}`);
  }

  return AIProviderFactory.createProvider(providerType, {
    apiKey,
    model: agent.model,
  });
}
