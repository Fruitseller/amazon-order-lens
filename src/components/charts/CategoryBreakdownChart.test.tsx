import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CategoryBreakdownChart } from "./CategoryBreakdownChart";

describe("CategoryBreakdownChart", () => {
  it("renders a pie chart for category totals", () => {
    const data = new Map([
      ["elektronik" as const, 100],
      ["buecher" as const, 50],
      ["kleidung" as const, 30],
    ]);
    const { container } = render(<CategoryBreakdownChart data={data} />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders EmptyState for empty data", () => {
    render(<CategoryBreakdownChart data={new Map()} />);
    expect(screen.getByText(/keine daten/i)).toBeInTheDocument();
  });
});
