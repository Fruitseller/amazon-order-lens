import { useCallback } from "react";
import { useAppDispatch } from "../context/AppContext";
import { runParserWorkerLogic, type ParserWorkerInput } from "../workers/parserWorkerLogic";
import { saveData } from "../services/indexedDBService";

function detectKind(file: File): "zip" | "csv" | "unknown" {
  const name = file.name.toLowerCase();
  if (name.endsWith(".zip")) return "zip";
  if (name.endsWith(".csv")) return "csv";
  const type = file.type.toLowerCase();
  if (type.includes("zip")) return "zip";
  if (type.includes("csv")) return "csv";
  return "unknown";
}

async function fileToInput(file: File): Promise<ParserWorkerInput> {
  const kind = detectKind(file);
  if (kind === "zip") {
    const data = await file.arrayBuffer();
    return { kind: "zip", data };
  }
  if (kind === "csv") {
    const data = await file.text();
    return { kind: "csv", data };
  }
  throw new Error(
    "Dateiformat nicht erkannt. Bitte lade eine .zip (Amazon-Export) oder .csv Datei hoch.",
  );
}

export function useFileImport(): (file: File) => Promise<void> {
  const dispatch = useAppDispatch();

  return useCallback(
    async (file: File) => {
      dispatch({ type: "IMPORT_START" });
      try {
        const input = await fileToInput(file);
        const result = await runParserWorkerLogic(input, (progress) => {
          dispatch({ type: "IMPORT_PROGRESS", progress });
        });
        // IndexedDB zuerst persistieren, dann erst dispatch — so ist die Dashboard-Anzeige
        // zugleich das Signal, dass die Daten reload-fest sind.
        try {
          await saveData(
            result.items,
            result.orders,
            result.returns,
            result.returnRequests,
          );
        } catch (saveErr) {
          console.error("[useFileImport] saveData failed:", saveErr);
        }
        dispatch({
          type: "IMPORT_COMPLETE",
          items: result.items,
          orders: result.orders,
          returns: result.returns,
          returnRequests: result.returnRequests,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unbekannter Fehler beim Import.";
        dispatch({ type: "IMPORT_ERROR", error: message });
      }
    },
    [dispatch],
  );
}
