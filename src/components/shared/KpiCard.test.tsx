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

  it("shows an upward trend indicator when trend > 0", () => {
    render(<KpiCard label="Ausgaben" value="100 €" trend={0.12} />);
    expect(screen.getByLabelText(/steigend/i)).toBeInTheDocument();
    expect(screen.getByText(/12,0\s*%/)).toBeInTheDocument();
  });

  it("shows a downward trend indicator when trend < 0", () => {
    render(<KpiCard label="Ausgaben" value="100 €" trend={-0.07} />);
    expect(screen.getByLabelText(/fallend/i)).toBeInTheDocument();
    expect(screen.getByText(/7,0\s*%/)).toBeInTheDocument();
  });

  it("does not render a trend indicator when trend is undefined", () => {
    render(<KpiCard label="Ausgaben" value="100 €" />);
    expect(screen.queryByLabelText(/steigend/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/fallend/i)).not.toBeInTheDocument();
  });

  it("renders a dash placeholder when value is null or undefined", () => {
    render(<KpiCard label="Empty" value={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
