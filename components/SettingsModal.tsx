import React, { useState, useEffect } from 'react';
import { X, Bot, Cloud, Server, Sparkles, Check } from 'lucide-react';

interface AIProviderConfig {
  provider: 'gemini' | 'openai' | 'claude' | 'ollama' | 'lmstudio' | 'none';
  apiKey?: string;
  model?: string;
  baseUrl?: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isFirstRun?: boolean;
}

const PROVIDERS = [
  {
    id: 'gemini' as const,
    name: 'Google Gemini',
    description: 'Fast and free tier available',
    icon: Sparkles,
    requiresKey: true,
    getKeyUrl: 'https://aistudio.google.com/app/apikey',
    defaultModel: 'gemini-2.5-flash'
  },
  {
    id: 'openai' as const,
    name: 'OpenAI',
    description: 'GPT-4 and ChatGPT',
    icon: Bot,
    requiresKey: true,
    getKeyUrl: 'https://platform.openai.com/api-keys',
    defaultModel: 'gpt-4-turbo-preview'
  },
  {
    id: 'claude' as const,
    name: 'Anthropic Claude',
    description: 'Claude Sonnet and Opus',
    icon: Cloud,
    requiresKey: true,
    getKeyUrl: 'https://console.anthropic.com',
    defaultModel: 'claude-3-5-sonnet-20241022'
  },
  {
    id: 'ollama' as const,
    name: 'Ollama',
    description: 'Run models locally (no API key needed)',
    icon: Server,
    requiresKey: false,
    defaultModel: 'llama3.2',
    defaultBaseUrl: 'http://localhost:11434'
  },
  {
    id: 'lmstudio' as const,
    name: 'LM Studio',
    description: 'Local models (no API key needed)',
    icon: Server,
    requiresKey: false,
    defaultModel: 'local-model',
    defaultBaseUrl: 'http://localhost:1234'
  }
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, isFirstRun = false }) => {
  const [selectedProvider, setSelectedProvider] = useState<typeof PROVIDERS[number] | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [model, setModel] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // Load saved configuration
    const savedConfig = localStorage.getItem('ai_provider_config');
    if (savedConfig) {
      try {
        const config: AIProviderConfig = JSON.parse(savedConfig);
        if (config.provider !== 'none') {
          const provider = PROVIDERS.find(p => p.id === config.provider);
          if (provider) {
            setSelectedProvider(provider);
            setApiKey(config.apiKey || '');
            setBaseUrl(config.baseUrl || provider.defaultBaseUrl || '');
            setModel(config.model || provider.defaultModel);
          }
        }
      } catch (e) {
        console.error('Failed to load AI config:', e);
      }
    }
  }, [isOpen]);

  const handleProviderSelect = (provider: typeof PROVIDERS[number]) => {
    setSelectedProvider(provider);
    setApiKey('');
    setBaseUrl(provider.defaultBaseUrl || '');
    setModel(provider.defaultModel);
    setSaved(false);
  };

  const handleSave = async () => {
    if (!selectedProvider) return;

    const config: AIProviderConfig = {
      provider: selectedProvider.id,
      apiKey: selectedProvider.requiresKey ? apiKey : undefined,
      baseUrl: !selectedProvider.requiresKey ? baseUrl : undefined,
      model: model || selectedProvider.defaultModel
    };

    // Save to localStorage
    localStorage.setItem('ai_provider_config', JSON.stringify(config));
    localStorage.setItem('ai_setup_complete', 'true');

    // Send to backend API
    try {
      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/provider-config`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        console.error('Failed to update backend configuration');
      }
    } catch (error) {
      console.error('Error sending config to backend:', error);
    }

    setSaved(true);

    setTimeout(() => {
      onClose();
      // Reload to apply new configuration
      if (!isFirstRun) {
        window.location.reload();
      }
    }, 1000);
  };

  const handleSkip = () => {
    const config: AIProviderConfig = { provider: 'none' };
    localStorage.setItem('ai_provider_config', JSON.stringify(config));
    localStorage.setItem('ai_setup_complete', 'true');
    onClose();
  };

  if (!isOpen) return null;

  const canSave = selectedProvider && (
    !selectedProvider.requiresKey ||
    (selectedProvider.requiresKey && apiKey.trim().length > 0)
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b dark:border-slate-700 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isFirstRun ? 'Welcome to Smart Calendar!' : 'AI Provider Settings'}
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                {isFirstRun
                  ? 'Choose an AI provider for smart features, or skip to use without AI'
                  : 'Configure your AI provider settings'}
              </p>
            </div>
            {!isFirstRun && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Provider Selection */}
        <div className="p-6 space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white mb-3">Select AI Provider:</h3>
          <div className="grid gap-3">
            {PROVIDERS.map((provider) => {
              const Icon = provider.icon;
              const isSelected = selectedProvider?.id === provider.id;
              return (
                <button
                  key={provider.id}
                  onClick={() => handleProviderSelect(provider)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-6 h-6 mt-0.5 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900 dark:text-white">{provider.name}</h4>
                        {!provider.requiresKey && (
                          <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full">
                            No API key needed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{provider.description}</p>
                    </div>
                    {isSelected && <Check className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Configuration Form */}
          {selectedProvider && (
            <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg space-y-4">
              <h4 className="font-semibold text-slate-900 dark:text-white">Configure {selectedProvider.name}</h4>

              {selectedProvider.requiresKey ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      API Key *
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your API key"
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
                               bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                               focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <a
                      href={selectedProvider.getKeyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mt-1 inline-block"
                    >
                      Get your API key →
                    </a>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Model (optional)
                    </label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder={selectedProvider.defaultModel}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
                               bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                               focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Base URL
                    </label>
                    <input
                      type="text"
                      value={baseUrl}
                      onChange={(e) => setBaseUrl(e.target.value)}
                      placeholder={selectedProvider.defaultBaseUrl}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
                               bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                               focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Model Name
                    </label>
                    <input
                      type="text"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      placeholder={selectedProvider.defaultModel}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600
                               bg-white dark:bg-slate-800 text-slate-900 dark:text-white
                               focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Make sure {selectedProvider.name} is running locally on your machine.
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t dark:border-slate-700 p-6">
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleSkip}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              {isFirstRun ? 'Skip for now' : 'Cancel'}
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave || saved}
              className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                canSave && !saved
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4" />
                  Saved!
                </>
              ) : (
                'Save Configuration'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
