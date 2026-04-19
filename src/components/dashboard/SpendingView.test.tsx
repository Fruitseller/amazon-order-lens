import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { SpendingView } from "./SpendingView";
import { renderWithContext } from "../../../test/helpers/renderWithContext";
import { createOrderItem } from "../../../test/fixtures/sampleOrders";
import { aggregateOrders } from "../../services/aggregator";

describe("SpendingView", () => {
  it("renders monthly, yearly, and top items sections", () => {
    const items = [
      createOrderItem({
        orderId: "O-1",
        asin: "A",
        totalOwed: 100,
        orderDate: new Date("2024-01-15T10:00:00Z"),
      }),
      createOrderItem({
        orderId: "O-2",
        asin: "B",
        totalOwed: 300,
        orderDate: new Date("2024-06-15T10:00:00Z"),
      }),
    ];
    renderWithContext(<SpendingView />, {
      initialState: {
        items,
        orders: aggregateOrders(items),
        isDataLoaded: true,
      },
    });
    expect(screen.getByText(/monatliche ausgaben/i)).toBeInTheDocument();
    expect(screen.getByText(/jährlich/i)).toBeInTheDocument();
    expect(screen.getByText(/teuerste käufe|top.*käufe/i)).toBeInTheDocument();
  });
});
