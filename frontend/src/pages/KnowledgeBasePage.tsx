import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Database,
  Plus,
  Search,
  FileText,
  Sparkles,
  Loader2,
  BookOpen,
  Hash
} from 'lucide-react';
import clsx from 'clsx';
import { knowledgeBasesApi } from '../services/api';
import { KnowledgeBase, SearchResult } from '@local-code-agent/shared';

export const KnowledgeBasePage = () => {
  const [selectedKB, setSelectedKB] = useState<KnowledgeBase | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const queryClient = useQueryClient();

  const { data: knowledgeBases, isLoading } = useQuery({
    queryKey: ['knowledge-bases'],
    queryFn: async () => {
      const response = await knowledgeBasesApi.getAll();
      return response.data.data;
    },
  });

  const indexMutation = useMutation({
    mutationFn: ({ kbId, files }: { kbId: string; files?: string[] }) =>
      knowledgeBasesApi.index(kbId, { files }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['knowledge-bases'] });
    },
  });

  const handleSearch = async (kbId: string, query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await knowledgeBasesApi.search(kbId, { query, limit: 10 });
      setSearchResults(response.data.data || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Knowledge Bases</h1>
            <p className="mt-2 text-gray-600">
              Semantic search across your project documentation with RAG
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Knowledge Base
          </button>
        </div>
      </div>

      {/* Knowledge Bases List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading knowledge bases...</p>
        </div>
      ) : knowledgeBases && knowledgeBases.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {knowledgeBases.map((kb) => (
            <div
              key={kb.id}
              className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Database className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {kb.name}
                      </h3>
                      {kb.status === 'indexing' && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Indexing
                        </div>
                      )}
                      {kb.status === 'ready' && (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          <Sparkles className="w-3 h-3" />
                          Ready
                        </div>
                      )}
                    </div>

                    {kb.description && (
                      <p className="mt-2 text-gray-600">{kb.description}</p>
                    )}

                    {/* Stats */}
                    <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <FileText className="w-4 h-4" />
                        {kb.documentCount || 0} documents
                      </div>
                      <div className="flex items-center gap-1">
                        <Hash className="w-4 h-4" />
                        {kb.chunkCount || 0} chunks
                      </div>
                    </div>

                    {kb.lastIndexed && (
                      <div className="mt-2 text-xs text-gray-500">
                        Last indexed: {new Date(kb.lastIndexed).toLocaleString()}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => indexMutation.mutate({ kbId: kb.id })}
                    disabled={kb.status === 'indexing'}
                    className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Re-index Knowledge Base"
                  >
                    <Sparkles className="w-5 h-5" />
                  </button>
                </div>

                {/* Search Interface */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        value={selectedKB?.id === kb.id ? searchQuery : ''}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          setSelectedKB(kb);
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSearch(kb.id, searchQuery);
                          }
                        }}
                        placeholder="Search in this knowledge base..."
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <button
                      onClick={() => handleSearch(kb.id, searchQuery)}
                      disabled={isSearching || !searchQuery.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSearching ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Search className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Search Results */}
                  {selectedKB?.id === kb.id && searchResults.length > 0 && (
                    <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                      {searchResults.map((result, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-gray-50 rounded border border-gray-200"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-900">
                                {result.file}
                              </div>
                              <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {result.content}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 whitespace-nowrap">
                              Score: {result.score.toFixed(2)}
                            </div>
                          </div>
                          {result.metadata && (
                            <div className="mt-2 text-xs text-gray-500">
                              Lines {result.metadata.startLine}-{result.metadata.endLine}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {selectedKB?.id === kb.id && searchResults.length === 0 && searchQuery && !isSearching && (
                    <div className="mt-4 text-center text-gray-500 text-sm py-4">
                      No results found for "{searchQuery}"
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No knowledge bases yet</h3>
          <p className="text-gray-600 mb-4">
            Create your first knowledge base to enable semantic search across your docs
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Knowledge Base
          </button>
        </div>
      )}

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create Knowledge Base</h2>
            <p className="text-gray-600 mb-4">
              Knowledge base creation form will be implemented here
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
