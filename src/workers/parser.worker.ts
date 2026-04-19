import { runParserWorkerLogic, type ParserWorkerInput } from "./parserWorkerLogic";

interface WorkerRequest {
  id: string;
  input: ParserWorkerInput;
}

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const { id, input } = event.data;
  try {
    const result = await runParserWorkerLogic(input, (progress) => {
      self.postMessage({ type: "progress", id, progress });
    });
    self.postMessage({ type: "complete", id, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    self.postMessage({ type: "error", id, error: message });
  }
};
