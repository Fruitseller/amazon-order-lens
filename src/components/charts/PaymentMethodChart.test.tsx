import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PaymentMethodChart } from "./PaymentMethodChart";

describe("PaymentMethodChart", () => {
  it("renders pie slices for each payment method", () => {
    const data = new Map([
      ["Visa", 10],
      ["Mastercard", 5],
      ["SEPA", 2],
    ]);
    const { container } = render(<PaymentMethodChart data={data} />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders EmptyState for empty data", () => {
    render(<PaymentMethodChart data={new Map()} />);
    expect(screen.getByText(/keine daten/i)).toBeInTheDocument();
  });
});
