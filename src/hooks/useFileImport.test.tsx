import { beforeEach, describe, expect, it } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import JSZip from "jszip";
import type { ReactNode } from "react";
import { useFileImport } from "./useFileImport";
import { useAppState } from "../context/AppContext";
import { AppProvider } from "../context/AppContext";
import { resetIndexedDB } from "../../test/helpers/fakeIndexedDB";
import { DB_NAME } from "../services/indexedDBService";

const FIXTURES_DIR = join(__dirname, "..", "..", "test", "fixtures");
const SAMPLE_CSV = readFileSync(join(FIXTURES_DIR, "sample-orders.csv"), "utf-8");

function Wrapper({ children }: { children: ReactNode }) {
  return <AppProvider>{children}</AppProvider>;
}

async function makeZipFile(csvContent: string, fileName = "export.zip"): Promise<File> {
  const zip = new JSZip();
  zip.file("Retail.OrderHistory.1.csv", csvContent);
  const buf = await zip.generateAsync({ type: "arraybuffer" });
  return new File([buf], fileName, { type: "application/zip" });
}

function makeCsvFile(content: string, fileName = "orders.csv"): File {
  return new File([content], fileName, { type: "text/csv" });
}

beforeEach(async () => {
  await resetIndexedDB(DB_NAME);
});

describe("useFileImport — CSV", () => {
  it("parses a CSV file and populates state via IMPORT_COMPLETE", async () => {
    const { result } = renderHook(
      () => ({ importFile: useFileImport(), state: useAppState() }),
      { wrapper: Wrapper },
    );
    await act(async () => {
      await result.current.importFile(makeCsvFile(SAMPLE_CSV));
    });
    expect(result.current.state.isDataLoaded).toBe(true);
    expect(result.current.state.items.length).toBeGreaterThan(0);
    expect(result.current.state.orders.length).toBeGreaterThan(0);
    expect(result.current.state.isImporting).toBe(false);
    expect(result.current.state.importError).toBeNull();
  });
});

describe("useFileImport — ZIP", () => {
  it("extracts a ZIP file and populates state", async () => {
    const zipFile = await makeZipFile(SAMPLE_CSV);
    const { result } = renderHook(
      () => ({ importFile: useFileImport(), state: useAppState() }),
      { wrapper: Wrapper },
    );
    await act(async () => {
      await result.current.importFile(zipFile);
    });
    expect(result.current.state.isDataLoaded).toBe(true);
    expect(result.current.state.items.length).toBeGreaterThan(0);
  });
});

describe("useFileImport — error handling", () => {
  it("dispatches IMPORT_ERROR for an unsupported file extension", async () => {
    const bogus = new File(["hello"], "thing.txt", { type: "text/plain" });
    const { result } = renderHook(
      () => ({ importFile: useFileImport(), state: useAppState() }),
      { wrapper: Wrapper },
    );
    await act(async () => {
      await result.current.importFile(bogus);
    });
    expect(result.current.state.isImporting).toBe(false);
    expect(result.current.state.importError).toMatch(/zip|csv/i);
    expect(result.current.state.isDataLoaded).toBe(false);
  });

  it("dispatches IMPORT_ERROR for a malformed ZIP", async () => {
    const bogus = new File(["not really a zip"], "export.zip", {
      type: "application/zip",
    });
    const { result } = renderHook(
      () => ({ importFile: useFileImport(), state: useAppState() }),
      { wrapper: Wrapper },
    );
    await act(async () => {
      await result.current.importFile(bogus);
    });
    expect(result.current.state.isImporting).toBe(false);
    expect(result.current.state.importError).toBeTruthy();
    expect(result.current.state.isDataLoaded).toBe(false);
  });
});

describe("useFileImport — persistence", () => {
  it("persists imported data to IndexedDB so it survives reload", async () => {
    const { result } = renderHook(
      () => ({ importFile: useFileImport(), state: useAppState() }),
      { wrapper: Wrapper },
    );
    await act(async () => {
      await result.current.importFile(makeCsvFile(SAMPLE_CSV));
    });
    const { loadData } = await import("../services/indexedDBService");
    const persisted = await loadData();
    expect(persisted).not.toBeNull();
    expect(persisted?.items.length).toBeGreaterThan(0);
  });
});
