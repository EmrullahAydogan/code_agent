import { GoogleGenerativeAI } from '@google/generative-ai';
import { AICompletionRequest, AICompletionResponse } from '@local-code-agent/shared';
import { BaseAIProvider } from './base';

export class GeminiProvider extends BaseAIProvider {
  private client: GoogleGenerativeAI;

  constructor(apiKey: string, baseUrl?: string) {
    super(apiKey, baseUrl);
    this.client = new GoogleGenerativeAI(apiKey);
  }

  async chat(request: AICompletionRequest): Promise<AICompletionResponse> {
    const model = this.client.getGenerativeModel({ model: request.model });

    // Combine system message with user messages
    const systemMessage = request.messages.find(m => m.role === 'system');
    const messages = request.messages.filter(m => m.role !== 'system');

    let prompt = '';
    if (systemMessage) {
      prompt = `${systemMessage.content}\n\n`;
    }

    // Convert messages to Gemini format
    const history = [];
    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i];
      history.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    const lastMessage = messages[messages.length - 1];
    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: request.maxTokens || 4096,
        temperature: request.temperature || 0.7,
      },
    });

    const result = await chat.sendMessage(lastMessage.content);
    const response = result.response;
    const text = response.text();

    return {
      content: text,
      model: request.model,
    };
  }

  async streamChat(
    request: AICompletionRequest,
    onChunk: (chunk: string) => void
  ): Promise<AICompletionResponse> {
    const model = this.client.getGenerativeModel({ model: request.model });

    const systemMessage = request.messages.find(m => m.role === 'system');
    const messages = request.messages.filter(m => m.role !== 'system');

    const history = [];
    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i];
      history.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }

    const lastMessage = messages[messages.length - 1];
    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: request.maxTokens || 4096,
        temperature: request.temperature || 0.7,
      },
    });

    const result = await chat.sendMessageStream(lastMessage.content);

    let fullContent = '';
    for await (const chunk of result.stream) {
      const text = chunk.text();
      fullContent += text;
      onChunk(text);
    }

    return {
      content: fullContent,
      model: request.model,
    };
  }
}
