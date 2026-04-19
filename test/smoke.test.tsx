import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithContext } from "./helpers/renderWithContext";
import {
  createOrderAggregate,
  createOrderItem,
  createReturnRecord,
} from "./fixtures/sampleOrders";

describe("test infrastructure smoke", () => {
  it("factory createOrderItem returns a well-formed OrderItem", () => {
    const item = createOrderItem({ productName: "Test Äöü ß" });
    expect(item.productName).toBe("Test Äöü ß");
    expect(item.orderDate).toBeInstanceOf(Date);
    expect(item.totalOwed).toBeTypeOf("number");
    expect(item.inferredCategory).toBe("elektronik");
  });

  it("factory createOrderAggregate sums items correctly", () => {
    const items = [
      createOrderItem({ totalOwed: 10, quantity: 1 }),
      createOrderItem({ totalOwed: 20, quantity: 2 }),
    ];
    const agg = createOrderAggregate({ items });
    expect(agg.totalOwed).toBe(30);
    expect(agg.itemCount).toBe(3);
    expect(agg.isPrime).toBe(true);
  });

  it("factory createReturnRecord returns a valid record", () => {
    const ret = createReturnRecord();
    expect(ret.orderId).toBe("306-1234567-1234567");
    expect(ret.returnDate).toBeInstanceOf(Date);
  });

  it("renderWithContext + jsdom + jest-dom matchers work", () => {
    renderWithContext(<button type="button">Click me</button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });
});
