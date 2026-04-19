import { useCallback, useEffect } from "react";
import { useAppDispatch } from "../context/AppContext";
import { clearData, loadData } from "../services/indexedDBService";

export interface IndexedDBHandle {
  clear: () => Promise<void>;
}

export function useIndexedDB(): IndexedDBHandle {
  const dispatch = useAppDispatch();

  useEffect(() => {
    let cancelled = false;
    void loadData().then((data) => {
      if (cancelled || !data) return;
      dispatch({
        type: "IMPORT_COMPLETE",
        items: data.items,
        orders: data.orders,
        returns: data.returns,
      });
    });
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  const clear = useCallback(async () => {
    await clearData();
    dispatch({ type: "CLEAR_DATA" });
  }, [dispatch]);

  return { clear };
}
