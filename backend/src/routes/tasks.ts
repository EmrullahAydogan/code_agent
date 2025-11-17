import { Router } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { Task, ExecuteTaskRequest, TaskStatus, WebSocketEventType } from '@local-code-agent/shared';
import { executeTask } from '../services/task-executor';

export function taskRoutes(io: SocketIOServer) {
  const router = Router();

  // Get all tasks
  router.get('/', (req, res) => {
    try {
      const { agentId, projectId, status } = req.query;

      let query = 'SELECT * FROM tasks WHERE 1=1';
      const params: any[] = [];

      if (agentId) {
        query += ' AND agent_id = ?';
        params.push(agentId);
      }
      if (projectId) {
        query += ' AND project_id = ?';
        params.push(projectId);
      }
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC';

      const tasks = db.prepare(query).all(...params).map(deserializeTask);

      res.json({ success: true, data: tasks });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get task by ID
  router.get('/:id', (req, res) => {
    try {
      const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);

      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      res.json({ success: true, data: deserializeTask(task) });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Execute task
  router.post('/execute', async (req, res) => {
    try {
      const { agentId } = req.body;
      const request: ExecuteTaskRequest = req.body;

      if (!agentId) {
        return res.status(400).json({ success: false, error: 'Agent ID is required' });
      }

      // Check if agent exists
      const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(agentId);
      if (!agent) {
        return res.status(404).json({ success: false, error: 'Agent not found' });
      }

      const task: Task = {
        id: uuidv4(),
        agentId,
        projectId: request.projectId,
        prompt: request.prompt,
        status: TaskStatus.PENDING,
        createdAt: new Date(),
      };

      // Insert task
      const stmt = db.prepare(`
        INSERT INTO tasks (
          id, agent_id, project_id, prompt, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        task.id,
        task.agentId,
        task.projectId || null,
        task.prompt,
        task.status,
        task.createdAt.getTime()
      );

      // Emit task started event
      io.emit(WebSocketEventType.TASK_STARTED, {
        type: WebSocketEventType.TASK_STARTED,
        payload: task,
        timestamp: new Date(),
      });

      // Execute task asynchronously
      executeTask(task, agent, io).catch(error => {
        console.error('Task execution error:', error);
      });

      res.status(201).json({ success: true, data: task });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Cancel task
  router.post('/:id/cancel', (req, res) => {
    try {
      const taskId = req.params.id;

      const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      if (task.status !== TaskStatus.PENDING && task.status !== TaskStatus.RUNNING) {
        return res.status(400).json({
          success: false,
          error: 'Can only cancel pending or running tasks'
        });
      }

      db.prepare(`
        UPDATE tasks
        SET status = ?, completed_at = ?
        WHERE id = ?
      `).run(TaskStatus.CANCELLED, Date.now(), taskId);

      const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(taskId);

      // Emit WebSocket event
      io.emit(WebSocketEventType.TASK_CANCELLED, {
        type: WebSocketEventType.TASK_CANCELLED,
        payload: deserializeTask(updatedTask),
        timestamp: new Date(),
      });

      res.json({ success: true, data: deserializeTask(updatedTask) });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

function deserializeTask(row: any): Task {
  return {
    id: row.id,
    agentId: row.agent_id,
    projectId: row.project_id,
    prompt: row.prompt,
    status: row.status,
    result: row.result,
    error: row.error,
    startedAt: row.started_at ? new Date(row.started_at) : undefined,
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
    createdAt: new Date(row.created_at),
  };
}
