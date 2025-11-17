# Local Code Agent Platform

A professional, web-based AI code agent platform running entirely on your local machine. Build, manage, and orchestrate multiple AI agents across your projects with support for Claude, ChatGPT, Gemini, and DeepSeek.

## Features

### Core Platform
- **Multi-Agent Management** - Create and manage multiple AI agents with different configurations
- **Real-time Task Delegation** - Assign tasks to agents across multiple projects simultaneously
- **Project Organization** - Manage multiple code projects with file browsing and operations
- **Live WebSocket Updates** - Real-time status updates and task execution feedback

### AI Provider Support
- **Anthropic Claude** - Claude 3.5 Sonnet, Opus, Sonnet, Haiku
- **OpenAI ChatGPT** - GPT-4, GPT-4 Turbo, GPT-3.5 Turbo, GPT-4o
- **Google Gemini** - Gemini Pro, Gemini Pro Vision, Gemini Ultra
- **DeepSeek** - DeepSeek Chat, DeepSeek Coder

### Advanced Features

#### 1. Multi-Agent Workflows
- Sequential, parallel, conditional, and loop execution patterns
- Step dependencies and context building
- Real-time workflow status tracking
- Automatic error handling and recovery

#### 2. AI-Powered Code Review
- Automated analysis for security vulnerabilities
- Performance optimization suggestions
- Bug detection and style improvements
- Severity-based issue categorization (Critical, Error, Warning, Info)
- Project-wide review statistics

#### 3. Intelligent Testing
- AI-powered test generation from source code
- Automated test suite execution
- Isolated test environments
- Pass/fail tracking and execution metrics

#### 4. Knowledge Base (RAG)
- Semantic search across project documentation
- Document chunking and indexing
- Context-aware code search
- Multi-file knowledge aggregation

#### 5. Plugin System
- Extensible architecture for custom tools
- Provider plugins for additional AI services
- Integration plugins for external services
- Permission-based security model

### File Operations (16 Tools)
- READ_FILE, WRITE_FILE, EDIT_FILE
- LIST_FILES, SEARCH_FILES, DELETE_FILE
- CREATE_DIRECTORY, LIST_DIRECTORY
- COPY_FILE, MOVE_FILE, GET_FILE_INFO
- FIND_IN_FILES, REPLACE_IN_FILES
- BATCH_EDIT, CREATE_FILE, APPEND_TO_FILE

### Git Integration
- GIT_STATUS, GIT_DIFF, GIT_LOG
- GIT_COMMIT, GIT_PUSH, GIT_PULL
- GIT_BRANCH, GIT_CHECKOUT

### Terminal Integration
- EXECUTE_COMMAND - Run shell commands
- Real-time output streaming
- Command history and logging

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Git
- At least one AI provider API key (Gemini, DeepSeek, Claude, or OpenAI)

### Installation

1. Clone and install:
\`\`\`bash
git clone <repository-url>
cd code_agent
npm install
\`\`\`

2. Configure environment:
\`\`\`bash
cp .env.example .env
# Edit .env with your API keys
\`\`\`

3. Start development servers:
\`\`\`bash
# Terminal 1 - Backend
npm run dev --workspace=backend

# Terminal 2 - Frontend  
npm run dev --workspace=frontend
\`\`\`

4. Open http://localhost:5173

## Docker Deployment

\`\`\`bash
# Configure environment
cp .env.example .env

# Start services
docker-compose up -d

# Access at http://localhost:5173
\`\`\`

## Project Structure

\`\`\`
code_agent/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── routes/          # API endpoints  
│   │   ├── services/        # Business logic
│   │   │   ├── ai-providers/  # AI integrations
│   │   │   ├── code-reviewer.ts
│   │   │   ├── test-runner.ts
│   │   │   ├── rag-engine.ts
│   │   │   └── workflow-executor.ts
│   │   └── database/        # SQLite setup
│   └── Dockerfile
│
├── frontend/                # React + Vite SPA
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Route pages
│   │   ├── providers/       # React context
│   │   └── services/        # API client
│   ├── Dockerfile
│   └── nginx.conf
│
├── shared/                  # Shared TypeScript types
├── docker-compose.yml
└── README.md
\`\`\`

## API Keys

Obtain API keys from:
- **Gemini**: https://makersuite.google.com/app/apikey
- **DeepSeek**: https://platform.deepseek.com/
- **Claude**: https://console.anthropic.com/
- **OpenAI**: https://platform.openai.com/api-keys

Add to \`.env\`:
\`\`\`env
GEMINI_API_KEY=your_key_here
DEEPSEEK_API_KEY=your_key_here
CLAUDE_API_KEY=your_key_here  
OPENAI_API_KEY=your_key_here
\`\`\`

## Technology Stack

**Backend**: Node.js, Express, TypeScript, Socket.io, SQLite
**Frontend**: React 18, TypeScript, Vite, TailwindCSS, TanStack Query
**AI SDKs**: @anthropic-ai/sdk, openai, @google/generative-ai

## License

MIT License

---

**Privacy-first, local-first architecture - All data stays on your machine**
