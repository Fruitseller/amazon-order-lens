import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PrivacyBadge } from "./PrivacyBadge";

describe("PrivacyBadge", () => {
  it("renders the text 'Alle Daten bleiben lokal'", () => {
    render(<PrivacyBadge />);
    expect(screen.getByText(/alle daten bleiben lokal/i)).toBeInTheDocument();
  });
});
