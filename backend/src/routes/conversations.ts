import { Router } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { Conversation, Message, CreateConversationRequest } from '@local-code-agent/shared';

export function conversationRoutes(io: SocketIOServer) {
  const router = Router();

  // Get all conversations for an agent
  router.get('/', (req, res) => {
    try {
      const { agentId, projectId } = req.query;

      let query = 'SELECT * FROM conversations WHERE 1=1';
      const params: any[] = [];

      if (agentId) {
        query += ' AND agent_id = ?';
        params.push(agentId);
      }
      if (projectId) {
        query += ' AND project_id = ?';
        params.push(projectId);
      }

      query += ' ORDER BY updated_at DESC';

      const conversations = db.prepare(query).all(...params).map(deserializeConversation);

      // Load messages for each conversation
      for (const conversation of conversations) {
        const messages = db
          .prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC')
          .all(conversation.id)
          .map(deserializeMessage);
        conversation.messages = messages;
      }

      res.json({ success: true, data: conversations });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get conversation by ID
  router.get('/:id', (req, res) => {
    try {
      const conversation = db
        .prepare('SELECT * FROM conversations WHERE id = ?')
        .get(req.params.id);

      if (!conversation) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
      }

      const messages = db
        .prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC')
        .all(req.params.id)
        .map(deserializeMessage);

      const result = deserializeConversation(conversation);
      result.messages = messages;

      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create conversation
  router.post('/', (req, res) => {
    try {
      const request: CreateConversationRequest = req.body;

      const conversation: Conversation = {
        id: uuidv4(),
        agentId: request.agentId,
        projectId: request.projectId,
        title: request.title || 'New Conversation',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      db.prepare(`
        INSERT INTO conversations (
          id, agent_id, project_id, title, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        conversation.id,
        conversation.agentId,
        conversation.projectId || null,
        conversation.title,
        conversation.createdAt.getTime(),
        conversation.updatedAt.getTime()
      );

      res.status(201).json({ success: true, data: conversation });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Add message to conversation
  router.post('/:id/messages', (req, res) => {
    try {
      const conversationId = req.params.id;
      const { role, content, toolCalls, toolResults } = req.body;

      const message: Message = {
        id: uuidv4(),
        conversationId,
        role,
        content,
        toolCalls,
        toolResults,
        createdAt: new Date(),
      };

      db.prepare(`
        INSERT INTO messages (
          id, conversation_id, role, content, tool_calls, tool_results, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        message.id,
        message.conversationId,
        message.role,
        message.content,
        toolCalls ? JSON.stringify(toolCalls) : null,
        toolResults ? JSON.stringify(toolResults) : null,
        message.createdAt.getTime()
      );

      // Update conversation updated_at
      db.prepare('UPDATE conversations SET updated_at = ? WHERE id = ?').run(
        Date.now(),
        conversationId
      );

      res.status(201).json({ success: true, data: message });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Delete conversation
  router.delete('/:id', (req, res) => {
    try {
      const conversationId = req.params.id;

      const existing = db.prepare('SELECT * FROM conversations WHERE id = ?').get(conversationId);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
      }

      db.prepare('DELETE FROM conversations WHERE id = ?').run(conversationId);

      res.json({ success: true, message: 'Conversation deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Update conversation title
  router.put('/:id', (req, res) => {
    try {
      const conversationId = req.params.id;
      const { title } = req.body;

      db.prepare('UPDATE conversations SET title = ?, updated_at = ? WHERE id = ?').run(
        title,
        Date.now(),
        conversationId
      );

      const updated = db.prepare('SELECT * FROM conversations WHERE id = ?').get(conversationId);
      const messages = db
        .prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC')
        .all(conversationId)
        .map(deserializeMessage);

      const result = deserializeConversation(updated);
      result.messages = messages;

      res.json({ success: true, data: result });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

function deserializeConversation(row: any): Conversation {
  return {
    id: row.id,
    agentId: row.agent_id,
    projectId: row.project_id,
    title: row.title,
    messages: [],
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function deserializeMessage(row: any): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    role: row.role,
    content: row.content,
    toolCalls: row.tool_calls ? JSON.parse(row.tool_calls) : undefined,
    toolResults: row.tool_results ? JSON.parse(row.tool_results) : undefined,
    createdAt: new Date(row.created_at),
  };
}
