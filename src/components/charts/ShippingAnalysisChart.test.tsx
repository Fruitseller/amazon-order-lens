import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ShippingAnalysisChart } from "./ShippingAnalysisChart";
import { createOrderItem } from "../../../test/fixtures/sampleOrders";

describe("ShippingAnalysisChart", () => {
  it("renders a histogram of fulfillment days", () => {
    const items = [
      createOrderItem({ fulfillmentDays: 1 }),
      createOrderItem({ fulfillmentDays: 2 }),
      createOrderItem({ fulfillmentDays: 2 }),
      createOrderItem({ fulfillmentDays: 3 }),
    ];
    const { container } = render(<ShippingAnalysisChart items={items} />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders EmptyState when no items have fulfillmentDays", () => {
    render(<ShippingAnalysisChart items={[createOrderItem({ fulfillmentDays: null })]} />);
    expect(screen.getByText(/keine daten/i)).toBeInTheDocument();
  });

  it("renders EmptyState for empty items", () => {
    render(<ShippingAnalysisChart items={[]} />);
    expect(screen.getByText(/keine daten/i)).toBeInTheDocument();
  });
});
