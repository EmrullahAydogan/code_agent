import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { CodeReview, CreateCodeReviewRequest, CodeReviewIssue, ReviewSeverity } from '@local-code-agent/shared';
import { performCodeReview } from '../services/code-reviewer';

export function codeReviewRoutes() {
  const router = Router();

  // Get all code reviews
  router.get('/', (req, res) => {
    try {
      const { projectId, agentId } = req.query;

      let query = 'SELECT * FROM code_reviews WHERE 1=1';
      const params: any[] = [];

      if (projectId) {
        query += ' AND project_id = ?';
        params.push(projectId);
      }
      if (agentId) {
        query += ' AND agent_id = ?';
        params.push(agentId);
      }

      query += ' ORDER BY created_at DESC';

      const reviews = db.prepare(query).all(...params).map(deserializeCodeReview);

      res.json({ success: true, data: reviews });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get code review by ID
  router.get('/:id', (req, res) => {
    try {
      const review = db.prepare('SELECT * FROM code_reviews WHERE id = ?').get(req.params.id);

      if (!review) {
        return res.status(404).json({ success: false, error: 'Code review not found' });
      }

      res.json({ success: true, data: deserializeCodeReview(review) });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create code review
  router.post('/', async (req, res) => {
    try {
      const request: CreateCodeReviewRequest = req.body;

      // Validate agent and project
      const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(request.agentId);
      if (!agent) {
        return res.status(404).json({ success: false, error: 'Agent not found' });
      }

      const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(request.projectId);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      // Perform code review
      const review = await performCodeReview(
        request.agentId,
        request.projectId,
        (project as any).path,
        request.files,
        request.focus
      );

      // Save to database
      db.prepare(`
        INSERT INTO code_reviews (
          id, agent_id, project_id, files, issues, summary, score, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        review.id,
        review.agentId,
        review.projectId,
        JSON.stringify(review.files),
        JSON.stringify(review.issues),
        review.summary,
        review.score,
        review.createdAt.getTime()
      );

      res.status(201).json({ success: true, data: review });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Delete code review
  router.delete('/:id', (req, res) => {
    try {
      const reviewId = req.params.id;

      const existing = db.prepare('SELECT * FROM code_reviews WHERE id = ?').get(reviewId);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Code review not found' });
      }

      db.prepare('DELETE FROM code_reviews WHERE id = ?').run(reviewId);

      res.json({ success: true, message: 'Code review deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get review statistics
  router.get('/stats/:projectId', (req, res) => {
    try {
      const { projectId } = req.params;

      const stats = db.prepare(`
        SELECT
          COUNT(*) as total_reviews,
          AVG(score) as avg_score,
          MAX(created_at) as last_review
        FROM code_reviews
        WHERE project_id = ?
      `).get(projectId) as any;

      const issueStats = db.prepare(`
        SELECT issues FROM code_reviews WHERE project_id = ?
      `).all(projectId) as any[];

      let totalIssues = 0;
      const severityCounts = {
        [ReviewSeverity.INFO]: 0,
        [ReviewSeverity.WARNING]: 0,
        [ReviewSeverity.ERROR]: 0,
        [ReviewSeverity.CRITICAL]: 0,
      };

      for (const row of issueStats) {
        const issues: CodeReviewIssue[] = JSON.parse(row.issues);
        totalIssues += issues.length;
        issues.forEach(issue => {
          severityCounts[issue.severity]++;
        });
      }

      res.json({
        success: true,
        data: {
          totalReviews: stats.total_reviews || 0,
          avgScore: Math.round(stats.avg_score || 0),
          lastReview: stats.last_review ? new Date(stats.last_review) : null,
          totalIssues,
          severityCounts,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

function deserializeCodeReview(row: any): CodeReview {
  return {
    id: row.id,
    agentId: row.agent_id,
    projectId: row.project_id,
    files: JSON.parse(row.files),
    issues: JSON.parse(row.issues),
    summary: row.summary,
    score: row.score,
    createdAt: new Date(row.created_at),
  };
}
