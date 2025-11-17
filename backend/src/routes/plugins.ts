import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../database';
import { Plugin } from '@local-code-agent/shared';

export function pluginRoutes() {
  const router = Router();

  // Get all plugins
  router.get('/', (req, res) => {
    try {
      const { enabled, type } = req.query;

      let query = 'SELECT * FROM plugins WHERE 1=1';
      const params: any[] = [];

      if (enabled !== undefined) {
        query += ' AND enabled = ?';
        params.push(enabled === 'true' ? 1 : 0);
      }
      if (type) {
        query += ' AND type = ?';
        params.push(type);
      }

      query += ' ORDER BY name ASC';

      const plugins = db.prepare(query).all(...params).map(deserializePlugin);

      res.json({ success: true, data: plugins });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get plugin by ID
  router.get('/:id', (req, res) => {
    try {
      const plugin = db.prepare('SELECT * FROM plugins WHERE id = ?').get(req.params.id);

      if (!plugin) {
        return res.status(404).json({ success: false, error: 'Plugin not found' });
      }

      res.json({ success: true, data: deserializePlugin(plugin) });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Install/register plugin
  router.post('/', (req, res) => {
    try {
      const { name, description, version, type, author, permissions, config } = req.body;

      if (!name || !description || !version || !type || !author) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      const plugin: Plugin = {
        id: uuidv4(),
        name,
        description,
        version,
        type,
        author,
        enabled: true,
        config: config || {},
        permissions: permissions || [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      db.prepare(`
        INSERT INTO plugins (
          id, name, description, version, type, author,
          enabled, config, permissions, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        plugin.id,
        plugin.name,
        plugin.description,
        plugin.version,
        plugin.type,
        plugin.author,
        plugin.enabled ? 1 : 0,
        JSON.stringify(plugin.config),
        JSON.stringify(plugin.permissions),
        plugin.createdAt.getTime(),
        plugin.updatedAt.getTime()
      );

      res.status(201).json({ success: true, data: plugin });
    } catch (error: any) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({
          success: false,
          error: 'A plugin with this name already exists'
        });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Update plugin
  router.put('/:id', (req, res) => {
    try {
      const pluginId = req.params.id;
      const { description, version, config, enabled } = req.body;

      const existing = db.prepare('SELECT * FROM plugins WHERE id = ?').get(pluginId);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Plugin not found' });
      }

      const updates: string[] = [];
      const values: any[] = [];

      if (description !== undefined) {
        updates.push('description = ?');
        values.push(description);
      }
      if (version !== undefined) {
        updates.push('version = ?');
        values.push(version);
      }
      if (config !== undefined) {
        updates.push('config = ?');
        values.push(JSON.stringify(config));
      }
      if (enabled !== undefined) {
        updates.push('enabled = ?');
        values.push(enabled ? 1 : 0);
      }

      updates.push('updated_at = ?');
      values.push(Date.now());

      values.push(pluginId);

      db.prepare(`
        UPDATE plugins SET ${updates.join(', ')} WHERE id = ?
      `).run(...values);

      const updated = db.prepare('SELECT * FROM plugins WHERE id = ?').get(pluginId);

      res.json({ success: true, data: deserializePlugin(updated) });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Enable/disable plugin
  router.post('/:id/toggle', (req, res) => {
    try {
      const pluginId = req.params.id;

      const plugin = db.prepare('SELECT * FROM plugins WHERE id = ?').get(pluginId);
      if (!plugin) {
        return res.status(404).json({ success: false, error: 'Plugin not found' });
      }

      const newState = (plugin as any).enabled === 1 ? 0 : 1;

      db.prepare(`
        UPDATE plugins SET enabled = ?, updated_at = ? WHERE id = ?
      `).run(newState, Date.now(), pluginId);

      const updated = db.prepare('SELECT * FROM plugins WHERE id = ?').get(pluginId);

      res.json({ success: true, data: deserializePlugin(updated) });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Uninstall plugin
  router.delete('/:id', (req, res) => {
    try {
      const pluginId = req.params.id;

      const existing = db.prepare('SELECT * FROM plugins WHERE id = ?').get(pluginId);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'Plugin not found' });
      }

      db.prepare('DELETE FROM plugins WHERE id = ?').run(pluginId);

      res.json({ success: true, message: 'Plugin uninstalled successfully' });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

function deserializePlugin(row: any): Plugin {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    version: row.version,
    type: row.type,
    author: row.author,
    enabled: row.enabled === 1,
    config: JSON.parse(row.config),
    permissions: JSON.parse(row.permissions),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
