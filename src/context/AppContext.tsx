import { useMemo, useReducer, type ReactNode } from "react";
import type { AppState } from "../types/state";
import { appReducer, initialState } from "./appReducer";
import { DispatchContext, StateContext } from "./appProviderContexts";

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

