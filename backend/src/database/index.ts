import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DATABASE_PATH || './data/agents.db';

// Ensure data directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new Database(DB_PATH);

export function initDatabase() {
  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create agents table
  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      provider TEXT NOT NULL,
      api_key TEXT NOT NULL,
      base_url TEXT,
      model TEXT NOT NULL,
      max_tokens INTEGER,
      temperature REAL,
      system_prompt TEXT,
      status TEXT NOT NULL DEFAULT 'idle',
      project_id TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    )
  `);

  // Create tasks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      project_id TEXT,
      prompt TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      result TEXT,
      error TEXT,
      started_at INTEGER,
      completed_at INTEGER,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    )
  `);

  // Create projects table
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      path TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  // Create settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

  // Create conversations table
  db.exec(`
    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      project_id TEXT,
      title TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    )
  `);

  // Create messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      tool_calls TEXT,
      tool_results TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
    )
  `);

  // Create token_usage table
  db.exec(`
    CREATE TABLE IF NOT EXISTS token_usage (
      id TEXT PRIMARY KEY,
      agent_id TEXT NOT NULL,
      task_id TEXT,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      prompt_tokens INTEGER NOT NULL,
      completion_tokens INTEGER NOT NULL,
      total_tokens INTEGER NOT NULL,
      estimated_cost REAL NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE CASCADE,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE SET NULL
    )
  `);

  // Create agent_templates table
  db.exec(`
    CREATE TABLE IF NOT EXISTS agent_templates (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      provider TEXT NOT NULL,
      model TEXT NOT NULL,
      system_prompt TEXT NOT NULL,
      tags TEXT NOT NULL,
      author TEXT,
      downloads INTEGER DEFAULT 0,
      rating REAL DEFAULT 0,
      created_at INTEGER NOT NULL
    )
  `);

  // Create command_executions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS command_executions (
      id TEXT PRIMARY KEY,
      task_id TEXT,
      project_id TEXT,
      command TEXT NOT NULL,
      working_directory TEXT NOT NULL,
      status TEXT NOT NULL,
      output TEXT,
      error TEXT,
      exit_code INTEGER,
      started_at INTEGER NOT NULL,
      completed_at INTEGER,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    )
  `);

  // Add conversation_id to tasks table if not exists
  try {
    db.exec(`
      ALTER TABLE tasks ADD COLUMN conversation_id TEXT REFERENCES conversations(id) ON DELETE SET NULL
    `);
  } catch (e) {
    // Column already exists
  }

  // Insert default settings if not exists
  const defaultSettings = {
    defaultProvider: 'claude',
    defaultModel: 'claude-3-5-sonnet-20241022',
    maxConcurrentTasks: 5,
    autoSaveInterval: 30000,
    theme: 'system',
  };

  const insertSetting = db.prepare(`
    INSERT OR IGNORE INTO settings (key, value, updated_at)
    VALUES (?, ?, ?)
  `);

  for (const [key, value] of Object.entries(defaultSettings)) {
    insertSetting.run(key, JSON.stringify(value), Date.now());
  }

  // Insert default agent templates
  insertDefaultTemplates();

  console.log('✅ Database initialized');
}

function insertDefaultTemplates() {
  const templates = [
    {
      id: 'template-code-assistant',
      name: 'Code Assistant',
      description: 'A general-purpose coding assistant that helps with various programming tasks',
      category: 'Development',
      provider: 'claude',
      model: 'claude-3-5-sonnet-20241022',
      systemPrompt: 'You are an expert software developer. Help users with coding tasks, debugging, code review, and best practices. Write clean, efficient, and well-documented code.',
      tags: JSON.stringify(['coding', 'general', 'debugging']),
      author: 'System',
      downloads: 0,
      rating: 5,
      createdAt: Date.now(),
    },
    {
      id: 'template-react-expert',
      name: 'React Expert',
      description: 'Specialized in React, TypeScript, and modern frontend development',
      category: 'Frontend',
      provider: 'claude',
      model: 'claude-3-5-sonnet-20241022',
      systemPrompt: 'You are a React and TypeScript expert. Help users build modern web applications using React, Next.js, and related technologies. Focus on best practices, performance, and type safety.',
      tags: JSON.stringify(['react', 'typescript', 'frontend']),
      author: 'System',
      downloads: 0,
      rating: 5,
      createdAt: Date.now(),
    },
    {
      id: 'template-backend-architect',
      name: 'Backend Architect',
      description: 'Expert in backend development, APIs, databases, and system design',
      category: 'Backend',
      provider: 'claude',
      model: 'claude-3-5-sonnet-20241022',
      systemPrompt: 'You are a backend development expert. Help users design and build scalable APIs, databases, and backend systems. Focus on performance, security, and best practices.',
      tags: JSON.stringify(['backend', 'api', 'database']),
      author: 'System',
      downloads: 0,
      rating: 5,
      createdAt: Date.now(),
    },
    {
      id: 'template-devops-engineer',
      name: 'DevOps Engineer',
      description: 'Specialized in CI/CD, Docker, Kubernetes, and infrastructure',
      category: 'DevOps',
      provider: 'claude',
      model: 'claude-3-5-sonnet-20241022',
      systemPrompt: 'You are a DevOps expert. Help users with CI/CD pipelines, containerization, orchestration, and infrastructure as code. Focus on automation and best practices.',
      tags: JSON.stringify(['devops', 'docker', 'kubernetes']),
      author: 'System',
      downloads: 0,
      rating: 5,
      createdAt: Date.now(),
    },
    {
      id: 'template-code-reviewer',
      name: 'Code Reviewer',
      description: 'Focused on code review, security analysis, and quality assurance',
      category: 'Quality',
      provider: 'claude',
      model: 'claude-3-5-sonnet-20241022',
      systemPrompt: 'You are a code review expert. Analyze code for bugs, security issues, performance problems, and maintainability. Provide constructive feedback and suggestions for improvement.',
      tags: JSON.stringify(['review', 'security', 'quality']),
      author: 'System',
      downloads: 0,
      rating: 5,
      createdAt: Date.now(),
    },
  ];

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO agent_templates (
      id, name, description, category, provider, model,
      system_prompt, tags, author, downloads, rating, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const template of templates) {
    stmt.run(
      template.id,
      template.name,
      template.description,
      template.category,
      template.provider,
      template.model,
      template.systemPrompt,
      template.tags,
      template.author,
      template.downloads,
      template.rating,
      template.createdAt
    );
  }
}
