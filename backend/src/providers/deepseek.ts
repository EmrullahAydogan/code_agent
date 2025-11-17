import OpenAI from 'openai';
import { AICompletionRequest, AICompletionResponse } from '@local-code-agent/shared';
import { BaseAIProvider } from './base';

// DeepSeek uses OpenAI-compatible API
export class DeepSeekProvider extends BaseAIProvider {
  private client: OpenAI;

  constructor(apiKey: string, baseUrl?: string) {
    super(apiKey, baseUrl);
    this.client = new OpenAI({
      apiKey,
      baseURL: baseUrl || 'https://api.deepseek.com/v1',
    });
  }

  async chat(request: AICompletionRequest): Promise<AICompletionResponse> {
    const messages = request.messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    const response = await this.client.chat.completions.create({
      model: request.model,
      messages: messages as any,
      max_tokens: request.maxTokens || 4096,
      temperature: request.temperature || 0.7,
    });

    const choice = response.choices[0];

    return {
      content: choice.message.content || '',
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
      },
      model: response.model,
    };
  }

  async streamChat(
    request: AICompletionRequest,
    onChunk: (chunk: string) => void
  ): Promise<AICompletionResponse> {
    const messages = request.messages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    const stream = await this.client.chat.completions.create({
      model: request.model,
      messages: messages as any,
      max_tokens: request.maxTokens || 4096,
      temperature: request.temperature || 0.7,
      stream: true,
    });

    let fullContent = '';
    let modelName = request.model;

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) {
        fullContent += delta;
        onChunk(delta);
      }
      if (chunk.model) {
        modelName = chunk.model;
      }
    }

    return {
      content: fullContent,
      model: modelName,
    };
  }
}
