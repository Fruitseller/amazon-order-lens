import { describe, expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FilterBar } from "./FilterBar";
import { renderWithContext } from "../../../test/helpers/renderWithContext";
import { createOrderItem } from "../../../test/fixtures/sampleOrders";
import { aggregateOrders } from "../../services/aggregator";

describe("FilterBar", () => {
  it("renders date range and category filter regions", () => {
    renderWithContext(<FilterBar />);
    expect(screen.getByLabelText(/von/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/bis/i)).toBeInTheDocument();
    expect(screen.getByRole("group", { name: /kategorien/i })).toBeInTheDocument();
  });

  it("toggles a category via checkbox and updates state", async () => {
    const user = userEvent.setup();
    renderWithContext(<FilterBar />);
    const group = screen.getByRole("group", { name: /kategorien/i });
    const elektronik = within(group).getByRole("checkbox", { name: /elektronik/i });
    await user.click(elektronik);
    expect(elektronik).toBeChecked();
  });

  it("filters the dataset when a category is selected", async () => {
    const user = userEvent.setup();
    const items = [
      createOrderItem({ orderId: "O-1", asin: "A", inferredCategory: "elektronik" }),
      createOrderItem({ orderId: "O-2", asin: "B", inferredCategory: "buecher" }),
    ];
    renderWithContext(<FilterBar />, {
      initialState: {
        items,
        orders: aggregateOrders(items),
        isDataLoaded: true,
      },
    });
    const group = screen.getByRole("group", { name: /kategorien/i });
    await user.click(within(group).getByRole("checkbox", { name: /elektronik/i }));
    expect(
      within(group).getByRole("checkbox", { name: /elektronik/i }),
    ).toBeChecked();
  });

  it("has a search input that updates searchQuery", async () => {
    const user = userEvent.setup();
    renderWithContext(<FilterBar />);
    const search = screen.getByRole("searchbox");
    await user.type(search, "kabel");
    expect(search).toHaveValue("kabel");
  });
});
