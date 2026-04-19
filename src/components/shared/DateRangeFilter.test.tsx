import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DateRangeFilter } from "./DateRangeFilter";

describe("DateRangeFilter", () => {
  it("renders Von and Bis date inputs", () => {
    render(<DateRangeFilter value={{ from: null, to: null }} onChange={() => {}} />);
    expect(screen.getByLabelText(/von/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bis/i)).toBeInTheDocument();
  });

  it("displays the current value in inputs (YYYY-MM-DD)", () => {
    render(
      <DateRangeFilter
        value={{
          from: new Date("2024-01-15T00:00:00Z"),
          to: new Date("2024-12-31T00:00:00Z"),
        }}
        onChange={() => {}}
      />,
    );
    expect(screen.getByLabelText(/von/i)).toHaveValue("2024-01-15");
    expect(screen.getByLabelText(/bis/i)).toHaveValue("2024-12-31");
  });

  it("calls onChange when 'Von' changes", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<DateRangeFilter value={{ from: null, to: null }} onChange={onChange} />);
    await user.type(screen.getByLabelText(/von/i), "2024-01-15");
    expect(onChange).toHaveBeenCalled();
    const lastCall = onChange.mock.calls[onChange.mock.calls.length - 1]?.[0];
    expect(lastCall?.from).toBeInstanceOf(Date);
  });

  it("Reset button clears both dates", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DateRangeFilter
        value={{
          from: new Date("2024-01-15T00:00:00Z"),
          to: new Date("2024-12-31T00:00:00Z"),
        }}
        onChange={onChange}
      />,
    );
    await user.click(screen.getByRole("button", { name: /zurücksetzen/i }));
    expect(onChange).toHaveBeenCalledWith({ from: null, to: null });
  });
});
