import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { CumulativeSpendingChart } from "./CumulativeSpendingChart";
import { createOrderItem } from "../../../test/fixtures/sampleOrders";

describe("CumulativeSpendingChart", () => {
  it("renders with order items and an SVG area", () => {
    const items = [
      createOrderItem({
        asin: "A",
        totalOwed: 50,
        orderDate: new Date("2024-01-01T10:00:00Z"),
      }),
      createOrderItem({
        asin: "B",
        totalOwed: 100,
        orderDate: new Date("2024-06-01T10:00:00Z"),
      }),
    ];
    const { container } = render(<CumulativeSpendingChart items={items} />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders EmptyState for empty items", () => {
    render(<CumulativeSpendingChart items={[]} />);
    expect(screen.getByText(/keine daten/i)).toBeInTheDocument();
  });
});
