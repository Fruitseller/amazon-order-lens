import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { YearlyComparisonChart } from "./YearlyComparisonChart";

describe("YearlyComparisonChart", () => {
  it("renders with yearly data without error", () => {
    const data = new Map([
      [2022, 1000],
      [2023, 1500],
      [2024, 2000],
    ]);
    const { container } = render(<YearlyComparisonChart data={data} />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders EmptyState for empty data", () => {
    render(<YearlyComparisonChart data={new Map()} />);
    expect(screen.getByText(/keine daten/i)).toBeInTheDocument();
  });
});
