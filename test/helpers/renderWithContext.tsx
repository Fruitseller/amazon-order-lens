import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions, type RenderResult } from "@testing-library/react";
import type { AppState } from "../../src/types/state";
import { AppProvider } from "../../src/context/AppContext";

export interface RenderWithContextOptions extends Omit<RenderOptions, "wrapper"> {
  initialState?: Partial<AppState>;
}

export function renderWithContext(
  ui: ReactElement,
  options: RenderWithContextOptions = {},
): RenderResult {
  const { initialState, ...rest } = options;
  function Wrapper({ children }: { children: ReactNode }) {
    return <AppProvider initialOverride={initialState}>{children}</AppProvider>;
  }
  return render(ui, { wrapper: Wrapper, ...rest });
}
