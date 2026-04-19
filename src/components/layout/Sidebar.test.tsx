import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sidebar } from "./Sidebar";
import { renderWithContext } from "../../../test/helpers/renderWithContext";
import { useAppState } from "../../context/AppContext";

function Probe() {
  const s = useAppState();
  return <div data-testid="active">{s.activeView}</div>;
}

describe("Sidebar", () => {
  it("renders all five navigation items", () => {
    renderWithContext(<Sidebar />);
    expect(screen.getByRole("link", { name: /übersicht/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ausgaben/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /muster/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /kategorien/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /fun\s*facts/i })).toBeInTheDocument();
  });

  it("clicking a nav item updates activeView via dispatch", async () => {
    const user = userEvent.setup();
    renderWithContext(
      <>
        <Sidebar />
        <Probe />
      </>,
    );
    await user.click(screen.getByRole("link", { name: /ausgaben/i }));
    expect(screen.getByTestId("active").textContent).toBe("spending");
  });

  it("marks the currently active view with aria-current", () => {
    renderWithContext(<Sidebar />, { initialState: { activeView: "patterns" } });
    const active = screen.getByRole("link", { name: /muster/i });
    expect(active).toHaveAttribute("aria-current", "page");
  });
});
