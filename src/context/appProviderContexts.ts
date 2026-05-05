import { createContext, type Dispatch } from "react";
import type { AppAction, AppState } from "../types/state";

export const StateContext = createContext<AppState | null>(null);
export const DispatchContext = createContext<Dispatch<AppAction> | null>(null);
