import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileSearch,
  Plus,
  AlertCircle,
  AlertTriangle,
  Info,
  XCircle,
  CheckCircle,
  TrendingUp,
  Shield,
  Zap,
  Code
} from 'lucide-react';
import clsx from 'clsx';
import { codeReviewsApi } from '../services/api';
import { CodeReview, ReviewSeverity } from '@local-code-agent/shared';

export const CodeReviewsPage = () => {
  const [selectedReview, setSelectedReview] = useState<CodeReview | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['code-reviews'],
    queryFn: async () => {
      const response = await codeReviewsApi.getAll();
      return response.data.data;
    },
  });

  const getSeverityIcon = (severity: ReviewSeverity) => {
    switch (severity) {
      case ReviewSeverity.CRITICAL:
        return <XCircle className="w-4 h-4 text-red-600" />;
      case ReviewSeverity.ERROR:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case ReviewSeverity.WARNING:
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case ReviewSeverity.INFO:
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: ReviewSeverity) => {
    switch (severity) {
      case ReviewSeverity.CRITICAL:
        return 'bg-red-100 text-red-700 border-red-200';
      case ReviewSeverity.ERROR:
        return 'bg-red-50 text-red-700 border-red-200';
      case ReviewSeverity.WARNING:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case ReviewSeverity.INFO:
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'security':
        return <Shield className="w-4 h-4" />;
      case 'performance':
        return <Zap className="w-4 h-4" />;
      case 'bugs':
        return <AlertCircle className="w-4 h-4" />;
      case 'style':
        return <Code className="w-4 h-4" />;
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Code Reviews</h1>
            <p className="mt-2 text-gray-600">
              AI-powered code analysis for security, bugs, performance, and style
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Review
          </button>
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading reviews...</p>
        </div>
      ) : reviews && reviews.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedReview(review)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <FileSearch className="w-5 h-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-900">
                      Review #{review.id.slice(0, 8)}
                    </h3>
                    <div className="flex items-center gap-2">
                      <TrendingUp className={clsx('w-4 h-4', getScoreColor(review.score))} />
                      <span className={clsx('text-2xl font-bold', getScoreColor(review.score))}>
                        {review.score}
                      </span>
                      <span className="text-sm text-gray-500">/100</span>
                    </div>
                    {review.status === 'completed' ? (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                        <CheckCircle className="w-3 h-3" />
                        Completed
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                        <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        Analyzing
                      </div>
                    )}
                  </div>

                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                    <div>Project: {review.projectId.slice(0, 8)}</div>
                    <div>Agent: {review.agentId.slice(0, 8)}</div>
                    <div>{new Date(review.createdAt).toLocaleString()}</div>
                  </div>

                  {/* Summary */}
                  {review.summary && (
                    <p className="mt-3 text-gray-700">{review.summary}</p>
                  )}

                  {/* Issues Summary */}
                  {review.issues && review.issues.length > 0 && (
                    <div className="mt-4">
                      <div className="flex gap-2 flex-wrap">
                        {[ReviewSeverity.CRITICAL, ReviewSeverity.ERROR, ReviewSeverity.WARNING, ReviewSeverity.INFO].map((severity) => {
                          const count = review.issues.filter(i => i.severity === severity).length;
                          if (count === 0) return null;
                          return (
                            <div
                              key={severity}
                              className={clsx(
                                'flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border',
                                getSeverityColor(severity)
                              )}
                            >
                              {getSeverityIcon(severity)}
                              {count} {severity}
                            </div>
                          );
                        })}
                      </div>

                      {/* Category Breakdown */}
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {Array.from(new Set(review.issues.map(i => i.category))).map(category => {
                          const count = review.issues.filter(i => i.category === category).length;
                          return (
                            <div
                              key={category}
                              className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                            >
                              {getCategoryIcon(category)}
                              {category}: {count}
                            </div>
                          );
                        })}
                      </div>

                      {/* Top Issues Preview */}
                      <div className="mt-4 space-y-2">
                        {review.issues.slice(0, 3).map((issue, idx) => (
                          <div
                            key={idx}
                            className={clsx(
                              'p-3 rounded border',
                              getSeverityColor(issue.severity)
                            )}
                          >
                            <div className="flex items-start gap-2">
                              {getSeverityIcon(issue.severity)}
                              <div className="flex-1">
                                <div className="font-medium">{issue.message}</div>
                                {issue.file && (
                                  <div className="text-xs mt-1 opacity-75">
                                    {issue.file}{issue.line && `:${issue.line}`}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        {review.issues.length > 3 && (
                          <div className="text-sm text-gray-500 text-center">
                            +{review.issues.length - 3} more issues
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileSearch className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No code reviews yet</h3>
          <p className="text-gray-600 mb-4">
            Start your first AI-powered code review to identify issues
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Create Review
          </button>
        </div>
      )}

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-bold mb-4">Create Code Review</h2>
            <p className="text-gray-600 mb-4">
              Code review creation form will be implemented here
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
