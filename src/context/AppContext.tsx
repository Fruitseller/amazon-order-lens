import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type Dispatch,
  type ReactNode,
} from "react";
import type { AppAction, AppState } from "../types/state";
import { appReducer, initialState } from "./appReducer";

const StateContext = createContext<AppState | null>(null);
const DispatchContext = createContext<Dispatch<AppAction> | null>(null);

export interface AppProviderProps {
  children: ReactNode;
  initialOverride?: Partial<AppState>;
}

export function AppProvider({ children, initialOverride }: AppProviderProps) {
  const seeded = useMemo<AppState>(
    () => ({ ...initialState, ...initialOverride }),
    [initialOverride],
  );
  const [state, dispatch] = useReducer(appReducer, seeded);
  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>{children}</DispatchContext.Provider>
    </StateContext.Provider>
  );
}

export function useAppState(): AppState {
  const state = useContext(StateContext);
  if (state === null) {
    throw new Error("useAppState must be used within an AppProvider");
  }
  return state;
}

export function useAppDispatch(): Dispatch<AppAction> {
  const dispatch = useContext(DispatchContext);
  if (dispatch === null) {
    throw new Error("useAppDispatch must be used within an AppProvider");
  }
  return dispatch;
}
