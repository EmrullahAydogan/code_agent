import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { AgentTemplate, CreateAgentFromTemplate, Agent, AgentStatus } from '@local-code-agent/shared';

export function templateRoutes() {
  const router = Router();

  // Get all templates
  router.get('/', (req, res) => {
    try {
      const { category, search } = req.query;

      let query = 'SELECT * FROM agent_templates WHERE 1=1';
      const params: any[] = [];

      if (category) {
        query += ' AND category = ?';
        params.push(category);
      }

      if (search) {
        query += ' AND (name LIKE ? OR description LIKE ? OR tags LIKE ?)';
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern);
      }

      query += ' ORDER BY downloads DESC, rating DESC';

      const templates = db.prepare(query).all(...params).map(deserializeTemplate);

      res.json({ success: true, data: templates });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get template by ID
  router.get('/:id', (req, res) => {
    try {
      const template = db.prepare('SELECT * FROM agent_templates WHERE id = ?').get(req.params.id);

      if (!template) {
        return res.status(404).json({ success: false, error: 'Template not found' });
      }

      res.json({ success: true, data: deserializeTemplate(template) });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create agent from template
  router.post('/:id/create-agent', (req, res) => {
    try {
      const templateId = req.params.id;
      const request: CreateAgentFromTemplate = req.body;

      const template = db.prepare('SELECT * FROM agent_templates WHERE id = ?').get(templateId);
      if (!template) {
        return res.status(404).json({ success: false, error: 'Template not found' });
      }

      const agent: Agent = {
        id: uuidv4(),
        name: request.name,
        description: (template as any).description,
        providerConfig: {
          provider: (template as any).provider,
          apiKey: request.apiKey,
          model: (template as any).model,
          maxTokens: 4096,
          temperature: 0.7,
        },
        systemPrompt: (template as any).system_prompt,
        status: AgentStatus.IDLE,
        createdAt: new Date(),
        updatedAt: new Date(),
        projectId: request.projectId,
      };

      db.prepare(`
        INSERT INTO agents (
          id, name, description, provider, api_key, base_url, model,
          max_tokens, temperature, system_prompt, status, project_id,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
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

      // Increment template download count
      db.prepare('UPDATE agent_templates SET downloads = downloads + 1 WHERE id = ?').run(templateId);

      res.status(201).json({ success: true, data: agent });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get template categories
  router.get('/meta/categories', (req, res) => {
    try {
      const categories = db
        .prepare('SELECT DISTINCT category FROM agent_templates ORDER BY category')
        .all()
        .map((row: any) => row.category);

      res.json({ success: true, data: categories });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

function deserializeTemplate(row: any): AgentTemplate {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    providerConfig: {
      provider: row.provider,
      model: row.model,
      maxTokens: 4096,
      temperature: 0.7,
    },
    systemPrompt: row.system_prompt,
    tags: JSON.parse(row.tags),
    author: row.author,
    downloads: row.downloads,
    rating: row.rating,
    createdAt: new Date(row.created_at),
  };
}
