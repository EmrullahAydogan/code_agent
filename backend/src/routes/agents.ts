import { Router } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { Agent, CreateAgentRequest, UpdateAgentRequest, WebSocketEventType, AgentStatus, ApiResponse } from '@local-code-agent/shared';

export function agentRoutes(io: SocketIOServer) {
  const router = Router();

  // Get all agents
  router.get('/', (req, res) => {
    try {
      const agents = db
        .prepare('SELECT * FROM agents ORDER BY created_at DESC')
        .all()
        .map(deserializeAgent);

      res.json({ success: true, data: agents });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get agent by ID
  router.get('/:id', (req, res) => {
    try {
      const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(req.params.id);

      if (!agent) {
        return res.status(404).json({ success: false, error: 'Agent not found' });
      }

      res.json({ success: true, data: deserializeAgent(agent) });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create agent
  router.post('/', (req, res) => {
    try {
      const request: CreateAgentRequest = req.body;

      const agent: Agent = {
        id: uuidv4(),
        name: request.name,
        description: request.description,
        providerConfig: request.providerConfig,
        systemPrompt: request.systemPrompt,
        status: AgentStatus.IDLE,
        createdAt: new Date(),
        updatedAt: new Date(),
        projectId: request.projectId,
      };

      const stmt = db.prepare(`
        INSERT INTO agents (
          id, name, description, provider, api_key, base_url, model,
          max_tokens, temperature, system_prompt, status, project_id,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        agent.id,
        agent.name,
        agent.description || null,
        agent.providerConfig.provider,
        agent.providerConfig.apiKey,
        agent.providerConfig.baseUrl || null,
        agent.providerConfig.model,
        agent.providerConfig.maxTokens || null,
        agent.providerConfig.temperature || null,
        agent.systemPrompt || null,
        agent.status,
        agent.projectId || null,
        agent.createdAt.getTime(),
        agent.updatedAt.getTime()
      );

      // Emit WebSocket event
      io.emit(WebSocketEventType.AGENT_CREATED, {
        type: WebSocketEventType.AGENT_CREATED,
        payload: agent,
        timestamp: new Date(),
      });

      res.status(201).json({ success: true, data: agent });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Update agent
  router.put('/:id', (req, res) => {
    try {
      const request: UpdateAgentRequest = req.body;
      const agentId = req.params.id;

      // Check if agent exists
      const existing = db.prepare('SELECT * FROM agents WHERE id = ?').get(agentId);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Agent not found' });
      }

      const existingAgent = deserializeAgent(existing);

      // Build update query dynamically
      const updates: string[] = [];
      const values: any[] = [];

      if (request.name !== undefined) {
        updates.push('name = ?');
        values.push(request.name);
      }
      if (request.description !== undefined) {
        updates.push('description = ?');
        values.push(request.description);
      }
      if (request.providerConfig) {
        if (request.providerConfig.provider !== undefined) {
          updates.push('provider = ?');
          values.push(request.providerConfig.provider);
        }
        if (request.providerConfig.apiKey !== undefined) {
          updates.push('api_key = ?');
          values.push(request.providerConfig.apiKey);
        }
        if (request.providerConfig.baseUrl !== undefined) {
          updates.push('base_url = ?');
          values.push(request.providerConfig.baseUrl);
        }
        if (request.providerConfig.model !== undefined) {
          updates.push('model = ?');
          values.push(request.providerConfig.model);
        }
        if (request.providerConfig.maxTokens !== undefined) {
          updates.push('max_tokens = ?');
          values.push(request.providerConfig.maxTokens);
        }
        if (request.providerConfig.temperature !== undefined) {
          updates.push('temperature = ?');
          values.push(request.providerConfig.temperature);
        }
      }
      if (request.systemPrompt !== undefined) {
        updates.push('system_prompt = ?');
        values.push(request.systemPrompt);
      }
      if (request.status !== undefined) {
        updates.push('status = ?');
        values.push(request.status);
      }
      if (request.projectId !== undefined) {
        updates.push('project_id = ?');
        values.push(request.projectId);
      }

      updates.push('updated_at = ?');
      values.push(Date.now());

      values.push(agentId);

      const stmt = db.prepare(`
        UPDATE agents SET ${updates.join(', ')} WHERE id = ?
      `);

      stmt.run(...values);

      // Get updated agent
      const updated = db.prepare('SELECT * FROM agents WHERE id = ?').get(agentId);
      const updatedAgent = deserializeAgent(updated);

      // Emit WebSocket event
      io.emit(WebSocketEventType.AGENT_UPDATED, {
        type: WebSocketEventType.AGENT_UPDATED,
        payload: updatedAgent,
        timestamp: new Date(),
      });

      res.json({ success: true, data: updatedAgent });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Delete agent
  router.delete('/:id', (req, res) => {
    try {
      const agentId = req.params.id;

      const existing = db.prepare('SELECT * FROM agents WHERE id = ?').get(agentId);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Agent not found' });
      }

      db.prepare('DELETE FROM agents WHERE id = ?').run(agentId);

      // Emit WebSocket event
      io.emit(WebSocketEventType.AGENT_DELETED, {
        type: WebSocketEventType.AGENT_DELETED,
        payload: { id: agentId },
        timestamp: new Date(),
      });

      res.json({ success: true, message: 'Agent deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

function deserializeAgent(row: any): Agent {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    providerConfig: {
      provider: row.provider,
      apiKey: row.api_key,
      baseUrl: row.base_url,
      model: row.model,
      maxTokens: row.max_tokens,
      temperature: row.temperature,
    },
    systemPrompt: row.system_prompt,
    status: row.status,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    projectId: row.project_id,
  };
}
