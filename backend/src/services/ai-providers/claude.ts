import Anthropic from '@anthropic-ai/sdk';
import { AIProviderConfig, AIMessage, AIResponse } from './gemini';

export class ClaudeProvider {
  private client: Anthropic;
  private model: string;

  constructor(config: AIProviderConfig) {
    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
    this.model = config.model || 'claude-3-5-sonnet-20241022';
  }

  async chat(messages: AIMessage[]): Promise<AIResponse> {
    try {
      // Separate system message from conversation messages
      const systemMessage = messages.find(m => m.role === 'system');
      const conversationMessages = messages.filter(m => m.role !== 'system');

      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 8192,
        temperature: 0.7,
        system: systemMessage?.content,
        messages: conversationMessages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })),
      });

      const content = response.content[0];
      const text = content.type === 'text' ? content.text : '';

      return {
        content: text,
        model: response.model,
        usage: {
          promptTokens: response.usage.input_tokens,
          completionTokens: response.usage.output_tokens,
          totalTokens: response.usage.input_tokens + response.usage.output_tokens,
        },
      };
    } catch (error: any) {
      throw new Error(`Claude API error: ${error.message}`);
    }
  }

  async complete(prompt: string): Promise<AIResponse> {
    return this.chat([
      { role: 'user', content: prompt },
    ]);
  }
}
