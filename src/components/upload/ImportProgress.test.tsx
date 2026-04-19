import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ImportProgress } from "./ImportProgress";

describe("ImportProgress", () => {
  it("shows a progress bar with the given percent", () => {
    render(<ImportProgress progress={35} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "35");
  });

  it("shows 0 at the start", () => {
    render(<ImportProgress progress={0} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "0");
  });

  it("shows an error message when error prop is provided", () => {
    render(<ImportProgress progress={0} error="ZIP kaputt" />);
    expect(screen.getByRole("alert")).toHaveTextContent("ZIP kaputt");
  });

  it("clamps progress values to 0..100", () => {
    render(<ImportProgress progress={150} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });
});
