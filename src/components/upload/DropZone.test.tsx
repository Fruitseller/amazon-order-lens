import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DropZone } from "./DropZone";

function dataTransferFor(files: File[]): DataTransfer {
  return {
    dropEffect: "copy",
    effectAllowed: "all",
    files,
    items: [] as unknown as DataTransferItemList,
    types: ["Files"],
    clearData: () => undefined,
    getData: () => "",
    setData: () => undefined,
    setDragImage: () => undefined,
  } as unknown as DataTransfer;
}

describe("DropZone", () => {
  it("renders upload instructions", () => {
    render(<DropZone onFile={vi.fn()} />);
    expect(
      screen.getByText(/zip-datei hier ablegen|ziehe deine zip/i),
    ).toBeInTheDocument();
  });

  it("calls onFile when a valid zip file is dropped", () => {
    const onFile = vi.fn();
    render(<DropZone onFile={onFile} />);
    const zone = screen.getByTestId("dropzone");
    const file = new File(["x"], "export.zip", { type: "application/zip" });
    fireEvent.drop(zone, { dataTransfer: dataTransferFor([file]) });
    expect(onFile).toHaveBeenCalledWith(file);
  });

  it("calls onFile when a valid csv file is dropped", () => {
    const onFile = vi.fn();
    render(<DropZone onFile={onFile} />);
    const zone = screen.getByTestId("dropzone");
    const file = new File(["x"], "orders.csv", { type: "text/csv" });
    fireEvent.drop(zone, { dataTransfer: dataTransferFor([file]) });
    expect(onFile).toHaveBeenCalledWith(file);
  });

  it("shows an error when a non-zip/csv file is dropped", () => {
    const onFile = vi.fn();
    render(<DropZone onFile={onFile} />);
    const zone = screen.getByTestId("dropzone");
    const file = new File(["x"], "photo.png", { type: "image/png" });
    fireEvent.drop(zone, { dataTransfer: dataTransferFor([file]) });
    expect(onFile).not.toHaveBeenCalled();
    expect(screen.getByText(/nur zip.*oder csv|falsches format/i)).toBeInTheDocument();
  });

  it("applies active styling while dragging over", () => {
    render(<DropZone onFile={vi.fn()} />);
    const zone = screen.getByTestId("dropzone");
    fireEvent.dragEnter(zone);
    expect(zone).toHaveAttribute("data-drag-active", "true");
    fireEvent.dragLeave(zone);
    expect(zone).toHaveAttribute("data-drag-active", "false");
  });

  it("opens a file picker when clicked", async () => {
    const user = userEvent.setup();
    const onFile = vi.fn();
    render(<DropZone onFile={onFile} />);
    const zone = screen.getByTestId("dropzone");
    const input = zone.querySelector("input[type=file]") as HTMLInputElement;
    const clickSpy = vi.spyOn(input, "click");
    await user.click(zone);
    expect(clickSpy).toHaveBeenCalled();
  });
});
