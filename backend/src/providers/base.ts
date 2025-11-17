import { AICompletionRequest, AICompletionResponse } from '@local-code-agent/shared';

export abstract class BaseAIProvider {
  protected apiKey: string;
  protected baseUrl?: string;

  constructor(apiKey: string, baseUrl?: string) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  abstract chat(request: AICompletionRequest): Promise<AICompletionResponse>;
  abstract streamChat(
    request: AICompletionRequest,
    onChunk: (chunk: string) => void
  ): Promise<AICompletionResponse>;
}
