import { useState } from 'react';
import { Save, X, Plus, Trash2, Copy, Check } from 'lucide-react';
import clsx from 'clsx';

interface AgentTemplate {
  id?: string;
  name: string;
  description: string;
  provider: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  capabilities: string[];
  tags: string[];
  category: string;
}

interface AgentTemplateBuilderProps {
  initialTemplate?: Partial<AgentTemplate>;
  onSave: (template: AgentTemplate) => void;
  onCancel: () => void;
}

const PROVIDERS = [
  { value: 'gemini', label: 'Google Gemini' },
  { value: 'deepseek', label: 'DeepSeek' },
  { value: 'claude', label: 'Anthropic Claude' },
  { value: 'openai', label: 'OpenAI' },
];

const MODELS = {
  gemini: ['gemini-2.0-flash-exp', 'gemini-1.5-pro', 'gemini-1.5-flash'],
  deepseek: ['deepseek-chat', 'deepseek-coder'],
  claude: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
  openai: ['gpt-4-turbo-preview', 'gpt-4', 'gpt-3.5-turbo'],
};

const CATEGORIES = [
  'Code Generation',
  'Code Review',
  'Testing',
  'Documentation',
  'Debugging',
  'Refactoring',
  'Architecture',
  'General',
];

const PRESET_CAPABILITIES = [
  'Code Generation',
  'Code Review',
  'Bug Fixing',
  'Test Writing',
  'Documentation',
  'Refactoring',
  'API Integration',
  'Database Queries',
  'Security Analysis',
  'Performance Optimization',
];

const PRESET_TEMPLATES = [
  {
    name: 'Code Reviewer',
    description: 'Expert code reviewer focusing on best practices and potential issues',
    systemPrompt: `You are an expert code reviewer. Analyze code for:
- Code quality and maintainability
- Potential bugs and edge cases
- Performance issues
- Security vulnerabilities
- Best practices and design patterns
Provide constructive feedback with specific examples.`,
    capabilities: ['Code Review', 'Security Analysis', 'Performance Optimization'],
    category: 'Code Review',
  },
  {
    name: 'Test Generator',
    description: 'Generates comprehensive unit and integration tests',
    systemPrompt: `You are a test generation expert. Create comprehensive tests that:
- Cover edge cases and error scenarios
- Follow testing best practices
- Include meaningful assertions
- Are well-organized and readable
Use the appropriate testing framework for the language.`,
    capabilities: ['Test Writing', 'Code Generation'],
    category: 'Testing',
  },
  {
    name: 'Documentation Writer',
    description: 'Creates clear and comprehensive documentation',
    systemPrompt: `You are a documentation expert. Write clear, comprehensive documentation that:
- Explains purpose and usage
- Includes code examples
- Covers edge cases and gotchas
- Is well-structured and easy to navigate
Follow the project's documentation style guide.`,
    capabilities: ['Documentation', 'Code Generation'],
    category: 'Documentation',
  },
];

export const AgentTemplateBuilder = ({
  initialTemplate,
  onSave,
  onCancel,
}: AgentTemplateBuilderProps) => {
  const [template, setTemplate] = useState<AgentTemplate>({
    name: initialTemplate?.name || '',
    description: initialTemplate?.description || '',
    provider: initialTemplate?.provider || 'gemini',
    model: initialTemplate?.model || 'gemini-2.0-flash-exp',
    systemPrompt: initialTemplate?.systemPrompt || '',
    temperature: initialTemplate?.temperature ?? 0.7,
    maxTokens: initialTemplate?.maxTokens || 4096,
    capabilities: initialTemplate?.capabilities || [],
    tags: initialTemplate?.tags || [],
    category: initialTemplate?.category || 'General',
  });

  const [newCapability, setNewCapability] = useState('');
  const [newTag, setNewTag] = useState('');
  const [copiedTemplate, setCopiedTemplate] = useState(false);

  const updateTemplate = (updates: Partial<AgentTemplate>) => {
    setTemplate(prev => ({ ...prev, ...updates }));
  };

  const addCapability = (capability: string) => {
    if (capability && !template.capabilities.includes(capability)) {
      updateTemplate({ capabilities: [...template.capabilities, capability] });
    }
    setNewCapability('');
  };

  const removeCapability = (capability: string) => {
    updateTemplate({
      capabilities: template.capabilities.filter(c => c !== capability),
    });
  };

  const addTag = (tag: string) => {
    if (tag && !template.tags.includes(tag)) {
      updateTemplate({ tags: [...template.tags, tag] });
    }
    setNewTag('');
  };

  const removeTag = (tag: string) => {
    updateTemplate({ tags: template.tags.filter(t => t !== tag) });
  };

  const applyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    updateTemplate({
      name: preset.name,
      description: preset.description,
      systemPrompt: preset.systemPrompt,
      capabilities: preset.capabilities,
      category: preset.category,
    });
  };

  const copyTemplateJson = () => {
    navigator.clipboard.writeText(JSON.stringify(template, null, 2));
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(template);
  };

  const isValid = template.name && template.description && template.systemPrompt;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {initialTemplate ? 'Edit Template' : 'Create Agent Template'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Configure your agent template settings
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          <div className="p-6 space-y-6">
            {/* Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Start from Preset
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_TEMPLATES.map(preset => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="p-3 text-left border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                      {preset.name}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={template.name}
                  onChange={(e) => updateTemplate({ name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Code Reviewer"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={template.category}
                  onChange={(e) => updateTemplate({ category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={template.description}
                onChange={(e) => updateTemplate({ description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
                placeholder="Brief description of what this agent does..."
                required
              />
            </div>

            {/* Provider & Model */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Provider
                </label>
                <select
                  value={template.provider}
                  onChange={(e) => updateTemplate({
                    provider: e.target.value,
                    model: MODELS[e.target.value as keyof typeof MODELS][0],
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {PROVIDERS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Model
                </label>
                <select
                  value={template.model}
                  onChange={(e) => updateTemplate({ model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MODELS[template.provider as keyof typeof MODELS].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* System Prompt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                System Prompt *
              </label>
              <textarea
                value={template.systemPrompt}
                onChange={(e) => updateTemplate({ systemPrompt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="You are an expert..."
                required
              />
            </div>

            {/* Parameters */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Temperature: {template.temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={template.temperature}
                  onChange={(e) => updateTemplate({ temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Tokens
                </label>
                <input
                  type="number"
                  value={template.maxTokens}
                  onChange={(e) => updateTemplate({ maxTokens: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="256"
                  max="32768"
                  step="256"
                />
              </div>
            </div>

            {/* Capabilities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Capabilities
              </label>
              <div className="flex gap-2 mb-2">
                <select
                  value={newCapability}
                  onChange={(e) => {
                    addCapability(e.target.value);
                    e.target.value = '';
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a capability...</option>
                  {PRESET_CAPABILITIES.filter(c => !template.capabilities.includes(c)).map(cap => (
                    <option key={cap} value={cap}>{cap}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                {template.capabilities.map(cap => (
                  <span
                    key={cap}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                  >
                    {cap}
                    <button
                      type="button"
                      onClick={() => removeCapability(cap)}
                      className="hover:text-blue-900 dark:hover:text-blue-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag(newTag);
                    }
                  }}
                  placeholder="Add tag..."
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => addTag(newTag)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {template.tags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-gray-900 dark:hover:text-gray-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={copyTemplateJson}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {copiedTemplate ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy JSON
                </>
              )}
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isValid}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                Save Template
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
