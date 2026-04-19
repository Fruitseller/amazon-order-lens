import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CalendarHeatmap } from "./CalendarHeatmap";
import { createOrderItem } from "../../../test/fixtures/sampleOrders";

describe("CalendarHeatmap", () => {
  it("renders one SVG rect per day across the covered year range", () => {
    const items = [
      createOrderItem({ orderId: "O-1", orderDate: new Date("2024-01-15T12:00:00Z") }),
      createOrderItem({ orderId: "O-2", orderDate: new Date("2024-06-10T12:00:00Z") }),
      createOrderItem({ orderId: "O-3", orderDate: new Date("2024-12-24T12:00:00Z") }),
    ];
    const { container } = render(<CalendarHeatmap items={items} year={2024} />);
    // 2024 is a leap year
    const rects = container.querySelectorAll("rect[data-date]");
    expect(rects.length).toBe(366);
  });

  it("renders 365 rects for non-leap year", () => {
    const items = [
      createOrderItem({ orderDate: new Date("2023-06-01T10:00:00Z") }),
    ];
    const { container } = render(<CalendarHeatmap items={items} year={2023} />);
    const rects = container.querySelectorAll("rect[data-date]");
    expect(rects.length).toBe(365);
  });

  it("assigns an accent fill to days with orders", () => {
    const items = [
      createOrderItem({ orderDate: new Date("2024-01-15T10:00:00Z") }),
    ];
    const { container } = render(<CalendarHeatmap items={items} year={2024} />);
    const active = container.querySelector('rect[data-date="2024-01-15"]');
    expect(active?.getAttribute("data-count")).toBe("1");
  });

  it("sets count=0 for empty days", () => {
    const items = [createOrderItem({ orderDate: new Date("2024-01-15T10:00:00Z") })];
    const { container } = render(<CalendarHeatmap items={items} year={2024} />);
    const empty = container.querySelector('rect[data-date="2024-06-01"]');
    expect(empty?.getAttribute("data-count")).toBe("0");
  });

  it("renders an EmptyState when no items are provided and no year is specified", () => {
    render(<CalendarHeatmap items={[]} />);
    expect(screen.getByText(/keine daten/i)).toBeInTheDocument();
  });

  it("each rect carries an aria-label with date and count", () => {
    const items = [createOrderItem({ orderDate: new Date("2024-01-15T10:00:00Z") })];
    const { container } = render(<CalendarHeatmap items={items} year={2024} />);
    const rect = container.querySelector('rect[data-date="2024-01-15"]');
    expect(rect?.getAttribute("aria-label")).toMatch(/2024-01-15/);
    expect(rect?.getAttribute("aria-label")).toMatch(/1 Bestellung/);
  });
});
