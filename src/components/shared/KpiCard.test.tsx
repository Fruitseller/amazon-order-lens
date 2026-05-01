import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { KpiCard } from "./KpiCard";

describe("KpiCard", () => {
  it("renders label and value", () => {
    render(<KpiCard label="Gesamtausgaben" value="1.234,56 €" />);
    expect(screen.getByText("Gesamtausgaben")).toBeInTheDocument();
    expect(screen.getByText("1.234,56 €")).toBeInTheDocument();
  });

  it("renders optional description / sub-label", () => {
    render(
      <KpiCard label="Kundentreue" value="5 Jahre" description="seit März 2020" />,
    );
    expect(screen.getByText("seit März 2020")).toBeInTheDocument();
  });

  it("renders a dash placeholder when value is null or undefined", () => {
    render(<KpiCard label="Empty" value={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
