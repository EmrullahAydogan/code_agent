import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { TestSuite, TestCase, CreateTestSuiteRequest } from '@local-code-agent/shared';
import { generateTests, executeTests } from '../services/test-runner';

export function testingRoutes() {
  const router = Router();

  // Get all test suites
  router.get('/', (req, res) => {
    try {
      const { projectId, agentId } = req.query;

      let query = 'SELECT * FROM test_suites WHERE 1=1';
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

      const suites = db.prepare(query).all(...params).map(deserializeTestSuite);

      res.json({ success: true, data: suites });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get test suite by ID
  router.get('/:id', (req, res) => {
    try {
      const suite = db.prepare('SELECT * FROM test_suites WHERE id = ?').get(req.params.id);

      if (!suite) {
        return res.status(404).json({ success: false, error: 'Test suite not found' });
      }

      res.json({ success: true, data: deserializeTestSuite(suite) });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create test suite
  router.post('/', async (req, res) => {
    try {
      const request: CreateTestSuiteRequest = req.body;

      // Validate agent and project
      const agent = db.prepare('SELECT * FROM agents WHERE id = ?').get(request.agentId);
      if (!agent) {
        return res.status(404).json({ success: false, error: 'Agent not found' });
      }

      const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(request.projectId);
      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      let testCases: TestCase[] = [];

      if (request.autoGenerate) {
        // Generate tests using AI
        testCases = await generateTests(
          request.agentId,
          request.projectId,
          (project as any).path,
          request.filePath
        );
      }

      const suite: TestSuite = {
        id: uuidv4(),
        name: request.name,
        description: request.description,
        projectId: request.projectId,
        agentId: request.agentId,
        testCases,
        status: 'pending',
        totalTests: testCases.length,
        passedTests: 0,
        failedTests: 0,
        createdAt: new Date(),
      };

      db.prepare(`
        INSERT INTO test_suites (
          id, name, description, project_id, agent_id, test_cases,
          status, total_tests, passed_tests, failed_tests, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        suite.id,
        suite.name,
        suite.description || null,
        suite.projectId,
        suite.agentId,
        JSON.stringify(suite.testCases),
        suite.status,
        suite.totalTests,
        suite.passedTests,
        suite.failedTests,
        suite.createdAt.getTime()
      );

      res.status(201).json({ success: true, data: suite });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Run test suite
  router.post('/:id/run', async (req, res) => {
    try {
      const suiteId = req.params.id;

      const suite = db.prepare('SELECT * FROM test_suites WHERE id = ?').get(suiteId);
      if (!suite) {
        return res.status(404).json({ success: false, error: 'Test suite not found' });
      }

      const suiteData = deserializeTestSuite(suite);

      // Update status to running
      db.prepare('UPDATE test_suites SET status = ? WHERE id = ?').run('running', suiteId);

      // Execute tests asynchronously
      executeTests(suiteData).catch(error => {
        console.error('Test execution error:', error);
      });

      res.json({ success: true, data: { ...suiteData, status: 'running' } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Delete test suite
  router.delete('/:id', (req, res) => {
    try {
      const suiteId = req.params.id;

      const existing = db.prepare('SELECT * FROM test_suites WHERE id = ?').get(suiteId);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Test suite not found' });
      }

      db.prepare('DELETE FROM test_suites WHERE id = ?').run(suiteId);

      res.json({ success: true, message: 'Test suite deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

function deserializeTestSuite(row: any): TestSuite {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    projectId: row.project_id,
    agentId: row.agent_id,
    testCases: JSON.parse(row.test_cases),
    coverage: row.coverage,
    status: row.status,
    totalTests: row.total_tests,
    passedTests: row.passed_tests,
    failedTests: row.failed_tests,
    createdAt: new Date(row.created_at),
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
  };
}
