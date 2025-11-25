// Unified AI Service - supports multiple providers
import { AIProviderConfig, getProviderConfig } from '../config/aiProviders.js';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  text: string;
  toolCalls?: any[];
}

// Check if AI is available
export function isAIAvailable(): boolean {
  const config = getProviderConfig();
  return config.enabled;
}

// Get provider info for display
export function getProviderInfo() {
  const config = getProviderConfig();
  return {
    provider: config.provider,
    model: config.model,
    enabled: config.enabled
  };
}

// Generate text with any provider
export async function generateText(prompt: string, systemPrompt?: string): Promise<string> {
  const config = getProviderConfig();

  if (!config.enabled) {
    throw new Error('AI provider not configured. Please set up an AI provider in Settings.');
  }

  switch (config.provider) {
    case 'gemini':
      return await generateWithGemini(prompt, systemPrompt, config);
    case 'openai':
      return await generateWithOpenAI(prompt, systemPrompt, config);
    case 'claude':
      return await generateWithClaude(prompt, systemPrompt, config);
    case 'ollama':
      return await generateWithOllama(prompt, systemPrompt, config);
    case 'lmstudio':
      return await generateWithLMStudio(prompt, systemPrompt, config);
    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`);
  }
}

// Chat with any provider
export async function chat(messages: ChatMessage[], systemPrompt?: string): Promise<AIResponse> {
  const config = getProviderConfig();

  if (!config.enabled) {
    throw new Error('AI provider not configured. Please set up an AI provider in Settings.');
  }

  switch (config.provider) {
    case 'gemini':
      return await chatWithGemini(messages, systemPrompt, config);
    case 'openai':
      return await chatWithOpenAI(messages, systemPrompt, config);
    case 'claude':
      return await chatWithClaude(messages, systemPrompt, config);
    case 'ollama':
      return await chatWithOllama(messages, systemPrompt, config);
    case 'lmstudio':
      return await chatWithLMStudio(messages, systemPrompt, config);
    default:
      throw new Error(`Unsupported AI provider: ${config.provider}`);
  }
}

// Provider-specific implementations

async function generateWithGemini(prompt: string, systemPrompt: string | undefined, config: AIProviderConfig): Promise<string> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: config.apiKey! });

  const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;

  const response = await ai.models.generateContent({
    model: config.model!,
    contents: fullPrompt
  });

  return response.text || '';
}

async function generateWithOpenAI(prompt: string, systemPrompt: string | undefined, config: AIProviderConfig): Promise<string> {
  const messages: any[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages
    })
  });

  const data = await response.json() as any;
  return data.choices?.[0]?.message?.content || '';
}

async function generateWithClaude(prompt: string, systemPrompt: string | undefined, config: AIProviderConfig): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 4096,
      system: systemPrompt || undefined,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  const data = await response.json() as any;
  return data.content?.[0]?.text || '';
}

async function generateWithOllama(prompt: string, systemPrompt: string | undefined, config: AIProviderConfig): Promise<string> {
  const response = await fetch(`${config.baseUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model,
      prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
      stream: false
    })
  });

  const data = await response.json() as any;
  return data.response || '';
}

async function generateWithLMStudio(prompt: string, systemPrompt: string | undefined, config: AIProviderConfig): Promise<string> {
  // LMStudio uses OpenAI-compatible API
  const messages: any[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });

  const response = await fetch(`${config.baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model,
      messages
    })
  });

  const data = await response.json() as any;
  return data.choices?.[0]?.message?.content || '';
}

// Chat implementations (similar pattern)
async function chatWithGemini(messages: ChatMessage[], systemPrompt: string | undefined, config: AIProviderConfig): Promise<AIResponse> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey: config.apiKey! });

  const chat = ai.chats.create({
    model: config.model!,
    config: { systemInstruction: systemPrompt }
  });

  const lastMessage = messages[messages.length - 1].content;
  const response = await chat.sendMessage({ message: lastMessage });

  return {
    text: response.text || '',
    toolCalls: response.functionCalls
  };
}

async function chatWithOpenAI(messages: ChatMessage[], systemPrompt: string | undefined, config: AIProviderConfig): Promise<AIResponse> {
  const apiMessages: any[] = [];
  if (systemPrompt) apiMessages.push({ role: 'system', content: systemPrompt });
  apiMessages.push(...messages);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: apiMessages
    })
  });

  const data = await response.json() as any;
  return { text: data.choices?.[0]?.message?.content || '' };
}

async function chatWithClaude(messages: ChatMessage[], systemPrompt: string | undefined, config: AIProviderConfig): Promise<AIResponse> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey!,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: 4096,
      system: systemPrompt || undefined,
      messages
    })
  });

  const data = await response.json() as any;
  return { text: data.content?.[0]?.text || '' };
}

async function chatWithOllama(messages: ChatMessage[], systemPrompt: string | undefined, config: AIProviderConfig): Promise<AIResponse> {
  const apiMessages = systemPrompt
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  const response = await fetch(`${config.baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model,
      messages: apiMessages,
      stream: false
    })
  });

  const data = await response.json() as any;
  return { text: data.message?.content || '' };
}

async function chatWithLMStudio(messages: ChatMessage[], systemPrompt: string | undefined, config: AIProviderConfig): Promise<AIResponse> {
  const apiMessages: any[] = [];
  if (systemPrompt) apiMessages.push({ role: 'system', content: systemPrompt });
  apiMessages.push(...messages);

  const response = await fetch(`${config.baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.model,
      messages: apiMessages
    })
  });

  const data = await response.json() as any;
  return { text: data.choices?.[0]?.message?.content || '' };
}
