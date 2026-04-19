import { describe, expect, it } from "vitest";
import { act, render, renderHook } from "@testing-library/react";
import {
  AppProvider,
  useAppDispatch,
  useAppState,
} from "./AppContext";
import { initialState } from "./appReducer";

describe("AppProvider", () => {
  it("renders children", () => {
    const { getByText } = render(
      <AppProvider>
        <span>child content</span>
      </AppProvider>,
    );
    expect(getByText("child content")).toBeInTheDocument();
  });

  it("useAppState returns the initial state", () => {
    const { result } = renderHook(() => useAppState(), {
      wrapper: ({ children }) => <AppProvider>{children}</AppProvider>,
    });
    expect(result.current).toEqual(initialState);
  });

  it("useAppDispatch returns a function that updates state", () => {
    const { result } = renderHook(
      () => ({ state: useAppState(), dispatch: useAppDispatch() }),
      { wrapper: ({ children }) => <AppProvider>{children}</AppProvider> },
    );
    act(() => {
      result.current.dispatch({ type: "SET_VIEW", view: "spending" });
    });
    expect(result.current.state.activeView).toBe("spending");
  });

  it("accepts initialOverride to seed state for testing", () => {
    const { result } = renderHook(() => useAppState(), {
      wrapper: ({ children }) => (
        <AppProvider initialOverride={{ searchQuery: "kabel" }}>{children}</AppProvider>
      ),
    });
    expect(result.current.searchQuery).toBe("kabel");
  });
});

describe("hooks outside provider", () => {
  it("useAppState throws when called outside AppProvider", () => {
    const originalError = console.error;
    console.error = () => {};
    try {
      expect(() => renderHook(() => useAppState())).toThrow(
        /useAppState must be used within an AppProvider/,
      );
    } finally {
      console.error = originalError;
    }
  });

  it("useAppDispatch throws when called outside AppProvider", () => {
    const originalError = console.error;
    console.error = () => {};
    try {
      expect(() => renderHook(() => useAppDispatch())).toThrow(
        /useAppDispatch must be used within an AppProvider/,
      );
    } finally {
      console.error = originalError;
    }
  });
});
