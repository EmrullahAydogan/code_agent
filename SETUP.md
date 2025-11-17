# Setup Guide

This guide will help you set up and run the Local Code Agent Platform on your machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

You can check your versions with:
```bash
node --version
npm --version
```

## Step 1: Install Dependencies

From the project root directory, install all dependencies:

```bash
npm install
```

This will install dependencies for all workspaces (shared, backend, and frontend).

## Step 2: Configure Environment Variables

### Backend Configuration

1. Copy the example environment file:
```bash
cp backend/.env.example backend/.env
```

2. Edit `backend/.env` and add your AI provider API keys:

```env
# Required: Add at least one API key
ANTHROPIC_API_KEY=your_claude_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
GOOGLE_API_KEY=your_gemini_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here

# Optional: Customize server settings
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
DATABASE_PATH=./data/agents.db
```

### Where to Get API Keys

- **Claude (Anthropic)**: https://console.anthropic.com/
- **ChatGPT (OpenAI)**: https://platform.openai.com/api-keys
- **Gemini (Google)**: https://makersuite.google.com/app/apikey
- **DeepSeek**: https://platform.deepseek.com/

Note: You only need to configure the API keys for the providers you plan to use.

## Step 3: Build Shared Package

Build the shared types package that both frontend and backend depend on:

```bash
npm run build --workspace=shared
```

## Step 4: Start the Application

### Option A: Start Everything (Recommended for Development)

Start both backend and frontend together:

```bash
npm run dev
```

This will start:
- Backend API server at http://localhost:3000
- Frontend web app at http://localhost:5173

### Option B: Start Services Separately

In separate terminal windows:

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

## Step 5: Access the Application

Open your browser and navigate to:

```
http://localhost:5173
```

You should see the Local Code Agent Platform interface!

## Step 6: Create Your First Agent

1. Click **"Create Agent"** button
2. Fill in the agent details:
   - Name: e.g., "My Coding Assistant"
   - Description: Optional description
   - AI Provider: Choose your preferred provider
   - Model: Select a model
   - API Key: Enter your API key for the selected provider
3. Click **"Create Agent"**

## Step 7: Start Using Your Agent

1. Click on your agent card to open the chat interface
2. Type a prompt in the input field
3. Click **"Send"** or press Enter
4. Watch as your agent processes the request and responds in real-time

## Production Build

To build for production:

```bash
# Build all packages
npm run build

# Start the production server
npm start
```

The production build will be served at http://localhost:3000

## Troubleshooting

### Port Already in Use

If port 3000 or 5173 is already in use, you can change them:

**Backend Port:**
Edit `backend/.env`:
```env
PORT=3001
```

**Frontend Port:**
Edit `frontend/vite.config.ts`:
```typescript
server: {
  port: 5174,
  // ...
}
```

### Database Issues

If you encounter database issues, delete the database file and restart:

```bash
rm -rf backend/data/agents.db
npm run dev:backend
```

### WebSocket Connection Issues

Make sure:
1. Backend is running on port 3000 (or your configured port)
2. Frontend proxy is configured correctly in `frontend/vite.config.ts`
3. No firewall is blocking the connection

### API Key Errors

If you get API key errors:
1. Verify your API key is correct in `backend/.env`
2. Ensure you have credits/quota available for that provider
3. Check if the API key has the necessary permissions

## Advanced Configuration

### Custom Base URLs

If you're using proxy servers or custom endpoints:

```env
ANTHROPIC_BASE_URL=https://your-proxy.com
OPENAI_BASE_URL=https://your-proxy.com/v1
```

### Database Location

To change the database location:

```env
DATABASE_PATH=/path/to/custom/location/agents.db
```

### System Settings

You can configure default settings through the UI:

1. Navigate to **Settings** page
2. Adjust default provider, model, concurrent tasks, etc.
3. Click **"Save Settings"**

## Development

### Project Structure

```
local-code-agent-platform/
├── frontend/           # React web interface
├── backend/            # Node.js API server
├── shared/             # Shared TypeScript types
└── package.json        # Root package.json
```

### Available Scripts

- `npm run dev` - Start both frontend and backend in dev mode
- `npm run build` - Build all packages
- `npm run typecheck` - Run TypeScript type checking
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend

### Adding New AI Providers

To add a new AI provider:

1. Add the provider to `shared/src/types/index.ts` enum
2. Create a new provider class in `backend/src/providers/`
3. Implement the `BaseAIProvider` interface
4. Register it in `backend/src/providers/index.ts`
5. Add model options in the frontend modal

## Support

For issues and questions:
- Check the main README.md
- Review the troubleshooting section above
- Open an issue on GitHub

## Next Steps

- Create multiple agents with different providers
- Add project workspaces for your codebases
- Experiment with different system prompts
- Configure advanced settings for optimal performance

Happy coding with your AI agents!
