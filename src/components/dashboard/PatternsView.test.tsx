import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { PatternsView } from "./PatternsView";
import { renderWithContext } from "../../../test/helpers/renderWithContext";
import { createOrderItem } from "../../../test/fixtures/sampleOrders";
import { aggregateOrders } from "../../services/aggregator";

describe("PatternsView", () => {
  it("renders day-of-week, hour, and heatmap sections", () => {
    const items = [
      createOrderItem({
        orderId: "O-1",
        orderDate: new Date("2024-10-21T12:00:00Z"),
      }),
      createOrderItem({
        orderId: "O-2",
        orderDate: new Date("2024-10-22T08:00:00Z"),
      }),
    ];
    renderWithContext(<PatternsView />, {
      initialState: {
        items,
        orders: aggregateOrders(items),
        isDataLoaded: true,
      },
    });
    expect(screen.getByText(/wochentag/i)).toBeInTheDocument();
    expect(screen.getByText(/uhrzeit/i)).toBeInTheDocument();
    expect(screen.getByText(/heatmap|kalender/i)).toBeInTheDocument();
  });

  it("uses German KPI labels", () => {
    const items = [
      createOrderItem({
        orderId: "O-1",
        orderDate: new Date("2024-10-21T12:00:00Z"),
      }),
      createOrderItem({
        orderId: "O-2",
        orderDate: new Date("2024-10-22T08:00:00Z"),
      }),
    ];
    renderWithContext(<PatternsView />, {
      initialState: {
        items,
        orders: aggregateOrders(items),
        isDataLoaded: true,
      },
    });
    expect(screen.getByText("Aktivster Tag")).toBeInTheDocument();
    expect(screen.queryByText("Busiest Day")).not.toBeInTheDocument();
  });
});
