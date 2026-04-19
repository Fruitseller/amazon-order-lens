import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./EmptyState";

describe("EmptyState", () => {
  it("renders the provided message", () => {
    render(<EmptyState message="Keine Bestellungen vorhanden." />);
    expect(screen.getByText("Keine Bestellungen vorhanden.")).toBeInTheDocument();
  });

  it("renders a default title when title prop is provided", () => {
    render(<EmptyState title="Leer" message="…" />);
    expect(screen.getByText("Leer")).toBeInTheDocument();
  });
});
