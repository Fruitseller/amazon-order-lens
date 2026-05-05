import { useContext, type Dispatch } from "react";
import type { AppAction, AppState } from "../types/state";
import { DispatchContext, StateContext } from "./appProviderContexts";

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
