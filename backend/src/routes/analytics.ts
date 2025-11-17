import { Router } from 'express';
import { db } from '../database';
import { AgentMetrics, TokenUsage } from '@local-code-agent/shared';

export function analyticsRoutes() {
  const router = Router();

  // Get agent metrics
  router.get('/agents/:agentId', (req, res) => {
    try {
      const { agentId } = req.params;

      // Get task statistics
      const taskStats = db.prepare(`
        SELECT
          COUNT(*) as total_tasks,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as successful_tasks,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_tasks,
          AVG(CASE
            WHEN completed_at IS NOT NULL AND started_at IS NOT NULL
            THEN completed_at - started_at
            ELSE NULL
          END) as avg_response_time
        FROM tasks
        WHERE agent_id = ?
      `).get(agentId) as any;

      // Get token usage statistics
      const tokenStats = db.prepare(`
        SELECT
          SUM(total_tokens) as total_tokens_used,
          SUM(estimated_cost) as total_cost
        FROM token_usage
        WHERE agent_id = ?
      `).get(agentId) as any;

      // Get last active time
      const lastActive = db.prepare(`
        SELECT MAX(created_at) as last_active
        FROM tasks
        WHERE agent_id = ?
      `).get(agentId) as any;

      const metrics: AgentMetrics = {
        agentId,
        totalTasks: taskStats.total_tasks || 0,
        successfulTasks: taskStats.successful_tasks || 0,
        failedTasks: taskStats.failed_tasks || 0,
        averageResponseTime: taskStats.avg_response_time || 0,
        totalTokensUsed: tokenStats.total_tokens_used || 0,
        totalCost: tokenStats.total_cost || 0,
        lastActive: lastActive.last_active ? new Date(lastActive.last_active) : new Date(),
      };

      res.json({ success: true, data: metrics });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get token usage history
  router.get('/token-usage', (req, res) => {
    try {
      const { agentId, startDate, endDate, limit = 100 } = req.query;

      let query = 'SELECT * FROM token_usage WHERE 1=1';
      const params: any[] = [];

      if (agentId) {
        query += ' AND agent_id = ?';
        params.push(agentId);
      }

      if (startDate) {
        query += ' AND created_at >= ?';
        params.push(new Date(startDate as string).getTime());
      }

      if (endDate) {
        query += ' AND created_at <= ?';
        params.push(new Date(endDate as string).getTime());
      }

      query += ' ORDER BY created_at DESC LIMIT ?';
      params.push(Number(limit));

      const usage = db.prepare(query).all(...params).map(deserializeTokenUsage);

      res.json({ success: true, data: usage });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get overall platform statistics
  router.get('/platform/stats', (req, res) => {
    try {
      const totalAgents = db.prepare('SELECT COUNT(*) as count FROM agents').get() as any;
      const totalTasks = db.prepare('SELECT COUNT(*) as count FROM tasks').get() as any;
      const totalProjects = db.prepare('SELECT COUNT(*) as count FROM projects').get() as any;
      const totalConversations = db.prepare('SELECT COUNT(*) as count FROM conversations').get() as any;

      const tokenStats = db.prepare(`
        SELECT
          SUM(total_tokens) as total_tokens,
          SUM(estimated_cost) as total_cost
        FROM token_usage
      `).get() as any;

      const taskStatusCounts = db.prepare(`
        SELECT
          status,
          COUNT(*) as count
        FROM tasks
        GROUP BY status
      `).all() as any[];

      const stats = {
        totalAgents: totalAgents.count,
        totalTasks: totalTasks.count,
        totalProjects: totalProjects.count,
        totalConversations: totalConversations.count,
        totalTokens: tokenStats.total_tokens || 0,
        totalCost: tokenStats.total_cost || 0,
        tasksByStatus: taskStatusCounts.reduce((acc, row) => {
          acc[row.status] = row.count;
          return acc;
        }, {}),
      };

      res.json({ success: true, data: stats });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get agent activity timeline
  router.get('/agents/:agentId/timeline', (req, res) => {
    try {
      const { agentId } = req.params;
      const { days = 30 } = req.query;

      const since = Date.now() - (Number(days) * 24 * 60 * 60 * 1000);

      const timeline = db.prepare(`
        SELECT
          DATE(created_at / 1000, 'unixepoch') as date,
          COUNT(*) as task_count,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_count,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_count
        FROM tasks
        WHERE agent_id = ? AND created_at >= ?
        GROUP BY date
        ORDER BY date DESC
      `).all(agentId, since);

      res.json({ success: true, data: timeline });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get cost breakdown by provider
  router.get('/cost-breakdown', (req, res) => {
    try {
      const { agentId, startDate, endDate } = req.query;

      let query = `
        SELECT
          provider,
          model,
          COUNT(*) as request_count,
          SUM(total_tokens) as total_tokens,
          SUM(estimated_cost) as total_cost
        FROM token_usage
        WHERE 1=1
      `;
      const params: any[] = [];

      if (agentId) {
        query += ' AND agent_id = ?';
        params.push(agentId);
      }

      if (startDate) {
        query += ' AND created_at >= ?';
        params.push(new Date(startDate as string).getTime());
      }

      if (endDate) {
        query += ' AND created_at <= ?';
        params.push(new Date(endDate as string).getTime());
      }

      query += ' GROUP BY provider, model ORDER BY total_cost DESC';

      const breakdown = db.prepare(query).all(...params);

      res.json({ success: true, data: breakdown });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

function deserializeTokenUsage(row: any): TokenUsage {
  return {
    id: row.id,
    agentId: row.agent_id,
    taskId: row.task_id,
    provider: row.provider,
    model: row.model,
    promptTokens: row.prompt_tokens,
    completionTokens: row.completion_tokens,
    totalTokens: row.total_tokens,
    estimatedCost: row.estimated_cost,
    createdAt: new Date(row.created_at),
  };
}
