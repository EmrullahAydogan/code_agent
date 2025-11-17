import { Router } from 'express';
import { Server as SocketIOServer } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { Project, CreateProjectRequest, UpdateProjectRequest } from '@local-code-agent/shared';
import fs from 'fs';
import path from 'path';

export function projectRoutes(io: SocketIOServer) {
  const router = Router();

  // Get all projects
  router.get('/', (req, res) => {
    try {
      const projects = db
        .prepare('SELECT * FROM projects ORDER BY created_at DESC')
        .all()
        .map(deserializeProject);

      res.json({ success: true, data: projects });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get project by ID
  router.get('/:id', (req, res) => {
    try {
      const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);

      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      res.json({ success: true, data: deserializeProject(project) });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Create project
  router.post('/', (req, res) => {
    try {
      const request: CreateProjectRequest = req.body;

      // Validate path exists
      if (!fs.existsSync(request.path)) {
        return res.status(400).json({
          success: false,
          error: 'Path does not exist'
        });
      }

      // Check if path is a directory
      if (!fs.statSync(request.path).isDirectory()) {
        return res.status(400).json({
          success: false,
          error: 'Path must be a directory'
        });
      }

      const project: Project = {
        id: uuidv4(),
        name: request.name,
        description: request.description,
        path: path.resolve(request.path),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const stmt = db.prepare(`
        INSERT INTO projects (
          id, name, description, path, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        project.id,
        project.name,
        project.description || null,
        project.path,
        project.createdAt.getTime(),
        project.updatedAt.getTime()
      );

      res.status(201).json({ success: true, data: project });
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({
          success: false,
          error: 'A project with this path already exists'
        });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Update project
  router.put('/:id', (req, res) => {
    try {
      const request: UpdateProjectRequest = req.body;
      const projectId = req.params.id;

      const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

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
      if (request.path !== undefined) {
        if (!fs.existsSync(request.path)) {
          return res.status(400).json({
            success: false,
            error: 'Path does not exist'
          });
        }
        updates.push('path = ?');
        values.push(path.resolve(request.path));
      }

      updates.push('updated_at = ?');
      values.push(Date.now());

      values.push(projectId);

      const stmt = db.prepare(`
        UPDATE projects SET ${updates.join(', ')} WHERE id = ?
      `);

      stmt.run(...values);

      const updated = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);

      res.json({ success: true, data: deserializeProject(updated) });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Delete project
  router.delete('/:id', (req, res) => {
    try {
      const projectId = req.params.id;

      const existing = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      db.prepare('DELETE FROM projects WHERE id = ?').run(projectId);

      res.json({ success: true, message: 'Project deleted successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get project files (basic file listing)
  router.get('/:id/files', (req, res) => {
    try {
      const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);

      if (!project) {
        return res.status(404).json({ success: false, error: 'Project not found' });
      }

      const projectPath = project.path;
      const files = getProjectFiles(projectPath);

      res.json({ success: true, data: files });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

function deserializeProject(row: any): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    path: row.path,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

function getProjectFiles(dirPath: string, baseDir: string = dirPath): any[] {
  const files: any[] = [];

  try {
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
      // Skip common ignored directories
      if (item === 'node_modules' || item === '.git' || item === 'dist' || item === 'build') {
        continue;
      }

      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      const relativePath = path.relative(baseDir, fullPath);

      if (stat.isDirectory()) {
        files.push({
          name: item,
          path: relativePath,
          type: 'directory',
          children: getProjectFiles(fullPath, baseDir),
        });
      } else {
        files.push({
          name: item,
          path: relativePath,
          type: 'file',
          size: stat.size,
        });
      }
    }
  } catch (error) {
    console.error('Error reading directory:', error);
  }

  return files;
}
