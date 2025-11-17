# Local Code Agent Platform

A powerful, local web-based code agent platform inspired by Claude Code. Create and manage multiple AI agents, execute tasks across different projects, and integrate with various AI providers—all from a professional web interface.

## Features

- 🤖 **Multi-Agent Management**: Create and manage multiple AI agents simultaneously
- 🔌 **Multiple AI Providers**: Support for Claude, ChatGPT, Gemini, DeepSeek, and more
- 🚀 **Real-time Execution**: Monitor tasks and agent activities in real-time
- 📁 **Project Workspace Management**: Organize and switch between multiple projects
- ⚙️ **UI-Based Configuration**: Configure all settings through an intuitive web interface
- 🔒 **Local & Private**: Runs entirely on your local machine
- 💼 **Professional Architecture**: Clean, maintainable, and scalable codebase

## Architecture

```
┌─────────────────────────────────────────────┐
│          Web Interface (React)              │
│  ┌─────────┐ ┌─────────┐ ┌─────────────┐  │
│  │ Agents  │ │Projects │ │  Settings   │  │
│  └─────────┘ └─────────┘ └─────────────┘  │
└─────────────────┬───────────────────────────┘
                  │ WebSocket + REST
┌─────────────────┴───────────────────────────┐
│         Backend (Node.js + Express)         │
│  ┌──────────────────────────────────────┐  │
│  │      Agent Orchestration Engine       │  │
│  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────┐  │
│  │    Unified AI Provider Interface      │  │
│  │  ┌────────┐ ┌────────┐ ┌──────────┐  │  │
│  │  │ Claude │ │  GPT   │ │  Gemini  │  │  │
│  │  └────────┘ └────────┘ └──────────┘  │  │
│  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────┐  │
│  │       SQLite Database (Local)         │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys
```

### Development

```bash
# Start both frontend and backend in development mode
npm run dev

# Or start them separately:
npm run dev:frontend  # Frontend at http://localhost:5173
npm run dev:backend   # Backend at http://localhost:3000
```

### Production Build

```bash
# Build all packages
npm run build

# Start the production server
npm start
```

## Configuration

All configuration can be managed through the web UI at `http://localhost:5173/settings` or by editing the `.env` file:

```env
# AI Provider API Keys
ANTHROPIC_API_KEY=your_claude_api_key
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_gemini_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key

# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_PATH=./data/agents.db
```

## Project Structure

```
local-code-agent-platform/
├── frontend/           # React web interface
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API clients
│   │   ├── stores/     # State management
│   │   └── types/      # TypeScript types
│   └── package.json
├── backend/            # Node.js API server
│   ├── src/
│   │   ├── agents/     # Agent management
│   │   ├── providers/  # AI provider adapters
│   │   ├── services/   # Business logic
│   │   ├── routes/     # API routes
│   │   └── database/   # Database models
│   └── package.json
├── shared/             # Shared types and utilities
│   └── src/
│       └── types/      # Shared TypeScript types
└── package.json        # Root package.json
```

## Usage

### Creating an Agent

1. Navigate to the **Agents** tab
2. Click **Create New Agent**
3. Configure:
   - Agent name
   - AI provider (Claude, GPT, Gemini, etc.)
   - Model selection
   - System prompts
4. Click **Create**

### Managing Projects

1. Go to **Projects** tab
2. Add a project workspace by selecting a directory
3. Assign agents to projects
4. Execute tasks through the chat interface

### Real-time Task Execution

- View agent activities in real-time
- Monitor task progress
- See logs and outputs
- Cancel or modify running tasks

## API Documentation

### REST Endpoints

- `GET /api/agents` - List all agents
- `POST /api/agents` - Create a new agent
- `GET /api/agents/:id` - Get agent details
- `PUT /api/agents/:id` - Update agent
- `DELETE /api/agents/:id` - Delete agent
- `POST /api/agents/:id/execute` - Execute a task

### WebSocket Events

- `agent:created` - New agent created
- `agent:updated` - Agent updated
- `agent:deleted` - Agent deleted
- `task:started` - Task execution started
- `task:progress` - Task progress update
- `task:completed` - Task completed
- `task:error` - Task error occurred

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on the GitHub repository.