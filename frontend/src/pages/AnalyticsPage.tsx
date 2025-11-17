import { useQuery } from '@tanstack/react-query';
import { analyticsApi, agentsApi } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Zap, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useState } from 'react';

export const AnalyticsPage = () => {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');

  const { data: platformStatsResponse } = useQuery({
    queryKey: ['platform-stats'],
    queryFn: async () => {
      const response = await analyticsApi.getPlatformStats();
      return response.data;
    },
  });

  const { data: agentsResponse } = useQuery({
    queryKey: ['agents'],
    queryFn: async () => {
      const response = await agentsApi.getAll();
      return response.data;
    },
  });

  const { data: agentMetricsResponse } = useQuery({
    queryKey: ['agent-metrics', selectedAgentId],
    queryFn: async () => {
      if (!selectedAgentId) return null;
      const response = await analyticsApi.getAgentMetrics(selectedAgentId);
      return response.data;
    },
    enabled: !!selectedAgentId,
  });

  const { data: costBreakdownResponse } = useQuery({
    queryKey: ['cost-breakdown', selectedAgentId],
    queryFn: async () => {
      const response = await analyticsApi.getCostBreakdown({
        agentId: selectedAgentId || undefined,
      });
      return response.data;
    },
  });

  const { data: timelineResponse } = useQuery({
    queryKey: ['agent-timeline', selectedAgentId],
    queryFn: async () => {
      if (!selectedAgentId) return null;
      const response = await analyticsApi.getAgentTimeline(selectedAgentId, 30);
      return response.data;
    },
    enabled: !!selectedAgentId,
  });

  const platformStats = platformStatsResponse?.data || {};
  const agents = agentsResponse?.data || [];
  const agentMetrics = agentMetricsResponse?.data;
  const costBreakdown = costBreakdownResponse?.data || [];
  const timeline = timelineResponse?.data || [];

  const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  const StatCard = ({ icon: Icon, label, value, color, subtext }: any) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
      {subtext && <div className="text-xs text-gray-400 mt-1">{subtext}</div>}
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor platform performance and usage statistics
        </p>
      </div>

      {/* Agent Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filter by Agent
        </label>
        <select
          value={selectedAgentId}
          onChange={(e) => setSelectedAgentId(e.target.value)}
          className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="">All Agents</option>
          {agents.map((agent: any) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      </div>

      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Zap}
          label="Total Tasks"
          value={platformStats.totalTasks || 0}
          color="bg-purple-600"
        />
        <StatCard
          icon={CheckCircle}
          label="Successful"
          value={platformStats.tasksByStatus?.completed || 0}
          color="bg-green-600"
          subtext={`${Math.round(((platformStats.tasksByStatus?.completed || 0) / (platformStats.totalTasks || 1)) * 100)}% success rate`}
        />
        <StatCard
          icon={DollarSign}
          label="Total Cost"
          value={`$${(platformStats.totalCost || 0).toFixed(4)}`}
          color="bg-orange-600"
          subtext={`${(platformStats.totalTokens || 0).toLocaleString()} tokens`}
        />
        <StatCard
          icon={TrendingUp}
          label="Active Agents"
          value={platformStats.totalAgents || 0}
          color="bg-blue-600"
          subtext={`${platformStats.totalProjects || 0} projects`}
        />
      </div>

      {/* Agent-specific Metrics */}
      {agentMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard
            icon={Zap}
            label="Agent Tasks"
            value={agentMetrics.totalTasks}
            color="bg-purple-600"
          />
          <StatCard
            icon={CheckCircle}
            label="Success Rate"
            value={`${Math.round((agentMetrics.successfulTasks / agentMetrics.totalTasks) * 100)}%`}
            color="bg-green-600"
            subtext={`${agentMetrics.successfulTasks} / ${agentMetrics.totalTasks}`}
          />
          <StatCard
            icon={Clock}
            label="Avg Response Time"
            value={`${(agentMetrics.averageResponseTime / 1000).toFixed(2)}s`}
            color="bg-blue-600"
          />
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Cost Breakdown */}
        {costBreakdown.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Breakdown by Model</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={costBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.model}: $${entry.total_cost.toFixed(4)}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="total_cost"
                >
                  {costBreakdown.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Token Usage */}
        {costBreakdown.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Token Usage by Model</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costBreakdown}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_tokens" fill="#8b5cf6" name="Total Tokens" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      {timeline.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeline}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="task_count" stroke="#8b5cf6" name="Total Tasks" />
              <Line type="monotone" dataKey="completed_count" stroke="#10b981" name="Completed" />
              <Line type="monotone" dataKey="failed_count" stroke="#ef4444" name="Failed" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Empty State */}
      {!selectedAgentId && platformStats.totalTasks === 0 && (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
          <TrendingUp className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No data yet</h3>
          <p className="text-sm text-gray-500">
            Start using agents to see analytics and insights
          </p>
        </div>
      )}
    </div>
  );
};
