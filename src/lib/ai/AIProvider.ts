export interface AIResponse<T = unknown> {
  success: boolean;
  data: T | null;
  rawText?: string;
  error?: string;
}

export interface AIProvider {
  name: string;
  generateText(prompt: string, systemInstruction?: string): Promise<AIResponse<string>>;
  generateStructuredJSON<T>(prompt: string, schemaDescription: string): Promise<AIResponse<T>>;
}

export class GeminiProvider implements AIProvider {
  public name = "GeminiProvider";

  async generateText(prompt: string, systemInstruction?: string): Promise<AIResponse<string>> {
    // Abstraction layer for Gemini API
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
      return { success: false, data: null, error: "AI_API_KEY environment variable is missing" };
    }
    // Stubbed interface for M01 foundation - real calls implemented in M06
    return { success: true, data: `[Gemini Response for: ${prompt.slice(0, 30)}...]` };
  }

  async generateStructuredJSON<T>(prompt: string, schemaDescription: string): Promise<AIResponse<T>> {
    return { success: false, data: null, error: "AI structured JSON calls reserved for M06" };
  }
}
