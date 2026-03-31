# Copilot Instructions

## Project Overview

LLM API Comparator — a static Astro + React app that lets users compare pricing and features across 50+ LLM APIs. Single-page application with interactive React islands.

## Commands

```bash
npm run dev        # Dev server at localhost:3000
npm run build      # Build to ./dist/
npm run preview    # Preview production build
npm run generate-icons  # Regenerate favicon/icon assets from SVGs in public/
```

No lint or test commands are configured.

## Architecture

**Astro + React Islands**: `src/pages/index.astro` is the sole page. It mounts `<PageContent>` — a React tree that wraps the entire interactive UI. Astro handles static rendering; React handles all interactivity.

**State**: Redux-style `useReducer` in `src/store/appStore.tsx`. A single `AppProvider` at the top of the React tree exposes state and dispatch via two separate contexts (`StateContext`, `DispatchContext` in `src/store/context.ts`). Components consume state with `useAppState()` and dispatch with `useAppDispatch()`. Never prop-drill global state — dispatch through the store.

**State shape** (key fields):
```typescript
{
  pricingStore: { models: LLMModel[], last_updated: string, version: number },
  selectedModels: string[],   // model IDs, max 6 (MAX_SELECTED)
  filters: FilterState,
  toasts: ToastData[],
  isRefreshing: boolean,
  isSyncingBackend: boolean,
}
```

**Data sourcing**: On mount, `src/lib/modelsApi.ts` checks localStorage (`llm_backend_sync_at`) for a 3-day TTL. If stale, it fetches `PUBLIC_BACKEND_URL + '/llm-models'`. On failure, it silently falls back to the bundled `src/data/models.ts`. The backend response is transformed from `RawBackendModel` → `LLMModel`.

**Cross-component communication** (outside the store): Custom DOM events via `window.dispatchEvent(new CustomEvent(...))`. Key events: `llm:theme-change`, `llm:lang-change`, `open-about-modal`.

**URL sync**: Selected model IDs are written to/read from the URL hash as `#compare=model-a,model-b` — keep this bidirectional sync intact when touching selection logic.

## Key Conventions

**Naming**:
- Components: `PascalCase` files and function names
- Custom hooks: `use*` prefix; store hooks are `useAppState`, `useAppDispatch`, `useFilteredModels`
- Types/Interfaces: `PascalCase`, Props interfaces end in `Props` (e.g. `ModelCardProps`)
- Constants: `UPPER_SNAKE_CASE` (e.g. `PROVIDER_COLORS`, `MAX_SELECTED`, `DEFAULT_FILTERS`)

**Styling**: Tailwind utility classes throughout. Dark mode via `.dark` class on `<html>`. Provider-specific colors come from `PROVIDER_COLORS` in `src/lib/utils.ts` — use that map rather than hardcoding colors per provider.

**i18n**: All user-facing strings use `const { t } = useI18n()` with dot-notation keys (e.g. `t('header.compare')`). Add new strings to all four locale files: `src/i18n/locales/{en,es,pt,fr}.ts`. Never hardcode UI text in components.

**localStorage keys**: `llm_pricing_store`, `llm-theme`, `llm-lang`, `llm_backend_sync_at`. Managed via `src/lib/storage.ts` — use that module for any new persistence needs.

**Code examples**: Provider-specific SDK snippets are generated in `src/lib/apiSnippets.ts`. A `snippet_js` field from the backend overrides local snippets. Follow the existing provider-routing pattern when adding new providers.

## TypeScript

Strict mode (`astro/tsconfigs/strict`). Reducer actions are discriminated unions — add new action types to the union in `appStore.tsx`. All types live in `src/types/index.ts`; extend there, don't define inline types for shared models.

## Environment Variables

| Variable | Purpose |
|---|---|
| `PUBLIC_BACKEND_URL` | Backend API base URL (defaults to `http://localhost:3000`) |

Prefix any new Astro-exposed env vars with `PUBLIC_`.
