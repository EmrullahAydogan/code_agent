#!/usr/bin/env node

/**
 * Cross-Platform Start Script
 * Starts both backend and frontend servers
 */

const { spawn } = require('child_process');
const path = require('path');
const os = require('os');

const isWindows = os.platform() === 'win32';

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
};

console.log(`
${colors.bright}╔════════════════════════════════════════╗
║   Local Code Agent Platform Starting   ║
╚════════════════════════════════════════╝${colors.reset}
`);

// Start backend
console.log(`${colors.blue}[Backend]${colors.reset} Starting on http://localhost:3000`);
const backend = spawn(
  isWindows ? 'npm.cmd' : 'npm',
  ['run', 'dev', '--workspace=backend'],
  {
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: __dirname,
    env: { ...process.env, FORCE_COLOR: '1' },
  }
);

backend.stdout.on('data', (data) => {
  process.stdout.write(`${colors.blue}[Backend]${colors.reset} ${data}`);
});

backend.stderr.on('data', (data) => {
  process.stderr.write(`${colors.blue}[Backend]${colors.reset} ${data}`);
});

// Start frontend after a short delay
setTimeout(() => {
  console.log(`${colors.green}[Frontend]${colors.reset} Starting on http://localhost:5173`);
  const frontend = spawn(
    isWindows ? 'npm.cmd' : 'npm',
    ['run', 'dev', '--workspace=frontend'],
    {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: __dirname,
      env: { ...process.env, FORCE_COLOR: '1' },
    }
  );

  frontend.stdout.on('data', (data) => {
    process.stdout.write(`${colors.green}[Frontend]${colors.reset} ${data}`);
  });

  frontend.stderr.on('data', (data) => {
    process.stderr.write(`${colors.green}[Frontend]${colors.reset} ${data}`);
  });

  frontend.on('close', (code) => {
    console.log(`${colors.green}[Frontend]${colors.reset} exited with code ${code}`);
    backend.kill();
    process.exit(code);
  });
}, 2000);

backend.on('close', (code) => {
  console.log(`${colors.blue}[Backend]${colors.reset} exited with code ${code}`);
  process.exit(code);
});

// Handle Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\nShutting down gracefully...');
  backend.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\nShutting down gracefully...');
  backend.kill();
  process.exit(0);
});

console.log(`
${colors.yellow}Press Ctrl+C to stop all servers${colors.reset}
`);
