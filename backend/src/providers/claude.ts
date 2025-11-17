import Anthropic from '@anthropic-ai/sdk';
import { AICompletionRequest, AICompletionResponse } from '@local-code-agent/shared';
import { BaseAIProvider } from './base';

export class ClaudeProvider extends BaseAIProvider {
  private client: Anthropic;

  constructor(apiKey: string, baseUrl?: string) {
    super(apiKey, baseUrl);
    this.client = new Anthropic({
      apiKey,
      baseURL: baseUrl,
    });
  }

  async chat(request: AICompletionRequest): Promise<AICompletionResponse> {
    const systemMessage = request.messages.find(m => m.role === 'system');
    const messages = request.messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    const response = await this.client.messages.create({
      model: request.model,
      max_tokens: request.maxTokens || 4096,
      temperature: request.temperature || 0.7,
      system: systemMessage?.content,
      messages,
    });

    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '';

    return {
      content: text,
      usage: {
        promptTokens: response.usage.input_tokens,
        completionTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
      model: response.model,
    };
  }

  async streamChat(
    request: AICompletionRequest,
    onChunk: (chunk: string) => void
  ): Promise<AICompletionResponse> {
    const systemMessage = request.messages.find(m => m.role === 'system');
    const messages = request.messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    const stream = await this.client.messages.create({
      model: request.model,
      max_tokens: request.maxTokens || 4096,
      temperature: request.temperature || 0.7,
      system: systemMessage?.content,
      messages,
      stream: true,
    });

    let fullContent = '';
    let usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 };
    let modelName = request.model;

    for await (const event of stream) {
      if (event.type === 'content_block_delta') {
        if (event.delta.type === 'text_delta') {
          const chunk = event.delta.text;
          fullContent += chunk;
          onChunk(chunk);
        }
      } else if (event.type === 'message_start') {
        usage.promptTokens = event.message.usage.input_tokens;
      } else if (event.type === 'message_delta') {
        usage.completionTokens = event.usage.output_tokens;
        usage.totalTokens = usage.promptTokens + usage.completionTokens;
      }
    }

    return {
      content: fullContent,
      usage,
      model: modelName,
    };
  }
}
