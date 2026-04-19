import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Header } from "./Header";
import { renderWithContext } from "../../../test/helpers/renderWithContext";
import { useAppState } from "../../context/AppContext";
import {
  createOrderItem,
} from "../../../test/fixtures/sampleOrders";
import { aggregateOrders } from "../../services/aggregator";
import { DB_NAME, saveData } from "../../services/indexedDBService";
import { resetIndexedDB } from "../../../test/helpers/fakeIndexedDB";

function Probe() {
  const s = useAppState();
  return <div data-testid="loaded">{String(s.isDataLoaded)}</div>;
}

beforeEach(async () => {
  await resetIndexedDB(DB_NAME);
  vi.spyOn(window, "confirm").mockReturnValue(true);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Header", () => {
  it("renders title and privacy badge", () => {
    renderWithContext(<Header />);
    expect(screen.getByRole("heading", { name: /amazon order lens/i })).toBeInTheDocument();
    expect(screen.getByText(/alle daten bleiben lokal/i)).toBeInTheDocument();
  });

  it("shows Daten löschen button only when data is loaded", () => {
    const items = [createOrderItem()];
    renderWithContext(<Header />, {
      initialState: { items, orders: aggregateOrders(items), isDataLoaded: true },
    });
    expect(screen.getByRole("button", { name: /daten löschen/i })).toBeInTheDocument();
  });

  it("hides Daten löschen button when no data is loaded", () => {
    renderWithContext(<Header />);
    expect(
      screen.queryByRole("button", { name: /daten löschen/i }),
    ).not.toBeInTheDocument();
  });

  it("clears data and dispatches CLEAR_DATA when Daten löschen is clicked", async () => {
    const items = [createOrderItem()];
    const orders = aggregateOrders(items);
    await saveData(items, orders, []);
    const user = userEvent.setup();
    renderWithContext(
      <>
        <Header />
        <Probe />
      </>,
      { initialState: { items, orders, isDataLoaded: true } },
    );
    expect(screen.getByTestId("loaded").textContent).toBe("true");
    await act(async () => {
      await user.click(screen.getByRole("button", { name: /daten löschen/i }));
    });
    await waitFor(() => {
      expect(screen.getByTestId("loaded").textContent).toBe("false");
    });
  });
});
