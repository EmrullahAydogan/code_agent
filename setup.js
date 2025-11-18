#!/usr/bin/env node

/**
 * Cross-Platform Setup Script for Local Code Agent
 * Works on Windows, macOS, and Linux
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}\n`),
};

// Detect platform
const platform = os.platform();
const isWindows = platform === 'win32';
const isMac = platform === 'darwin';
const isLinux = platform === 'linux';

log.header('🚀 Local Code Agent - Setup Script');
log.info(`Platform: ${platform}`);
log.info(`Node.js: ${process.version}`);
log.info(`Architecture: ${os.arch()}`);

// Check prerequisites
function checkPrerequisites() {
  log.header('📋 Checking Prerequisites');

  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
  if (majorVersion < 18) {
    log.error(`Node.js 18+ required. Current version: ${nodeVersion}`);
    process.exit(1);
  }
  log.success(`Node.js ${nodeVersion} ✓`);

  // Check npm
  try {
    const npmVersion = execSync('npm --version', { encoding: 'utf-8' }).trim();
    log.success(`npm ${npmVersion} ✓`);
  } catch (err) {
    log.error('npm not found');
    process.exit(1);
  }

  // Check git
  try {
    const gitVersion = execSync('git --version', { encoding: 'utf-8' }).trim();
    log.success(`${gitVersion} ✓`);
  } catch (err) {
    log.warn('git not found (optional)');
  }
}

// Create .env file if not exists
function createEnvFile() {
  log.header('🔐 Environment Configuration');

  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');

  if (fs.existsSync(envPath)) {
    log.warn('.env file already exists, skipping...');
    return;
  }

  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    log.success('.env file created from .env.example');
  } else {
    // Create default .env
    const defaultEnv = `# AI Provider API Keys
GEMINI_API_KEY=
DEEPSEEK_API_KEY=
CLAUDE_API_KEY=
OPENAI_API_KEY=

# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_PATH=./backend/database.sqlite

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
`;
    fs.writeFileSync(envPath, defaultEnv);
    log.success('.env file created with default values');
  }

  log.info('\n📝 Please edit .env file and add your API keys');
}

// Initialize database
function initializeDatabase() {
  log.header('💾 Database Initialization');

  const dbPath = path.join(__dirname, 'backend', 'database.sqlite');
  const dbDir = path.dirname(dbPath);

  // Create backend directory if not exists
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  // Database will be created automatically by better-sqlite3
  // when the backend starts for the first time
  log.success('Database directory ready');
}

// Install dependencies
function installDependencies() {
  log.header('📦 Installing Dependencies');

  try {
    log.info('Installing root dependencies...');
    execSync('npm install', { stdio: 'inherit' });
    log.success('All dependencies installed');
  } catch (err) {
    log.error('Failed to install dependencies');
    throw err;
  }
}

// Build shared package
function buildShared() {
  log.header('🔨 Building Shared Package');

  try {
    execSync('npm run build --workspace=shared', { stdio: 'inherit' });
    log.success('Shared package built successfully');
  } catch (err) {
    log.error('Failed to build shared package');
    throw err;
  }
}

// Verify installation
function verifyInstallation() {
  log.header('✅ Verification');

  const checks = [
    {
      name: 'node_modules',
      path: path.join(__dirname, 'node_modules'),
      type: 'directory',
    },
    {
      name: 'shared build',
      path: path.join(__dirname, 'shared', 'dist'),
      type: 'directory',
    },
    {
      name: '.env file',
      path: path.join(__dirname, '.env'),
      type: 'file',
    },
  ];

  let allGood = true;
  checks.forEach((check) => {
    if (fs.existsSync(check.path)) {
      log.success(`${check.name} ✓`);
    } else {
      log.error(`${check.name} not found`);
      allGood = false;
    }
  });

  return allGood;
}

// Print next steps
function printNextSteps() {
  log.header('🎉 Setup Complete!');

  console.log(`
${colors.bright}Next Steps:${colors.reset}

1. Edit your API keys in .env file:
   ${colors.yellow}nano .env${colors.reset} (Linux/Mac) or ${colors.yellow}notepad .env${colors.reset} (Windows)

2. Start the backend server:
   ${colors.green}npm run dev:backend${colors.reset}

3. In a new terminal, start the frontend:
   ${colors.green}npm run dev:frontend${colors.reset}

4. Open your browser:
   ${colors.blue}http://localhost:5173${colors.reset}

${colors.bright}Quick Start (one command):${colors.reset}
   ${colors.green}npm start${colors.reset}

${colors.bright}Documentation:${colors.reset}
   ${colors.blue}README.md${colors.reset}

${colors.yellow}⚠ Don't forget to add your AI provider API keys in .env!${colors.reset}
`);
}

// Main setup function
async function main() {
  try {
    checkPrerequisites();
    createEnvFile();
    initializeDatabase();
    installDependencies();
    buildShared();

    if (verifyInstallation()) {
      printNextSteps();
      process.exit(0);
    } else {
      log.error('Setup verification failed');
      process.exit(1);
    }
  } catch (err) {
    log.error('Setup failed:');
    console.error(err);
    process.exit(1);
  }
}

// Run setup
main();
