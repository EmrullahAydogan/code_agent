import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesApi } from '../services/api';
import { AgentTemplate, AIProvider } from '@local-code-agent/shared';
import { Search, Download, Star, Sparkles } from 'lucide-react';
import { CreateAgentFromTemplateModal } from '../components/CreateAgentFromTemplateModal';

export const TemplatesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<AgentTemplate | null>(null);
  const queryClient = useQueryClient();

  const { data: templatesResponse, isLoading } = useQuery({
    queryKey: ['templates', selectedCategory, searchQuery],
    queryFn: async () => {
      const response = await templatesApi.getAll({
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
      });
      return response.data;
    },
  });

  const { data: categoriesResponse } = useQuery({
    queryKey: ['template-categories'],
    queryFn: async () => {
      const response = await templatesApi.getCategories();
      return response.data;
    },
  });

  const templates = templatesResponse?.data || [];
  const categories = categoriesResponse?.data || [];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Development: 'bg-blue-100 text-blue-700',
      Frontend: 'bg-purple-100 text-purple-700',
      Backend: 'bg-green-100 text-green-700',
      DevOps: 'bg-orange-100 text-orange-700',
      Quality: 'bg-pink-100 text-pink-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-900">Agent Templates</h1>
        </div>
        <p className="text-sm text-gray-500">
          Start quickly with pre-configured agent templates
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === ''
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading templates...</div>
        </div>
      ) : templates.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
          <Sparkles className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template: AgentTemplate) => (
            <div
              key={template.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => setSelectedTemplate(template)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                    {template.name}
                  </h3>
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCategoryColor(template.category)}`}>
                    {template.category}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {template.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {template.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
                  >
                    #{tag}
                  </span>
                ))}
                {template.tags.length > 3 && (
                  <span className="px-2 py-0.5 text-gray-400 text-xs">
                    +{template.tags.length - 3} more
                  </span>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    {template.downloads}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {template.rating}
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-mono">
                  {template.providerConfig.model}
                </span>
              </div>

              {/* Hover overlay */}
              <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                  Use Template
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Agent Modal */}
      {selectedTemplate && (
        <CreateAgentFromTemplateModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onSuccess={() => {
            setSelectedTemplate(null);
            queryClient.invalidateQueries({ queryKey: ['templates'] });
          }}
        />
      )}
    </div>
  );
};
