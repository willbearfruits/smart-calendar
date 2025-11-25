// AI Provider Configuration
export type AIProvider = 'gemini' | 'openai' | 'claude' | 'ollama' | 'lmstudio';

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey?: string;
  baseUrl?: string; // For Ollama/LMStudio
  model?: string;
  enabled: boolean;
}

export const DEFAULT_MODELS: Record<AIProvider, string> = {
  gemini: 'gemini-2.5-flash',
  openai: 'gpt-4-turbo-preview',
  claude: 'claude-3-5-sonnet-20241022',
  ollama: 'llama3.2',
  lmstudio: 'local-model'
};

export const DEFAULT_BASE_URLS: Record<string, string> = {
  ollama: 'http://localhost:11434',
  lmstudio: 'http://localhost:1234'
};

// Get provider config from environment
export function getProviderConfig(): AIProviderConfig {
  const provider = (process.env.AI_PROVIDER || 'gemini') as AIProvider;

  return {
    provider,
    apiKey: process.env.AI_API_KEY || process.env.GEMINI_API_KEY,
    baseUrl: process.env.AI_BASE_URL || DEFAULT_BASE_URLS[provider],
    model: process.env.AI_MODEL || DEFAULT_MODELS[provider],
    enabled: !!(process.env.AI_API_KEY || process.env.GEMINI_API_KEY || ['ollama', 'lmstudio'].includes(provider))
  };
}
