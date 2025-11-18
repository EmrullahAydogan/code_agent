# Installation Guide

Complete installation instructions for Local Code Agent Platform on all operating systems.

## Table of Contents

- [Quick Start (All Platforms)](#quick-start)
- [Windows Installation](#windows)
- [macOS Installation](#macos)
- [Linux Installation](#linux)
- [Docker Installation](#docker)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

**One-Command Installation** (Works on Windows, macOS, and Linux):

```bash
npm install && npm run setup
```

Then start the application:

```bash
npm start
```

That's it! The application will be available at http://localhost:5173

---

## Prerequisites

All platforms require:
- **Node.js 18+** ([Download](https://nodejs.org/))
- **npm 9+** (comes with Node.js)
- **Git** (optional, but recommended)

---

## Windows

### Option 1: Automated Setup (Recommended)

1. **Install Node.js**
   - Download from https://nodejs.org/
   - Run the installer
   - Verify installation:
     ```cmd
     node --version
     npm --version
     ```

2. **Clone or Download the Repository**
   ```cmd
     git clone <repository-url>
   cd code_agent
   ```

3. **Run Setup**
   ```cmd
   npm install
   npm run setup
   ```

4. **Configure API Keys**
   - Open `.env` file in Notepad:
     ```cmd
     notepad .env
     ```
   - Add your AI provider API keys

5. **Start the Application**
   ```cmd
   npm start
   ```

### Option 2: Manual Setup

```cmd
# Install dependencies
npm install

# Build shared package
npm run build:shared

# Copy environment file
copy .env.example .env

# Edit .env with your API keys
notepad .env

# Start application
npm start
```

### Windows-Specific Notes

- **PowerShell Users**: If you get execution policy errors, run:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

- **Path Issues**: Make sure Node.js is in your PATH. Restart your terminal after installing Node.js.

- **Port Already in Use**: If port 3000 or 5173 is occupied, edit `.env`:
  ```
  PORT=3001
  ```

---

## macOS

### Option 1: Automated Setup (Recommended)

1. **Install Node.js**

   Using Homebrew:
   ```bash
   brew install node
   ```

   Or download from https://nodejs.org/

2. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd code_agent
   ```

3. **Run Setup**
   ```bash
   npm install && npm run setup
   ```

4. **Configure API Keys**
   ```bash
   nano .env
   # or
   open -e .env
   ```

5. **Start the Application**
   ```bash
   npm start
   ```

### Option 2: Using Homebrew

```bash
# Install Node.js if not installed
brew install node

# Clone repository
git clone <repository-url>
cd code_agent

# Setup
npm install && npm run setup

# Configure .env
nano .env

# Start
npm start
```

### macOS-Specific Notes

- **Rosetta (M1/M2 Macs)**: Everything works natively on Apple Silicon
- **Permissions**: You might need to allow Node.js in Security & Privacy settings
- **Homebrew Issues**: If Homebrew is slow, try updating it first: `brew update`

---

## Linux

### Debian/Ubuntu

```bash
# Update package list
sudo apt update

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version

# Clone repository
git clone <repository-url>
cd code_agent

# Setup
npm install && npm run setup

# Configure .env
nano .env

# Start
npm start
```

### Fedora/RHEL/CentOS

```bash
# Install Node.js
sudo dnf install nodejs

# Clone repository
git clone <repository-url>
cd code_agent

# Setup
npm install && npm run setup

# Configure .env
nano .env

# Start
npm start
```

### Arch Linux

```bash
# Install Node.js
sudo pacman -S nodejs npm

# Clone repository
git clone <repository-url>
cd code_agent

# Setup
npm install && npm run setup

# Configure .env
nano .env

# Start
npm start
```

### Linux-Specific Notes

- **Permissions**: Avoid using `sudo` with npm. If you get permission errors:
  ```bash
  sudo chown -R $(whoami) ~/.npm
  ```

- **Port Binding**: If you can't bind to port 3000:
  ```bash
  # Option 1: Use different port in .env
  PORT=8080

  # Option 2: Use authbind (Debian/Ubuntu)
  sudo apt-get install authbind
  ```

---

## Docker

### Quick Docker Setup

```bash
# Clone repository
git clone <repository-url>
cd code_agent

# Copy environment file
cp .env.example .env

# Edit .env with your API keys
nano .env

# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View logs
docker-compose logs -f

# Rebuild after changes
docker-compose up -d --build

# Remove everything (including volumes)
docker-compose down -v
```

### Docker on Different Platforms

**Windows (Docker Desktop)**:
```cmd
# Make sure Docker Desktop is running
docker-compose up -d
```

**macOS (Docker Desktop)**:
```bash
# Make sure Docker Desktop is running
docker-compose up -d
```

**Linux (Docker Engine)**:
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker $USER

# Start Docker
sudo systemctl start docker
sudo systemctl enable docker

# Run application
docker-compose up -d
```

---

## Environment Configuration

### Required API Keys

Edit `.env` file and add at least one AI provider API key:

```env
# Get your API keys from:
GEMINI_API_KEY=your_key_here           # https://makersuite.google.com/app/apikey
DEEPSEEK_API_KEY=your_key_here         # https://platform.deepseek.com/
CLAUDE_API_KEY=your_key_here           # https://console.anthropic.com/
OPENAI_API_KEY=your_key_here           # https://platform.openai.com/api-keys
```

### Optional Configuration

```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_PATH=./backend/database.sqlite

# Frontend
FRONTEND_URL=http://localhost:5173
```

---

## Verification

After installation, verify everything is working:

1. **Backend Health Check**
   ```bash
   curl http://localhost:3000/api/health
   ```
   Should return: `{"status":"healthy",...}`

2. **Frontend Access**
   - Open browser: http://localhost:5173
   - You should see the login/dashboard page

3. **Check Logs**
   - Backend logs appear in terminal
   - Frontend logs in browser console (F12)

---

## Troubleshooting

### Common Issues

**"Port already in use"**
```bash
# Find process using port
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9
```

**"Cannot find module '@local-code-agent/shared'"**
```bash
# Rebuild shared package
npm run build:shared
```

**"EACCES permission denied"**
```bash
# Fix npm permissions (Linux/macOS)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) ./node_modules
```

**"gyp ERR! stack Error: EACCES"** (Windows)
```cmd
# Run as Administrator or:
npm install --global --production windows-build-tools
```

**Database locked**
```bash
# Stop all instances first
# Delete database and restart
rm backend/database.sqlite
npm start
```

### Getting Help

1. Check logs in terminal
2. Check browser console (F12)
3. Enable debug console in app (bottom-right button)
4. Check GitHub Issues
5. Review API provider documentation

---

## Advanced Installation

### Development Mode

```bash
# Install with dev dependencies
npm install

# Run in development mode (hot reload)
npm run dev

# Type checking
npm run typecheck
```

### Production Build

```bash
# Build all packages
npm run build

# Start production server
npm run start:backend &
npm run start:frontend &
```

### Clean Installation

```bash
# Remove everything and start fresh
npm run reset

# This runs: clean → install → setup
```

---

## Platform-Specific Scripts

The project includes cross-platform scripts that work on all operating systems:

- `npm install` - Install dependencies
- `npm run setup` - Complete setup wizard
- `npm start` - Start both backend and frontend
- `npm run dev` - Development mode with hot reload
- `npm run build` - Production build
- `npm run typecheck` - TypeScript type checking
- `npm run clean` - Remove node_modules
- `npm run reset` - Complete reset and reinstall

All scripts are tested on Windows, macOS, and Linux.

---

## Next Steps

After successful installation:

1. **Create Your First Agent**
   - Go to http://localhost:5173/agents
   - Click "Create Agent"
   - Choose an AI provider and model

2. **Configure a Project**
   - Go to Projects
   - Add your codebase path
   - Set up file operations

3. **Explore Features**
   - Templates - Pre-built agent configurations
   - Workflows - Multi-step automation
   - Code Reviews - Automated code analysis
   - Knowledge Base - RAG system for docs

4. **Read Documentation**
   - API Docs: http://localhost:5173/api-docs
   - README.md - Feature overview
   - In-app help (Press Shift+?)

---

**Happy Coding! 🚀**
