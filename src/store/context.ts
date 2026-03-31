/**
 * Stable context singletons for the app store.
 *
 * Kept in a separate file so that HMR re-evaluation of appStore.tsx
 * (triggered by locale / i18n changes propagating through the module graph)
 * does NOT create new context objects.  Vite returns the cached module here,
 * preserving the same context references across hot-reloads and ensuring that
 * AppProvider and its consumer hooks always agree on which context to use.
 */
import { createContext, type Dispatch } from 'react';

// Typed as `any` here to avoid a circular dependency between context.ts and
// appStore.tsx.  All public access goes through the typed hooks (useAppState /
// useAppDispatch) defined in appStore.tsx, so there is no real type-safety loss.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const StateContext = createContext<any>(null);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DispatchContext = createContext<Dispatch<any>>((() => {}) as Dispatch<any>);
