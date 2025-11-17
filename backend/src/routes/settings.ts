import { Router } from 'express';
import { db } from '../database';
import { SystemSettings } from '@local-code-agent/shared';

export function settingsRoutes() {
  const router = Router();

  // Get all settings
  router.get('/', (req, res) => {
    try {
      const rows = db.prepare('SELECT * FROM settings').all();

      const settings: any = {};
      for (const row of rows as any[]) {
        settings[row.key] = JSON.parse(row.value);
      }

      res.json({ success: true, data: settings });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Get setting by key
  router.get('/:key', (req, res) => {
    try {
      const row = db.prepare('SELECT * FROM settings WHERE key = ?').get(req.params.key);

      if (!row) {
        return res.status(404).json({ success: false, error: 'Setting not found' });
      }

      res.json({
        success: true,
        data: {
          key: (row as any).key,
          value: JSON.parse((row as any).value)
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Update setting
  router.put('/:key', (req, res) => {
    try {
      const { value } = req.body;

      if (value === undefined) {
        return res.status(400).json({ success: false, error: 'Value is required' });
      }

      const stmt = db.prepare(`
        INSERT OR REPLACE INTO settings (key, value, updated_at)
        VALUES (?, ?, ?)
      `);

      stmt.run(req.params.key, JSON.stringify(value), Date.now());

      res.json({
        success: true,
        data: {
          key: req.params.key,
          value
        }
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Update multiple settings
  router.post('/bulk', (req, res) => {
    try {
      const settings = req.body;

      const stmt = db.prepare(`
        INSERT OR REPLACE INTO settings (key, value, updated_at)
        VALUES (?, ?, ?)
      `);

      const transaction = db.transaction((items: any[]) => {
        for (const [key, value] of items) {
          stmt.run(key, JSON.stringify(value), Date.now());
        }
      });

      transaction(Object.entries(settings));

      res.json({ success: true, data: settings });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}
