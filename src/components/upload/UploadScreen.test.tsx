import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { UploadScreen } from "./UploadScreen";
import { renderWithContext } from "../../../test/helpers/renderWithContext";

describe("UploadScreen", () => {
  it("renders DropZone, ImportGuide, and PrivacyBadge", () => {
    renderWithContext(<UploadScreen />);
    expect(screen.getByTestId("dropzone")).toBeInTheDocument();
    expect(
      screen.getAllByText(/schritt|anleitung|bestellungen anfragen/i).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText(/alle daten bleiben lokal/i)).toBeInTheDocument();
  });

  it("shows progress during an active import", () => {
    renderWithContext(<UploadScreen />, {
      initialState: { isImporting: true, importProgress: 50 },
    });
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
  });

  it("shows an error alert when importError is set", () => {
    renderWithContext(<UploadScreen />, {
      initialState: { importError: "ZIP kaputt" },
    });
    expect(screen.getByRole("alert")).toHaveTextContent("ZIP kaputt");
  });
});
