import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { AppShell } from "./AppShell";
import { renderWithContext } from "../../../test/helpers/renderWithContext";
import { createOrderItem } from "../../../test/fixtures/sampleOrders";
import { aggregateOrders } from "../../services/aggregator";

describe("AppShell", () => {
  it("renders UploadScreen when no data is loaded", () => {
    renderWithContext(<AppShell />);
    expect(screen.getByTestId("dropzone")).toBeInTheDocument();
  });

  it("renders the Sidebar + active view when data is loaded", () => {
    const items = [
      createOrderItem({ orderId: "O-1", totalOwed: 100 }),
      createOrderItem({ orderId: "O-2", totalOwed: 200 }),
    ];
    renderWithContext(<AppShell />, {
      initialState: {
        items,
        orders: aggregateOrders(items),
        isDataLoaded: true,
        activeView: "overview",
      },
    });
    expect(screen.getByRole("link", { name: /übersicht/i })).toBeInTheDocument();
    expect(screen.getByText(/gesamtausgaben/i)).toBeInTheDocument();
  });

  it("switches view when activeView changes", () => {
    const items = [createOrderItem({ orderId: "O-1" })];
    renderWithContext(<AppShell />, {
      initialState: {
        items,
        orders: aggregateOrders(items),
        isDataLoaded: true,
        activeView: "spending",
      },
    });
    expect(screen.getByText(/monatliche ausgaben/i)).toBeInTheDocument();
  });
});
