import { Router } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { Workflow, CreateWorkflowRequest, WorkflowStepStatus } from '@local-code-agent/shared';
import { executeWorkflow } from '../services/workflow-executor';

export function workflowRoutes(io: SocketIOServer) {
  const router = Router();

  // Get all workflows
  router.get('/', (req, res) => {
    try {
      const { projectId, status } = req.query;

      let query = 'SELECT * FROM workflows WHERE 1=1';
      const params: any[] = [];

      if (projectId) {
        query += ' AND project_id = ?';
        params.push(projectId);
      }
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      query += ' ORDER BY created_at DESC';

      const workflows = db.prepare(query).all(...params).map(deserializeWorkflow);

      res.json({ success: true, data: workflows });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get workflow by ID
  router.get('/:id', (req, res) => {
    try {
      const workflow = db.prepare('SELECT * FROM workflows WHERE id = ?').get(req.params.id);

      if (!workflow) {
        return res.status(404).json({ success: false, error: 'Workflow not found' });
      }

      res.json({ success: true, data: deserializeWorkflow(workflow) });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create workflow
  router.post('/', (req, res) => {
    try {
      const request: CreateWorkflowRequest = req.body;
      const { createdBy } = req.body; // Agent ID creating the workflow

      if (!createdBy) {
        return res.status(400).json({ success: false, error: 'createdBy agent ID is required' });
      }

      // Generate step IDs
      const steps = request.steps.map(step => ({
        ...step,
        id: uuidv4(),
        status: WorkflowStepStatus.PENDING,
      }));

      const workflow: Workflow = {
        id: uuidv4(),
        name: request.name,
        description: request.description,
        type: request.type,
        steps,
        projectId: request.projectId,
        createdBy,
        status: 'pending',
        createdAt: new Date(),
      };

      db.prepare(`
        INSERT INTO workflows (
          id, name, description, type, steps, project_id, created_by,
          status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        workflow.id,
        workflow.name,
        workflow.description || null,
        workflow.type,
        JSON.stringify(workflow.steps),
        workflow.projectId || null,
        workflow.createdBy,
        workflow.status,
        workflow.createdAt.getTime()
      );

      res.status(201).json({ success: true, data: workflow });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Execute workflow
  router.post('/:id/execute', async (req, res) => {
    try {
      const workflowId = req.params.id;

      const workflow = db.prepare('SELECT * FROM workflows WHERE id = ?').get(workflowId);
      if (!workflow) {
        return res.status(404).json({ success: false, error: 'Workflow not found' });
      }

      const workflowData = deserializeWorkflow(workflow);

      if (workflowData.status === 'running') {
        return res.status(400).json({ success: false, error: 'Workflow is already running' });
      }

      // Update status to running
      db.prepare(`
        UPDATE workflows
        SET status = ?, started_at = ?
        WHERE id = ?
      `).run('running', Date.now(), workflowId);

      // Execute workflow asynchronously
      executeWorkflow(workflowData, io).catch(error => {
        console.error('Workflow execution error:', error);
      });

      res.json({ success: true, data: { ...workflowData, status: 'running' } });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Cancel workflow
  router.post('/:id/cancel', (req, res) => {
    try {
      const workflowId = req.params.id;

      const workflow = db.prepare('SELECT * FROM workflows WHERE id = ?').get(workflowId);
      if (!workflow) {
        return res.status(404).json({ success: false, error: 'Workflow not found' });
      }

      if ((workflow as any).status !== 'running' && (workflow as any).status !== 'pending') {
        return res.status(400).json({
          success: false,
          error: 'Can only cancel running or pending workflows'
        });
      }

      db.prepare(`
        UPDATE workflows
        SET status = ?, completed_at = ?
        WHERE id = ?
      `).run('failed', Date.now(), workflowId);

      res.json({ success: true, message: 'Workflow cancelled' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Delete workflow
  router.delete('/:id', (req, res) => {
    try {
      const workflowId = req.params.id;

      const existing = db.prepare('SELECT * FROM workflows WHERE id = ?').get(workflowId);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Workflow not found' });
      }

      db.prepare('DELETE FROM workflows WHERE id = ?').run(workflowId);

      res.json({ success: true, message: 'Workflow deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

function deserializeWorkflow(row: any): Workflow {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    type: row.type,
    steps: JSON.parse(row.steps),
    projectId: row.project_id,
    createdBy: row.created_by,
    status: row.status,
    currentStepIndex: row.current_step_index,
    result: row.result,
    error: row.error,
    createdAt: new Date(row.created_at),
    startedAt: row.started_at ? new Date(row.started_at) : undefined,
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
  };
}
