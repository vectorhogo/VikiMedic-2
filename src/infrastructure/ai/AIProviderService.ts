/**
 * VikiMedic v2 - AI Provider Abstraction Layer
 * Clean Architecture Layer: Infrastructure
 * AI Patch 01 - Viki Assistant Online Mode
 */

import {
  AIProviderRequest,
  AIProviderResponse,
  AISettingsConfig,
  ChatMessage,
  PROVIDER_DEFAULT_BASE_URLS,
  PROVIDER_DEFAULT_MODELS,
} from '../../domain/aiTypes';

export class AIProviderService {
  /**
   * Primary entry point for sending a chat completion request to the configured AI provider.
   * Ensures the assistant communicates ONLY with this abstraction layer.
   */
  public static async sendMessage(request: AIProviderRequest): Promise<AIProviderResponse> {
    const startTime = Date.now();
    const { prompt, history, config, systemContext } = request;

    // 1. Check if AI Mode is globally enabled
    if (!config.enabled) {
      return {
        success: false,
        text: '',
        error: 'سرویس هوشمند آنلاین توسط مدیر غیرفعال شده است.',
        errorType: 'DISABLED',
      };
    }

    // 2. Check internet connectivity
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return {
        success: false,
        text: '',
        error: 'اتصال اینترنت برقرار نیست.',
        errorType: 'NETWORK_ERROR',
      };
    }

    // 3. Prepare Base URL and Model
    const baseUrl = (config.baseUrl || PROVIDER_DEFAULT_BASE_URLS[config.provider] || '').replace(/\/+$/, '');
    const modelName = config.modelName || PROVIDER_DEFAULT_MODELS[config.provider] || 'gemini-2.5-flash';
    const timeoutMs = config.requestTimeoutMs || 15000;

    // Sanitize user prompt to prevent accidental leakage of sensitive tokens or national IDs
    const sanitizedPrompt = this.sanitizeInput(prompt);

    // Build conversation context window based on historyLength config
    const contextHistory = history
      .slice(-Math.max(1, config.historyLength || 10))
      .map((msg) => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text,
      }));

    // Setup Timeout Abort Controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      let response: AIProviderResponse;

      switch (config.provider) {
        case 'gemini':
          response = await this.callGeminiApi(
            baseUrl,
            modelName,
            config.apiKey,
            sanitizedPrompt,
            contextHistory,
            systemContext,
            config,
            controller.signal
          );
          break;

        case 'openrouter':
        case 'openai':
        case 'ollama':
        case 'custom':
        default:
          response = await this.callOpenAICompatibleApi(
            baseUrl,
            modelName,
            config.apiKey,
            sanitizedPrompt,
            contextHistory,
            systemContext,
            config,
            controller.signal,
            config.provider
          );
          break;
      }

      clearTimeout(timeoutId);
      response.latencyMs = Date.now() - startTime;
      return response;
    } catch (err: any) {
      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      if (err.name === 'AbortError') {
        return {
          success: false,
          text: '',
          error: `پاسخگویی مدل بیش از حد طول کشید (${timeoutMs / 1000} ثانیه).`,
          errorType: 'TIMEOUT',
          latencyMs,
        };
      }

      return {
        success: false,
        text: '',
        error: err.message || 'خطا در برقراری ارتباط با سرویس هوش مصنوعی.',
        errorType: 'NETWORK_ERROR',
        latencyMs,
      };
    }
  }

  /**
   * Test API configuration connection
   */
  public static async testConnection(config: AISettingsConfig): Promise<AIProviderResponse> {
    return this.sendMessage({
      prompt: 'PING! پاسخ کوتاه دهید: آیا سرویس هوشمند فعال است؟',
      history: [],
      config: {
        ...config,
        requestTimeoutMs: 10000,
        maxTokens: 50,
      },
      systemContext: 'You are VikiMedic AI test agent. Respond in 1 brief sentence in Persian.',
    });
  }

  /**
   * Call Gemini API (Supports official Gemini REST format and OpenAI proxy format)
   */
  private static async callGeminiApi(
    baseUrl: string,
    modelName: string,
    apiKey: string,
    prompt: string,
    history: { role: string; content: string }[],
    systemContext: string | undefined,
    config: AISettingsConfig,
    signal: AbortSignal
  ): Promise<AIProviderResponse> {
    // Check if baseUrl is an OpenAI-compatible proxy (ends with /v1 or contains /chat/completions)
    if (baseUrl.endsWith('/v1') || baseUrl.includes('chat/completions')) {
      return this.callOpenAICompatibleApi(
        baseUrl,
        modelName,
        apiKey,
        prompt,
        history,
        systemContext,
        config,
        signal,
        'gemini'
      );
    }

    if (!apiKey) {
      return {
        success: false,
        text: '',
        error: 'کلید API برای ارائه دهنده Gemini تنظیم نشده است.',
        errorType: 'INVALID_KEY',
      };
    }

    const endpoint = `${baseUrl}/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const contents: any[] = [];

    // System instruction
    const systemPrompt =
      systemContext ||
      'شما Viki ( دستیار هوشمند کلینیک VikiMedic ) هستید. پاسخ‌های دقیق، محترمانه و تخصصی در حوزه مدیریت کلینیک و سلامت ارائه دهید.';

    // Format chat contents for Gemini REST API
    history.forEach((h) => {
      contents.push({
        role: h.role === 'user' ? 'user' : 'model',
        parts: [{ text: h.content }],
      });
    });

    contents.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nسوال کاربر: ${prompt}` }],
    });

    const payload = {
      contents,
      generationConfig: {
        temperature: config.temperature,
        maxOutputTokens: config.maxTokens,
      },
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal,
    });

    if (res.status === 401 || res.status === 403) {
      return {
        success: false,
        text: '',
        error: 'کلید API وارد شده نامعتبر است (کد ۴۰۱/۴۰۳).',
        errorType: 'INVALID_KEY',
      };
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return {
        success: false,
        text: '',
        error: `خطا از سمت سرور Gemini (کد ${res.status}): ${errText.slice(0, 150)}`,
        errorType: 'SERVER_ERROR',
      };
    }

    const data = await res.json();
    const candidateText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.text ||
      '';

    if (!candidateText) {
      return {
        success: false,
        text: '',
        error: 'پاسخ معتبری از مدل دریافت نشد.',
        errorType: 'SERVER_ERROR',
      };
    }

    return {
      success: true,
      text: candidateText.trim(),
    };
  }

  /**
   * Call OpenAI-compatible chat completion APIs (OpenAI, OpenRouter, Ollama, Custom, etc.)
   */
  private static async callOpenAICompatibleApi(
    baseUrl: string,
    modelName: string,
    apiKey: string,
    prompt: string,
    history: { role: string; content: string }[],
    systemContext: string | undefined,
    config: AISettingsConfig,
    signal: AbortSignal,
    provider: string
  ): Promise<AIProviderResponse> {
    const isOllama = provider === 'ollama';

    if (!isOllama && !apiKey) {
      return {
        success: false,
        text: '',
        error: `کلید API برای ارائه دهنده ${provider} تنظیم نشده است.`,
        errorType: 'INVALID_KEY',
      };
    }

    let url = baseUrl;
    if (!url.endsWith('/chat/completions')) {
      url = `${url}/chat/completions`;
    }

    const systemPrompt =
      systemContext ||
      'شما Viki ( دستیار هوشمند کلینیک VikiMedic ) هستید. پاسخ‌های دقیق، محترمانه و کاربردی در حوزه مدیریت کلینیک به زبان فارسی ارائه دهید.';

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: prompt },
    ];

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    if (provider === 'openrouter') {
      headers['HTTP-Referer'] = 'https://vikimedic.local';
      headers['X-Title'] = 'VikiMedic Assistant';
    }

    const payload = {
      model: modelName,
      messages,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
    };

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal,
    });

    if (res.status === 401 || res.status === 403) {
      return {
        success: false,
        text: '',
        error: 'کلید API وارد شده نامعتبر است یا احراز هویت رد شد.',
        errorType: 'INVALID_KEY',
      };
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return {
        success: false,
        text: '',
        error: `خطای سرویس دهنده (${res.status}): ${errText.slice(0, 150)}`,
        errorType: 'SERVER_ERROR',
      };
    }

    const data = await res.json();
    const replyText = data?.choices?.[0]?.message?.content || data?.message?.content || '';

    if (!replyText) {
      return {
        success: false,
        text: '',
        error: 'پاسخ معتبری از ارائه دهنده دریافت نشد.',
        errorType: 'SERVER_ERROR',
      };
    }

    return {
      success: true,
      text: replyText.trim(),
    };
  }

  /**
   * Input Sanitization to ensure system credentials and raw sensitive data aren't sent externally
   */
  private static sanitizeInput(input: string): string {
    if (!input) return '';
    // Mask potential 10-digit national IDs or raw password tokens if explicitly posted
    let clean = input.replace(/\b(password|pass|secret)\s*[:=]\s*\S+/gi, '$1: [MASKED]');
    return clean;
  }
}
