import { Express } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { agentRoutes } from './agents';
import { taskRoutes } from './tasks';
import { projectRoutes } from './projects';
import { settingsRoutes } from './settings';

export function setupRoutes(app: Express, io: SocketIOServer) {
  // Pass io to routes that need to emit events
  app.use('/api/agents', agentRoutes(io));
  app.use('/api/tasks', taskRoutes(io));
  app.use('/api/projects', projectRoutes(io));
  app.use('/api/settings', settingsRoutes());
}
