import { Server as SocketIOServer } from 'socket.io';
import { Task, TaskStatus, WebSocketEventType, AIMessage } from '@local-code-agent/shared';
import { db } from '../database';
import { createProvider } from '../providers';

export async function executeTask(task: Task, agent: any, io: SocketIOServer) {
  try {
    // Update task status to running
    db.prepare(`
      UPDATE tasks
      SET status = ?, started_at = ?
      WHERE id = ?
    `).run(TaskStatus.RUNNING, Date.now(), task.id);

    // Emit running event
    io.emit(WebSocketEventType.TASK_PROGRESS, {
      type: WebSocketEventType.TASK_PROGRESS,
      payload: {
        ...task,
        status: TaskStatus.RUNNING,
        startedAt: new Date(),
      },
      timestamp: new Date(),
    });

    // Create AI provider
    const provider = createProvider(
      agent.provider,
      agent.api_key,
      agent.base_url
    );

    // Build messages
    const messages: AIMessage[] = [];

    if (agent.system_prompt) {
      messages.push({
        role: 'system',
        content: agent.system_prompt,
      });
    }

    messages.push({
      role: 'user',
      content: task.prompt,
    });

    // Execute with streaming
    let fullResponse = '';
    const response = await provider.streamChat(
      {
        messages,
        model: agent.model,
        maxTokens: agent.max_tokens,
        temperature: agent.temperature,
        stream: true,
      },
      (chunk) => {
        fullResponse += chunk;
        // Emit progress with partial response
        io.emit(WebSocketEventType.TASK_PROGRESS, {
          type: WebSocketEventType.TASK_PROGRESS,
          payload: {
            ...task,
            status: TaskStatus.RUNNING,
            result: fullResponse,
          },
          timestamp: new Date(),
        });
      }
    );

    // Check if task was cancelled during execution
    const currentTask = db.prepare('SELECT status FROM tasks WHERE id = ?').get(task.id) as any;
    if (currentTask.status === TaskStatus.CANCELLED) {
      return;
    }

    // Update task as completed
    db.prepare(`
      UPDATE tasks
      SET status = ?, result = ?, completed_at = ?
      WHERE id = ?
    `).run(TaskStatus.COMPLETED, response.content, Date.now(), task.id);

    // Update agent status back to idle
    db.prepare(`
      UPDATE agents
      SET status = ?
      WHERE id = ?
    `).run('idle', agent.id);

    // Emit completed event
    const completedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(task.id);
    io.emit(WebSocketEventType.TASK_COMPLETED, {
      type: WebSocketEventType.TASK_COMPLETED,
      payload: deserializeTask(completedTask),
      timestamp: new Date(),
    });

  } catch (error: any) {
    console.error('Task execution error:', error);

    // Update task as failed
    db.prepare(`
      UPDATE tasks
      SET status = ?, error = ?, completed_at = ?
      WHERE id = ?
    `).run(TaskStatus.FAILED, error.message, Date.now(), task.id);

    // Update agent status back to idle
    db.prepare(`
      UPDATE agents
      SET status = ?
      WHERE id = ?
    `).run('idle', agent.id);

    // Emit failed event
    const failedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(task.id);
    io.emit(WebSocketEventType.TASK_FAILED, {
      type: WebSocketEventType.TASK_FAILED,
      payload: deserializeTask(failedTask),
      timestamp: new Date(),
    });
  }
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
