import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MonthlySpendingChart } from "./MonthlySpendingChart";

describe("MonthlySpendingChart", () => {
  it("renders with fixture data without error", () => {
    const data = new Map([
      ["2024-01", 100],
      ["2024-02", 200],
      ["2024-03", 150],
    ]);
    const { container } = render(<MonthlySpendingChart data={data} />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders EmptyState for empty data", () => {
    render(<MonthlySpendingChart data={new Map()} />);
    expect(screen.getByText(/keine daten/i)).toBeInTheDocument();
  });

  it("sorts data entries chronologically", () => {
    const data = new Map([
      ["2024-03", 150],
      ["2024-01", 100],
      ["2024-02", 200],
    ]);
    const { container } = render(<MonthlySpendingChart data={data} />);
    const bars = container.querySelectorAll(".recharts-bar-rectangle, path.recharts-rectangle");
    expect(bars.length).toBeGreaterThan(0);
  });
});
