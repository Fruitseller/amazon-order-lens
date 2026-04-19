import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { OverviewView } from "./OverviewView";
import { renderWithContext } from "../../../test/helpers/renderWithContext";
import { createOrderItem } from "../../../test/fixtures/sampleOrders";
import { aggregateOrders } from "../../services/aggregator";

describe("OverviewView", () => {
  it("renders KPIs with computed values from state", () => {
    const items = [
      createOrderItem({
        orderId: "O-1",
        asin: "A",
        totalOwed: 100,
        quantity: 2,
        orderDate: new Date("2022-01-15T10:00:00Z"),
      }),
      createOrderItem({
        orderId: "O-2",
        asin: "B",
        totalOwed: 250,
        quantity: 1,
        orderDate: new Date("2024-06-15T10:00:00Z"),
      }),
    ];
    renderWithContext(<OverviewView />, {
      initialState: {
        items,
        orders: aggregateOrders(items),
        isDataLoaded: true,
      },
    });
    expect(screen.getByText(/gesamtausgaben/i)).toBeInTheDocument();
    expect(screen.getByText(/350,00\s*€/)).toBeInTheDocument();
    expect(screen.getByText("Bestellungen")).toBeInTheDocument();
    expect(screen.getByText("Artikel")).toBeInTheDocument();
    expect(screen.getByText("Ø Bestellwert")).toBeInTheDocument();
  });

  it("renders an empty state hint when no data is loaded", () => {
    renderWithContext(<OverviewView />, { initialState: {} });
    expect(screen.getAllByText(/—/)[0]).toBeInTheDocument();
  });
});
