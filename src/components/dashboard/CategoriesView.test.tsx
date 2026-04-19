import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { CategoriesView } from "./CategoriesView";
import { renderWithContext } from "../../../test/helpers/renderWithContext";
import { createOrderItem } from "../../../test/fixtures/sampleOrders";
import { aggregateOrders } from "../../services/aggregator";

describe("CategoriesView", () => {
  it("renders category breakdown and top items", () => {
    const items = [
      createOrderItem({
        orderId: "O-1",
        asin: "A",
        productName: "USB Kabel",
        inferredCategory: "elektronik",
        totalOwed: 50,
      }),
      createOrderItem({
        orderId: "O-2",
        asin: "B",
        productName: "Buch",
        inferredCategory: "buecher",
        totalOwed: 20,
      }),
    ];
    renderWithContext(<CategoriesView />, {
      initialState: {
        items,
        orders: aggregateOrders(items),
        isDataLoaded: true,
      },
    });
    expect(screen.getAllByText(/kategorie/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/top.*artikel|meist(ge)?kauft/i).length).toBeGreaterThan(0);
    expect(screen.getByText("USB Kabel")).toBeInTheDocument();
  });
});
