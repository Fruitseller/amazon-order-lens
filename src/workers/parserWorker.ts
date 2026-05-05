import { runParserWorkerLogic, type ParserWorkerInput } from "./parserWorkerLogic";

export type ParserWorkerRequest = {
  id: number;
  input: ParserWorkerInput;
};

export type ParserWorkerResponse =
  | { id: number; type: "progress"; progress: number }
  | { id: number; type: "complete"; result: Awaited<ReturnType<typeof runParserWorkerLogic>> }
  | { id: number; type: "error"; error: string };

self.onmessage = (event: MessageEvent<ParserWorkerRequest>) => {
  const { id, input } = event.data;
  void runParserWorkerLogic(input, (progress) => {
    self.postMessage({ id, type: "progress", progress } satisfies ParserWorkerResponse);
  })
    .then((result) => {
      self.postMessage({ id, type: "complete", result } satisfies ParserWorkerResponse);
    })
    .catch((err: unknown) => {
      const error = err instanceof Error ? err.message : "Unbekannter Fehler beim Import.";
      self.postMessage({ id, type: "error", error } satisfies ParserWorkerResponse);
    });
};
