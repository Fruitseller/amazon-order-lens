import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { FunFactsView } from "./FunFactsView";
import { renderWithContext } from "../../../test/helpers/renderWithContext";
import { createOrderItem } from "../../../test/fixtures/sampleOrders";
import { aggregateOrders } from "../../services/aggregator";

describe("FunFactsView", () => {
  it("renders investment opportunity cost and other fun facts", () => {
    const items = [
      createOrderItem({
        orderId: "O-1",
        asin: "A",
        totalOwed: 100,
        orderDate: new Date("2020-01-01T10:00:00Z"),
      }),
      createOrderItem({
        orderId: "O-2",
        asin: "B",
        totalOwed: 50,
        orderDate: new Date("2024-06-15T10:00:00Z"),
      }),
    ];
    renderWithContext(<FunFactsView />, {
      initialState: {
        items,
        orders: aggregateOrders(items),
        isDataLoaded: true,
      },
    });
    expect(screen.getByText(/investiert|investment/i)).toBeInTheDocument();
    expect(screen.getByText(/erste bestellung/i)).toBeInTheDocument();
    expect(screen.getByText(/pakete/i)).toBeInTheDocument();
  });
});
