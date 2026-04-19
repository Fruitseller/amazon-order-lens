import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { DayOfWeekChart } from "./DayOfWeekChart";

describe("DayOfWeekChart", () => {
  it("renders when at least one day has orders", () => {
    const { container } = render(
      <DayOfWeekChart data={[5, 3, 2, 4, 6, 8, 10]} />,
    );
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders EmptyState when all counts are zero", () => {
    render(<DayOfWeekChart data={[0, 0, 0, 0, 0, 0, 0]} />);
    expect(screen.getByText(/keine daten/i)).toBeInTheDocument();
  });

  it("renders EmptyState for an array of wrong length", () => {
    render(<DayOfWeekChart data={[]} />);
    expect(screen.getByText(/keine daten/i)).toBeInTheDocument();
  });
});
