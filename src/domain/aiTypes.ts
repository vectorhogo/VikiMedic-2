/**
 * VikiMedic v2 - AI Types & Configurations
 * Clean Architecture Layer: Domain
 * AI Patch 01 - Viki Assistant Online Mode
 */

export type AIProviderType = 'gemini' | 'openrouter' | 'openai' | 'ollama' | 'custom';

export type AIMode = 'OFFLINE' | 'ONLINE';

export interface AISettingsConfig {
  enabled: boolean; // Global admin disable/enable switch
  mode: AIMode; // Current assistant mode (OFFLINE default)
  provider: AIProviderType;
  apiKey: string;
  baseUrl: string;
  modelName: string;
  requestTimeoutMs: number; // Default 15000 ms
  maxTokens: number; // Default 1000
  temperature: number; // Default 0.7
  streaming: boolean;
  historyLength: number; // Max messages in conversation context (Default 10)
  autoSaveChat: boolean;
  offlineFallback: boolean; // Auto-fallback if online API fails (Default true)
  privacyNoticeAccepted: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'viki' | 'user';
  text: string;
  time: string;
  modeUsed?: AIMode;
  providerUsed?: string;
  error?: boolean;
}

export interface AIProviderRequest {
  prompt: string;
  history: ChatMessage[];
  config: AISettingsConfig;
  systemContext?: string;
}

export interface AIProviderResponse {
  success: boolean;
  text: string;
  error?: string;
  errorType?: 'TIMEOUT' | 'INVALID_KEY' | 'NETWORK_ERROR' | 'SERVER_ERROR' | 'DISABLED' | 'UNKNOWN';
  latencyMs?: number;
}

export const DEFAULT_AI_SETTINGS: AISettingsConfig = {
  enabled: true,
  mode: 'OFFLINE',
  provider: 'gemini',
  apiKey: '',
  baseUrl: 'https://generativelanguage.googleapis.com',
  modelName: 'gemini-2.5-flash',
  requestTimeoutMs: 15000,
  maxTokens: 1000,
  temperature: 0.7,
  streaming: true,
  historyLength: 10,
  autoSaveChat: true,
  offlineFallback: true,
  privacyNoticeAccepted: false,
};

export const PROVIDER_DEFAULT_BASE_URLS: Record<AIProviderType, string> = {
  gemini: 'https://generativelanguage.googleapis.com',
  openrouter: 'https://openrouter.ai/api/v1',
  openai: 'https://api.openai.com/v1',
  ollama: 'http://localhost:11434/v1',
  custom: 'https://api.openai.com/v1',
};

export const PROVIDER_DEFAULT_MODELS: Record<AIProviderType, string> = {
  gemini: 'gemini-2.5-flash',
  openrouter: 'deepseek/deepseek-chat',
  openai: 'gpt-4o-mini',
  ollama: 'llama3.1',
  custom: 'gpt-3.5-turbo',
};
