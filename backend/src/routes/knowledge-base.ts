import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { KnowledgeBase, CreateKnowledgeBaseRequest, SearchQuery } from '@local-code-agent/shared';
import { indexProject, searchKnowledgeBase } from '../services/rag-engine';

export function knowledgeBaseRoutes() {
  const router = Router();

  // Get all knowledge bases
  router.get('/', (req, res) => {
    try {
      const { projectId } = req.query;

      let query = 'SELECT * FROM knowledge_bases WHERE 1=1';
      const params: any[] = [];

      if (projectId) {
        query += ' AND project_id = ?';
        params.push(projectId);
      }

      query += ' ORDER BY created_at DESC';

      const kbs = db.prepare(query).all(...params).map(deserializeKnowledgeBase);

      res.json({ success: true, data: kbs });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get knowledge base by ID
  router.get('/:id', (req, res) => {
    try {
      const kb = db.prepare('SELECT * FROM knowledge_bases WHERE id = ?').get(req.params.id);

      if (!kb) {
        return res.status(404).json({ success: false, error: 'Knowledge base not found' });
      }

      res.json({ success: true, data: deserializeKnowledgeBase(kb) });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create knowledge base
  router.post('/', async (req, res) => {
    try {
      const request: CreateKnowledgeBaseRequest = req.body;

      const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(request.projectId);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      const kb: KnowledgeBase = {
        id: uuidv4(),
        name: request.name,
        description: request.description,
        projectId: request.projectId,
        documents: 0,
        chunks: 0,
        indexed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      db.prepare(`
        INSERT INTO knowledge_bases (
          id, name, description, project_id, documents, chunks,
          indexed, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        kb.id,
        kb.name,
        kb.description || null,
        kb.projectId,
        kb.documents,
        kb.chunks,
        kb.indexed ? 1 : 0,
        kb.createdAt.getTime(),
        kb.updatedAt.getTime()
      );

      // Index project if requested
      if (request.autoIndex) {
        indexProject(kb.id, request.projectId, (project as any).path, request.files).catch(error => {
          console.error('Indexing error:', error);
        });
      }

      res.status(201).json({ success: true, data: kb });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Index knowledge base
  router.post('/:id/index', async (req, res) => {
    try {
      const kbId = req.params.id;
      const { files } = req.body;

      const kb = db.prepare('SELECT * FROM knowledge_bases WHERE id = ?').get(kbId);
      if (!kb) {
        return res.status(404).json({ success: false, error: 'Knowledge base not found' });
      }

      const project = db.prepare('SELECT * FROM projects WHERE id = ?').get((kb as any).project_id);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      // Start indexing asynchronously
      indexProject(kbId, (kb as any).project_id, (project as any).path, files).catch(error => {
        console.error('Indexing error:', error);
      });

      res.json({ success: true, message: 'Indexing started' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Search knowledge base
  router.post('/:id/search', async (req, res) => {
    try {
      const kbId = req.params.id;
      const query: SearchQuery = req.body;

      const kb = db.prepare('SELECT * FROM knowledge_bases WHERE id = ?').get(kbId);
      if (!kb) {
        return res.status(404).json({ success: false, error: 'Knowledge base not found' });
      }

      if (!(kb as any).indexed) {
        return res.status(400).json({
          success: false,
          error: 'Knowledge base not indexed yet'
        });
      }

      const results = await searchKnowledgeBase(kbId, query.query, query.limit || 10);

      res.json({ success: true, data: results });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Delete knowledge base
  router.delete('/:id', (req, res) => {
    try {
      const kbId = req.params.id;

      const existing = db.prepare('SELECT * FROM knowledge_bases WHERE id = ?').get(kbId);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Knowledge base not found' });
      }

      db.prepare('DELETE FROM knowledge_bases WHERE id = ?').run(kbId);

      res.json({ success: true, message: 'Knowledge base deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

function deserializeKnowledgeBase(row: any): KnowledgeBase {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    projectId: row.project_id,
    documents: row.documents,
    chunks: row.chunks,
    indexed: row.indexed === 1,
    indexedAt: row.indexed_at ? new Date(row.indexed_at) : undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
