# Contributing to Local Code Agent Platform

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/your-username/local-code-agent-platform.git`
3. Create a feature branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Commit with clear messages: `git commit -m "Add: your feature description"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Create a Pull Request

## Development Setup

Follow the [SETUP.md](./SETUP.md) guide to set up your development environment.

## Code Style

- Use TypeScript for all new code
- Follow existing code formatting and conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused

## Commit Message Guidelines

Use conventional commit format:

- `feat: add new feature`
- `fix: resolve bug`
- `docs: update documentation`
- `style: formatting changes`
- `refactor: code restructuring`
- `test: add tests`
- `chore: maintenance tasks`

## Testing

Before submitting a PR:

1. Ensure all TypeScript compiles without errors: `npm run typecheck`
2. Test your changes manually
3. Verify the app works in both development and production modes

## Adding New Features

### Adding a New AI Provider

1. Update `AIProvider` enum in `shared/src/types/index.ts`
2. Create provider class in `backend/src/providers/your-provider.ts`
3. Implement `BaseAIProvider` interface
4. Register in `backend/src/providers/index.ts`
5. Update frontend model selection in `CreateAgentModal.tsx`
6. Update documentation

### Adding API Endpoints

1. Create route handler in `backend/src/routes/`
2. Register route in `backend/src/routes/index.ts`
3. Update API client in `frontend/src/services/api.ts`
4. Add TypeScript types in `shared/src/types/`

### Adding UI Components

1. Create component in `frontend/src/components/`
2. Use Tailwind CSS for styling
3. Follow existing component patterns
4. Make components reusable when possible

## Pull Request Process

1. Update documentation if needed
2. Ensure your code follows the project's style
3. Write clear PR description explaining changes
4. Link related issues
5. Wait for review and address feedback

## Questions?

Feel free to open an issue for:
- Bug reports
- Feature requests
- Questions about the codebase
- General discussions

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Keep discussions professional

Thank you for contributing!
