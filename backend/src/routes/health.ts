import { Router } from 'express';
import { db } from '../database';

export function healthRoutes() {
  const router = Router();

  router.get('/', (req, res) => {
    try {
      // Check database connection
      const dbCheck = db.prepare('SELECT 1').get();
      const dbHealthy = !!dbCheck;

      // Get database stats
      const agents = db.prepare('SELECT COUNT(*) as count FROM agents').get() as any;
      const projects = db.prepare('SELECT COUNT(*) as count FROM projects').get() as any;
      const tasks = db.prepare('SELECT COUNT(*) as count FROM tasks').get() as any;

      // Check environment
      const hasGemini = !!process.env.GEMINI_API_KEY;
      const hasDeepSeek = !!process.env.DEEPSEEK_API_KEY;
      const hasClaude = !!process.env.CLAUDE_API_KEY;
      const hasOpenAI = !!process.env.OPENAI_API_KEY;

      const providersConfigured = [hasGemini, hasDeepSeek, hasClaude, hasOpenAI].filter(Boolean).length;

      const health = {
        status: dbHealthy && providersConfigured > 0 ? 'healthy' : 'degraded',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
          status: dbHealthy ? 'connected' : 'disconnected',
          agents: agents.count,
          projects: projects.count,
          tasks: tasks.count,
        },
        providers: {
          configured: providersConfigured,
          gemini: hasGemini,
          deepseek: hasDeepSeek,
          claude: hasClaude,
          openai: hasOpenAI,
        },
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          },
        },
      };

      res.json(health);
    } catch (error: any) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      });
    }
  });

  return router;
}
