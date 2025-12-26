# Pandactory - Claude Code Instructions

## Deployment Requirements

**CRITICAL: All code changes must work on BOTH:**
1. **Local development** (`npm run dev` at `http://localhost:3000`)
2. **GitHub Pages** (`https://mattiasmalmborg.github.io/pandactory/`)

### Asset Paths

- **NEVER** use hardcoded absolute paths like `/assets/...`
- **ALWAYS** use the asset system from `src/config/assets.ts`:
  - `ASSET_CONFIG` for static asset references
  - `ASSET_PATHS` for dynamic path building
  - Helper functions: `getBiomeIconPath()`, `getBiomeBackgroundPath()`, etc.

The asset system uses `import.meta.env.BASE_URL` which automatically resolves to:
- `/` in development
- `/pandactory/` in production (GitHub Pages)

### Adding New Assets

1. Place assets in `public/assets/` subdirectories
2. Add path to `src/config/assets.ts` using the `${BASE}` prefix
3. Import and use via `ASSET_CONFIG` or helper functions

### Static Files (index.html, manifest.json)

Use **relative paths** (without leading `/`):
- `assets/ui/icon.png` (correct)
- `/assets/ui/icon.png` (wrong - breaks on GitHub Pages)

### Vite Config

The base path is configured in `vite.config.ts`:
```ts
base: command === 'serve' ? '/' : '/pandactory/',
```

## Version Management

- Version is stored in `src/game/state/GameState.ts` as `INITIAL_GAME_STATE.version`
- Also in `package.json`
- Displayed in Statistics page
- Old saves are auto-migrated to current version on load

## Git Workflow

Large files (>100MB) are blocked by GitHub. The following are in `.gitignore`:
- `*.psd` files
- `public/photoshop/` directory
- Local documentation files (DEV-README.md, ASSETS.md, TESTING.md, TO-DO.txt)
