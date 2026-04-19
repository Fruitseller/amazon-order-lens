import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { HourOfDayChart } from "./HourOfDayChart";

describe("HourOfDayChart", () => {
  it("renders when at least one hour has orders", () => {
    const data = new Array<number>(24).fill(0);
    data[10] = 5;
    data[22] = 3;
    const { container } = render(<HourOfDayChart data={data} />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders EmptyState when all counts are zero", () => {
    render(<HourOfDayChart data={new Array(24).fill(0)} />);
    expect(screen.getByText(/keine daten/i)).toBeInTheDocument();
  });
});
