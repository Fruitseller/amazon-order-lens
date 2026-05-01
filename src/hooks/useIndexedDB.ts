import { useCallback, useEffect } from "react";
import { useAppDispatch } from "../context/AppContext";
import { clearData, loadData } from "../services/indexedDBService";

// Hydratisiert den App-State einmalig aus IndexedDB. Genau einmal pro Mount aufrufen,
// üblicherweise im AppShell — sonst feuern doppelte Loads beim ersten Render.
export function useLoadPersistedData(): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;
    void loadData().then((data) => {
      if (cancelled || !data) return;
      dispatch({
        type: "IMPORT_COMPLETE",
        items: data.items,
        orders: data.orders,
        returns: data.returns ?? [],
        returnRequests: data.returnRequests ?? [],
      });
    });
    return () => {
      cancelled = true;
    };
  }, [dispatch]);
}

export function useClearPersistedData(): () => Promise<void> {
  const dispatch = useAppDispatch();

  return useCallback(async () => {
    await clearData();
    dispatch({ type: "CLEAR_DATA" });
  }, [dispatch]);
}
