export interface LLMProvider {
  generateResponse(prompt: string): Promise<string>;
  isAvailable(): Promise<boolean>;
}