import axios from 'axios';
import { AIProviderConfig, AIMessage, AIResponse } from './gemini';

export class DeepSeekProvider {
  private apiKey: string;
  private model: string;
  private baseURL: string;

  constructor(config: AIProviderConfig) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'deepseek-chat';
    this.baseURL = 'https://api.deepseek.com/v1';
  }

  async chat(messages: AIMessage[]): Promise<AIResponse> {
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
          })),
          temperature: 0.7,
          max_tokens: 8192,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const data = response.data;
      const choice = data.choices[0];

      return {
        content: choice.message.content,
        model: data.model,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
      };
    } catch (error: any) {
      if (error.response) {
        throw new Error(`DeepSeek API error: ${error.response.data.error?.message || error.message}`);
      }
      throw new Error(`DeepSeek API error: ${error.message}`);
    }
  }

  async complete(prompt: string): Promise<AIResponse> {
    return this.chat([
      { role: 'user', content: prompt },
    ]);
  }
}
