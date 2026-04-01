# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run setup       # First-time setup: install deps, generate Prisma client, run migrations
npm run dev         # Start dev server with Turbopack
npm run build       # Production build
npm run lint        # ESLint via Next.js
npm run test        # Run all Vitest tests
npm run db:reset    # Force reset the SQLite database
```

Run a single test file:
```bash
npx vitest run src/components/chat/__tests__/ChatInterface.test.tsx
```

The dev server uses `NODE_OPTIONS='--require ./node-compat.cjs'` for Node.js compatibility — this is handled automatically by the npm script.

## Architecture

UIGen is an AI-powered React component generator with live preview. Users describe components in chat; Claude generates code into a virtual file system; the preview renders it in an iframe via browser-side Babel transformation.

### Request Flow

```
Chat input → useChat (AI SDK) → /api/chat → Claude model
    → tool calls (str_replace_editor / file_manager)
    → FileSystemContext (in-memory VirtualFileSystem)
    → PreviewFrame (iframe + Babel + esm.sh import map)
    → DB persistence (if authenticated)
```

### Key Abstractions

**Virtual File System** (`src/lib/file-system.ts`)
In-memory Map-based tree. No disk writes. Claude operates on this via two tools:
- `str_replace_editor` — create, view, replace content, insert lines
- `file_manager` — rename, delete files/directories

Tool call results flow through `FileSystemContext` (`src/lib/contexts/file-system-context.tsx`), which owns the VFS state and auto-selects the active file for the editor.

**JSX Transformer** (`src/lib/transform/jsx-transformer.ts`)
Runs entirely in-browser. Uses Babylon + Babel to transform JSX, resolves `@/` path aliases within the VFS, and fetches third-party packages from `esm.sh` CDN as blob URLs. Returns errors rather than throwing.

**AI Provider** (`src/lib/provider.ts`)
Switches between the real Anthropic Claude model (claude-haiku-4-5) and a `MockLanguageModel` when no API key is set. The mock returns one of three static component types (counter, form, card) for demo purposes.

**Generation Prompt** (`src/lib/prompts/generation.tsx`)
System prompt that instructs Claude to act as a React component engineer:
- Entry point must be `/App.jsx`
- Use `@/` aliases for cross-file imports
- Style exclusively with Tailwind CSS
- Operate on the virtual file system, never reference file paths literally

**Authentication** (`src/lib/auth.ts`)
JWT sessions (7-day, HttpOnly cookies, JOSE library). Default secret is `"development-secret-key"` — override with `AUTH_SECRET` env var. Middleware at `src/middleware.ts` protects `/api/projects` and `/api/filesystem`.

### UI Layout

`src/app/main-content.tsx` is the core layout:
- **Left panel (35%):** `ChatInterface` — message list + input
- **Right panel (65%):** `PreviewFrame` (default) or `CodeEditor` + `FileTree` (toggled via tabs)

Anonymous users land on `/` and get an ephemeral session. Authenticated users are redirected to their latest project at `/[projectId]`.

### Database

SQLite via Prisma (`prisma/schema.prisma`). Two models: `User` and `Project`. Projects store the serialized VFS (`data`) and chat history (`messages`) as JSON strings.

### Path Aliases

`@/` maps to `src/` (configured in `tsconfig.json`). Vitest resolves the same aliases via `vitest.config.mts`.
