# Contributing

## Development Setup

1. Install dependencies: `pnpm install`
2. Setup database: `pnpm db:migrate`
3. Start Redis locally
4. Copy `.env.example` to `.env` and fill in values
5. Start dev servers:
   - `pnpm dev:studio` (UI)
   - `pnpm dev:api` (API)
   - `pnpm worker` (Job processor)

## Testing

```bash
pnpm test
```

## Code Style

- TypeScript strict mode
- ESLint + Prettier (if configured)
- Follow existing patterns

## Pull Requests

1. Create feature branch
2. Make changes
3. Test thoroughly
4. Submit PR with description
