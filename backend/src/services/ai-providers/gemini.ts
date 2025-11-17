import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIProviderConfig {
  apiKey: string;
  model?: string;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class GeminiProvider {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(config: AIProviderConfig) {
    this.client = new GoogleGenerativeAI(config.apiKey);
    this.model = config.model || 'gemini-pro';
  }

  async chat(messages: AIMessage[]): Promise<AIResponse> {
    const model = this.client.getGenerativeModel({ model: this.model });

    // Convert messages to Gemini format
    // Gemini uses a different format - combine system and user messages
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');

    let prompt = '';
    if (systemMessage) {
      prompt += `${systemMessage.content}\n\n`;
    }

    // Build conversation history
    const history = conversationMessages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const lastMessage = conversationMessages[conversationMessages.length - 1];

    try {
      const chat = model.startChat({
        history,
        generationConfig: {
          maxOutputTokens: 8192,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(lastMessage.content);
      const response = result.response;
      const text = response.text();

      // Gemini doesn't provide token usage in the same way
      // We can estimate or use the candidates metadata if available
      const usage = {
        promptTokens: 0, // Gemini doesn't provide this directly
        completionTokens: 0,
        totalTokens: 0,
      };

      return {
        content: text,
        model: this.model,
        usage,
      };
    } catch (error: any) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }

  async complete(prompt: string): Promise<AIResponse> {
    const model = this.client.getGenerativeModel({ model: this.model });

    try {
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      return {
        content: text,
        model: this.model,
        usage: {
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
        },
      };
    } catch (error: any) {
      throw new Error(`Gemini API error: ${error.message}`);
    }
  }
}
