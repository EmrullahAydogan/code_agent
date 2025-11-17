import { Express } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { healthRoutes } from './health';
import { agentRoutes } from './agents';
import { taskRoutes } from './tasks';
import { projectRoutes } from './projects';
import { settingsRoutes } from './settings';
import { conversationRoutes } from './conversations';
import { templateRoutes } from './templates';
import { analyticsRoutes } from './analytics';
import { workflowRoutes } from './workflows';
import { codeReviewRoutes } from './code-review';
import { testingRoutes } from './testing';
import { knowledgeBaseRoutes } from './knowledge-base';
import { pluginRoutes } from './plugins';

export function setupRoutes(app: Express, io: SocketIOServer) {
  // Health check
  app.use('/api/health', healthRoutes());

  // Core routes
  app.use('/api/agents', agentRoutes(io));
  app.use('/api/tasks', taskRoutes(io));
  app.use('/api/projects', projectRoutes(io));
  app.use('/api/settings', settingsRoutes());
  app.use('/api/conversations', conversationRoutes(io));
  app.use('/api/templates', templateRoutes());
  app.use('/api/analytics', analyticsRoutes());

  // Advanced features
  app.use('/api/workflows', workflowRoutes(io));
  app.use('/api/code-reviews', codeReviewRoutes());
  app.use('/api/testing', testingRoutes());
  app.use('/api/knowledge-bases', knowledgeBaseRoutes());
  app.use('/api/plugins', pluginRoutes());
}
