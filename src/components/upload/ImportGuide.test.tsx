import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ImportGuide } from "./ImportGuide";

describe("ImportGuide", () => {
  it("renders all six steps needed to request Amazon data", () => {
    render(<ImportGuide />);
    const steps = screen.getAllByRole("listitem");
    expect(steps.length).toBeGreaterThanOrEqual(6);
  });

  it("links to the Amazon privacy page", () => {
    render(<ImportGuide />);
    const link = screen.getByRole("link", { name: /privacy-central|amazon/i });
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining("amazon.de/hz/privacy-central/data-requests"),
    );
  });
});
