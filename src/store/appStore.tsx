import {
  useContext,
  useReducer,
  useEffect,
  type ReactNode,
  type Dispatch,
} from 'react';
import { StateContext, DispatchContext } from './context';
import type { PricingStore, FilterState } from '../types/index';
import { DEFAULT_FILTERS } from '../types/index';
import { loadStore, saveStore } from '../lib/storage';
import { getInitialStore } from '../data/models';
import {
  fetchModelsFromBackend,
  isBackendCacheStale,
  markBackendFetched,
  getLastBackendFetch,
} from '../lib/modelsApi';
import type { ToastData } from '../components/ui/Toast';

// ─── State ────────────────────────────────────────────────────────────────────
interface AppState {
  pricingStore:       PricingStore;
  selectedModels:     string[];
  filters:            FilterState;
  isRefreshing:       boolean;
  isSyncingBackend:   boolean;
  lastBackendSync:    number | null; // ms timestamp
  toasts:             ToastData[];
}

// ─── Actions ──────────────────────────────────────────────────────────────────
type Action =
  | { type: 'SELECT_MODEL';        id: string }
  | { type: 'DESELECT_MODEL';      id: string }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'SET_FILTER';          filter: Partial<FilterState> }
  | { type: 'RESET_FILTERS' }
  | { type: 'SET_STORE';           store: PricingStore }
  | { type: 'SET_REFRESHING';      value: boolean }
  | { type: 'SET_SYNCING_BACKEND'; value: boolean }
  | { type: 'SET_LAST_SYNC';       ts: number }
  | { type: 'ADD_TOAST';           toast: Omit<ToastData, 'id'> }
  | { type: 'REMOVE_TOAST';        id: string };

const MAX_SELECTED = 6;

function createToast(input: Omit<ToastData, 'id'>): ToastData {
  return { ...input, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SELECT_MODEL': {
      if (state.selectedModels.includes(action.id)) return state;
      if (state.selectedModels.length >= MAX_SELECTED) {
        const toast = createToast({
          type:    'warning',
          message: `Maximum ${MAX_SELECTED} models selected. Remove one to add another.`,
        });
        return { ...state, toasts: [...state.toasts, toast] };
      }
      return { ...state, selectedModels: [...state.selectedModels, action.id] };
    }

    case 'DESELECT_MODEL':
      return {
        ...state,
        selectedModels: state.selectedModels.filter(id => id !== action.id),
      };

    case 'CLEAR_SELECTION':
      return { ...state, selectedModels: [] };

    case 'SET_FILTER':
      return { ...state, filters: { ...state.filters, ...action.filter } };

    case 'RESET_FILTERS':
      return { ...state, filters: { ...DEFAULT_FILTERS } };

    case 'SET_STORE':
      return { ...state, pricingStore: action.store };

    case 'SET_REFRESHING':
      return { ...state, isRefreshing: action.value };

    case 'SET_SYNCING_BACKEND':
      return { ...state, isSyncingBackend: action.value };

    case 'SET_LAST_SYNC':
      return { ...state, lastBackendSync: action.ts };

    case 'ADD_TOAST': {
      const toast = createToast(action.toast);
      return { ...state, toasts: [...state.toasts, toast] };
    }

    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) };

    default:
      return state;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    pricingStore:     getInitialStore(), // SSR-safe: matches server output; localStorage hydrated after mount
    selectedModels:   [],
    filters:          { ...DEFAULT_FILTERS },
    isRefreshing:     false,
    isSyncingBackend: false,
    lastBackendSync:  null, // null on SSR; loaded from localStorage after mount
    toasts:           [],
  }));

  // Hydrate from localStorage after mount (avoids SSR/client hydration mismatch)
  useEffect(() => {
    const stored = loadStore();
    dispatch({ type: 'SET_STORE', store: stored });
    const ts = getLastBackendFetch();
    if (ts !== null) dispatch({ type: 'SET_LAST_SYNC', ts });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Parse URL hash on mount: #compare=model-a,model-b
  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/[#&]compare=([^&]+)/);
    if (match) {
      const ids = match[1].split(',').filter(Boolean).slice(0, MAX_SELECTED);
      const validIds = ids.filter(id =>
        state.pricingStore.models.some(m => m.id === id)
      );
      if (validIds.length) {
        validIds.forEach(id => dispatch({ type: 'SELECT_MODEL', id }));
        dispatch({
          type: 'ADD_TOAST',
          toast: { type: 'info', message: 'Comparison loaded from shared link' },
        });
      }
    }
    // We only want this to run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist store to localStorage when it changes
  useEffect(() => {
    saveStore(state.pricingStore);
  }, [state.pricingStore]);

  // Sync selectedModels → URL hash (write direction)
  useEffect(() => {
    const hash = state.selectedModels.length
      ? `#compare=${state.selectedModels.join(',')}`
      : window.location.pathname;
    window.history.replaceState(null, '', hash);
  }, [state.selectedModels]);

  // Fetch from backend on mount if cache is stale (> 3 days)
  useEffect(() => {
    if (!isBackendCacheStale()) return;
    dispatch({ type: 'SET_SYNCING_BACKEND', value: true });
    fetchModelsFromBackend()
      .then((store) => {
        dispatch({ type: 'SET_STORE', store });
        markBackendFetched();
        const ts = Date.now();
        dispatch({ type: 'SET_LAST_SYNC', ts });
        dispatch({ type: 'ADD_TOAST', toast: { type: 'success', message: 'Models updated successfully' } });
      })
      .catch(() => {
        // Silently fail — use local data
      })
      .finally(() => {
        dispatch({ type: 'SET_SYNCING_BACKEND', value: false });
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StateContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────
export function useAppState(): AppState {
  const ctx = useContext(StateContext);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}

export function useAppDispatch(): Dispatch<Action> {
  const ctx = useContext(DispatchContext);
  if (!ctx) throw new Error('useAppDispatch must be used within AppProvider');
  return ctx;
}

// ─── Derived selectors ────────────────────────────────────────────────────────
export function useFilteredModels() {
  const { pricingStore, filters } = useAppState();
  const { models } = pricingStore;

  return models.filter(model => {
    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (
        !model.name.toLowerCase().includes(q) &&
        !model.provider.toLowerCase().includes(q) &&
        !model.description.toLowerCase().includes(q)
      ) return false;
    }
    // Providers
    if (filters.providers.length && !filters.providers.includes(model.provider)) return false;
    // Types
    if (filters.types.length && !filters.types.includes(model.type)) return false;
    // Capabilities
    if (
      filters.capabilities.length &&
      !filters.capabilities.every(cap => model.capabilities.includes(cap))
    ) return false;
    // Local
    if (!filters.show_local && model.is_local) return false;
    // Max price
    if (
      filters.max_price_per_1m !== null &&
      !model.is_local &&
      model.pricing.input_per_1m > filters.max_price_per_1m
    ) return false;

    return true;
  });
}

// ─── Backend sync hook ────────────────────────────────────────────────────────
export function useBackendSync() {
  const { isSyncingBackend, lastBackendSync } = useAppState();
  const dispatch = useAppDispatch();

  const triggerSync = () => {
    dispatch({ type: 'SET_SYNCING_BACKEND', value: true });
    fetchModelsFromBackend()
      .then((store) => {
        dispatch({ type: 'SET_STORE', store });
        markBackendFetched();
        const ts = Date.now();
        dispatch({ type: 'SET_LAST_SYNC', ts });
        dispatch({ type: 'ADD_TOAST', toast: { type: 'success', message: 'Models updated successfully' } });
      })
      .catch(() => {
        dispatch({ type: 'ADD_TOAST', toast: { type: 'error', message: 'Failed to update models' } });
      })
      .finally(() => {
        dispatch({ type: 'SET_SYNCING_BACKEND', value: false });
      });
  };

  return { isSyncingBackend, lastBackendSync, triggerSync };
}
