# Local Code Agent Platform

A professional, web-based AI code agent platform running entirely on your local machine. Build, manage, and orchestrate multiple AI agents across your projects with support for Claude, ChatGPT, Gemini, and DeepSeek.

## ✨ Features

### Core Platform
- **Multi-Agent Management** - Create and manage multiple AI agents with different configurations
- **Real-time Task Delegation** - Assign tasks to agents across multiple projects simultaneously
- **Project Organization** - Manage multiple code projects with file browsing and operations
- **Live WebSocket Updates** - Real-time status updates and task execution feedback
- **Health Monitoring** - System health checks with database and provider status
- **Error Boundaries** - Graceful error handling with user-friendly error screens

### AI Provider Support
- **Anthropic Claude** - Claude 3.5 Sonnet, Opus, Sonnet, Haiku
- **OpenAI ChatGPT** - GPT-4, GPT-4 Turbo, GPT-3.5 Turbo, GPT-4o
- **Google Gemini** - Gemini 2.0 Flash, Gemini 1.5 Pro, Gemini 1.5 Flash
- **DeepSeek** - DeepSeek Chat, DeepSeek Coder

### Advanced Features

#### 1. Multi-Agent Workflows
- Sequential, parallel, conditional, and loop execution patterns
- Step dependencies and context building
- Real-time workflow status tracking with progress visualization
- Automatic error handling and recovery
- Workflow templates and presets

#### 2. AI-Powered Code Review
- Automated analysis for security vulnerabilities
- Performance optimization suggestions
- Bug detection and style improvements
- Severity-based issue categorization (Critical, Error, Warning, Info)
- Project-wide review statistics
- Code diff visualization with split/unified views

#### 3. Intelligent Testing
- AI-powered test generation from source code
- Automated test suite execution
- Isolated test environments
- Pass/fail tracking and execution metrics
- Test coverage analysis

#### 4. Knowledge Base (RAG)
- Semantic search across project documentation
- Document chunking and indexing
- Context-aware code search
- Multi-file knowledge aggregation
- Vector embeddings for intelligent search

#### 5. Plugin System
- Extensible architecture for custom tools
- Provider plugins for additional AI services
- Integration plugins for external services
- Permission-based security model
- Hot-reload support

### UI Components & Developer Experience

#### Interactive Code Editor
- **Monaco Editor Integration** - Full-featured code editor with IntelliSense
- Syntax highlighting for 50+ languages
- Auto-completion and code suggestions
- Multiple themes (light/dark)
- Minimap and breadcrumb navigation

#### Agent Chat Interface
- **Claude Code Style Chat** - Professional chat interface
- Syntax highlighting for code blocks
- Real-time message streaming
- Conversation history and management
- Export chat transcripts
- Multi-line input with Shift+Enter

#### Terminal Emulator
- **Full xterm.js Integration** - Native terminal experience
- Command history with arrow key navigation
- Fullscreen mode support
- Color-coded output (error, success, warning, info)
- Export command history
- Customizable themes

#### Code Diff Viewer
- **Git-style Diff Visualization** - Professional code comparison
- Split and unified view modes
- Line-by-line change tracking
- Addition/deletion statistics
- Copy diff to clipboard
- Collapsible sections

#### Task Execution Monitor
- **Real-time Progress Tracking** - Live task execution view
- WebSocket-based updates
- Color-coded execution logs
- Progress bar visualization
- Task cancellation support
- Elapsed time tracking

#### Developer Tools
- **Keyboard Shortcuts** - Global shortcut system with help dialog (Shift+?)
- **Debug Console** - Real-time log capture with filtering and export
- **API Documentation** - Interactive API reference with search
- **Agent Template Builder** - Visual template creation with presets
- **Export/Import System** - Comprehensive backup/restore functionality

#### UI/UX Features
- **Dark Mode Support** - Light/dark/system theme modes
- **Loading States** - Professional skeleton screens and progress indicators
- **Toast Notifications** - Non-intrusive feedback system
- **File Upload** - Drag-and-drop with validation
- **Multi-language (i18n)** - English and Turkish support
- **Responsive Design** - Mobile-friendly interface

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

## 🚀 Quick Start

### One-Command Installation (All Platforms)

```bash
git clone <repository-url>
cd code_agent
npm install && npm run setup
```

**Add your API keys** to `.env` file, then start:

```bash
npm start
```

Open http://localhost:5173 - Done! 🎉

### Detailed Installation

**Prerequisites:**
- Node.js 18+ and npm ([Download](https://nodejs.org/))
- At least one AI provider API key

**Step by Step:**

1. **Clone and Install**
   ```bash
   git clone <repository-url>
   cd code_agent
   npm install && npm run setup
   ```

2. **Configure API Keys**

   Windows:
   ```cmd
   notepad .env
   ```

   macOS/Linux:
   ```bash
   nano .env
   ```

   Add at least one API key:
   ```env
   GEMINI_API_KEY=your_key_here
   # or
   DEEPSEEK_API_KEY=your_key_here
   # or
   CLAUDE_API_KEY=your_key_here
   # or
   OPENAI_API_KEY=your_key_here
   ```

3. **Start the Application**
   ```bash
   npm start
   ```

   This starts both backend (port 3000) and frontend (port 5173)

4. **Access**

   Open http://localhost:5173 in your browser

**Alternative:** See [INSTALLATION.md](./INSTALLATION.md) for platform-specific instructions

## 🐳 Docker Deployment

```bash
# Configure environment
cp .env.example .env

# Start services
docker-compose up -d

# Access at http://localhost:5173
```

## 📁 Project Structure

```
code_agent/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   │   ├── agents.ts
│   │   │   ├── projects.ts
│   │   │   ├── tasks.ts
│   │   │   ├── workflows.ts
│   │   │   ├── code-reviews.ts
│   │   │   ├── testing.ts
│   │   │   ├── knowledge.ts
│   │   │   ├── plugins.ts
│   │   │   └── health.ts
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
│   │   │   ├── CodeEditor.tsx
│   │   │   ├── CodeDiffViewer.tsx
│   │   │   ├── TerminalEmulator.tsx
│   │   │   ├── TaskExecutionView.tsx
│   │   │   ├── LoadingStates.tsx
│   │   │   ├── DebugConsole.tsx
│   │   │   ├── AgentTemplateBuilder.tsx
│   │   │   ├── ExportImport.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── LanguageSelector.tsx
│   │   ├── pages/           # Route pages
│   │   │   ├── AgentsPage.tsx
│   │   │   ├── AgentDetailPage.tsx
│   │   │   ├── AgentChatPage.tsx
│   │   │   ├── ProjectsPage.tsx
│   │   │   ├── TemplatesPage.tsx
│   │   │   ├── WorkflowsPage.tsx
│   │   │   ├── CodeReviewsPage.tsx
│   │   │   ├── TestingPage.tsx
│   │   │   ├── KnowledgeBasePage.tsx
│   │   │   ├── PluginsPage.tsx
│   │   │   ├── AnalyticsPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── ApiDocsPage.tsx
│   │   ├── providers/       # React context
│   │   │   ├── WebSocketProvider.tsx
│   │   │   ├── ToastProvider.tsx
│   │   │   ├── ThemeProvider.tsx
│   │   │   ├── I18nProvider.tsx
│   │   │   └── KeyboardShortcutsProvider.tsx
│   │   ├── hooks/           # Custom hooks
│   │   │   └── useKeyboardShortcuts.ts
│   │   ├── i18n/            # Translations
│   │   │   └── translations.ts
│   │   └── services/        # API client
│   ├── Dockerfile
│   └── nginx.conf
│
├── shared/                  # Shared TypeScript types
├── docker-compose.yml
└── README.md
```

## 🔑 API Keys

Obtain API keys from:
- **Gemini**: https://makersuite.google.com/app/apikey
- **DeepSeek**: https://platform.deepseek.com/
- **Claude**: https://console.anthropic.com/
- **OpenAI**: https://platform.openai.com/api-keys

Add to `.env`:
```env
GEMINI_API_KEY=your_key_here
DEEPSEEK_API_KEY=your_key_here
CLAUDE_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: SQLite (better-sqlite3)
- **Real-time**: Socket.io
- **AI SDKs**: @anthropic-ai/sdk, openai, @google/generative-ai, axios

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: TanStack Query, Zustand
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Charts**: Recharts

### UI Components
- **Code Editor**: Monaco Editor (@monaco-editor/react)
- **Terminal**: xterm.js (@xterm/xterm)
- **Diff Viewer**: react-diff-view
- **Syntax Highlighting**: react-syntax-highlighter
- **File Upload**: react-dropzone
- **Utilities**: clsx, diff, unidiff

### DevOps
- **Containerization**: Docker, Docker Compose
- **Web Server**: Nginx (production)
- **Process Management**: npm workspaces

## ⌨️ Keyboard Shortcuts

Press `Shift+?` in the app to see all available keyboard shortcuts.

**Global Shortcuts**:
- `Ctrl/⌘+K` - Quick search
- `Shift+?` - Show keyboard shortcuts
- `Esc` - Close dialog/modal

## 🌍 Multi-language Support

The platform supports multiple languages:
- **English** (en)
- **Turkish** (tr)

Language is auto-detected from browser settings and can be changed in Settings.

## 📊 API Documentation

Access interactive API documentation at:
- **Development**: http://localhost:5173/api-docs
- **API Health Check**: http://localhost:3000/api/health

## 🔄 Backup & Restore

Use the Export/Import feature in Settings to:
- **Export**: Backup agents, projects, tasks, and settings to JSON
- **Import**: Restore from backup file
- **Selective**: Choose what to export/import

## 🎨 Themes

The platform supports three theme modes:
- **Light** - Optimized for daylight
- **Dark** - Easy on the eyes
- **System** - Follows OS preference

## 📝 Development

### Build for Production

```bash
# Build all packages
npm run build

# Build specific workspace
npm run build --workspace=frontend
npm run build --workspace=backend
```

### Type Checking

```bash
npm run typecheck --workspace=frontend
npm run typecheck --workspace=backend
```

### Project Setup

The project uses npm workspaces with three packages:
- `@local-code-agent/backend` - Express API server
- `@local-code-agent/frontend` - React SPA
- `@local-code-agent/shared` - Shared TypeScript types

## 🐛 Debugging

Enable the Debug Console in the app (bottom-right button) to:
- View real-time console logs
- Filter by log level (log, info, warn, error, debug)
- Search through logs
- Export logs to file
- View stack traces for errors

## 🔒 Security

- All data stored locally in SQLite
- No telemetry or external data transmission
- API keys stored in environment variables
- CORS configured for local development
- Input validation on all endpoints

## 🚧 Roadmap

- [ ] VS Code Extension
- [ ] CLI Interface
- [ ] More AI Providers (Ollama, LMStudio)
- [ ] Custom Workflow Builder UI
- [ ] Git GUI Integration
- [ ] Docker Desktop Extension
- [ ] Performance Analytics Dashboard

## 📄 License

MIT License

---

**Privacy-first, local-first architecture - All data stays on your machine**

Built with ❤️ for developers who value privacy and control.
