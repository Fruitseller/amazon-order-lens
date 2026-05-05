import { runParserWorkerLogic, type ParserWorkerInput, type ParserWorkerResult, type ProgressListener } from "./parserWorkerLogic";
import type { ParserWorkerResponse } from "./parserWorker";

let nextRequestId = 1;

export function parseInWorker(
  input: ParserWorkerInput,
  onProgress?: ProgressListener,
): Promise<ParserWorkerResult> {
  if (typeof Worker === "undefined") {
    return runParserWorkerLogic(input, onProgress);
  }

  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL("./parserWorker.ts", import.meta.url), {
      type: "module",
    });
    const requestId = nextRequestId++;

    worker.onmessage = (event: MessageEvent<ParserWorkerResponse>) => {
      const message = event.data;
      if (message.id !== requestId) return;

      if (message.type === "progress") {
        onProgress?.(message.progress);
        return;
      }

      worker.terminate();
      if (message.type === "complete") {
        resolve(message.result);
      } else {
        reject(new Error(message.error));
      }
    };

    worker.onerror = (event) => {
      worker.terminate();
      reject(new Error(event.message || "Import-Worker konnte nicht ausgeführt werden."));
    };

    worker.postMessage({ id: requestId, input });
  });
}
