import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DataTable, type DataTableColumn } from "./DataTable";

interface Row {
  name: string;
  qty: number;
  price: number;
}

const rows: Row[] = [
  { name: "Apple", qty: 3, price: 1.5 },
  { name: "Banana", qty: 1, price: 0.8 },
  { name: "Cherry", qty: 5, price: 4.99 },
];

const columns: DataTableColumn<Row>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "qty", label: "Anzahl", sortable: true, align: "right" },
  { key: "price", label: "Preis", sortable: true, align: "right" },
];

function getBodyRows() {
  const tbody = document.querySelector("tbody");
  if (!tbody) throw new Error("no tbody");
  return within(tbody).getAllByRole("row");
}

describe("DataTable", () => {
  it("renders headers and rows", () => {
    render(<DataTable columns={columns} data={rows} />);
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
    expect(screen.getByText("Cherry")).toBeInTheDocument();
  });

  it("uses a custom render function when provided", () => {
    const customCols: DataTableColumn<Row>[] = [
      {
        key: "name",
        label: "Name",
        render: (row) => <strong>{row.name.toUpperCase()}</strong>,
      },
    ];
    render(<DataTable columns={customCols} data={rows.slice(0, 1)} />);
    expect(screen.getByText("APPLE")).toBeInTheDocument();
  });

  it("sorts by a column when its header is clicked, toggling asc → desc", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} data={rows} />);
    const qtyHeader = screen.getByRole("columnheader", { name: /anzahl/i });
    await user.click(qtyHeader);
    let cells = getBodyRows().map((r) => within(r).getAllByRole("cell")[1]?.textContent);
    expect(cells).toEqual(["1", "3", "5"]);
    await user.click(qtyHeader);
    cells = getBodyRows().map((r) => within(r).getAllByRole("cell")[1]?.textContent);
    expect(cells).toEqual(["5", "3", "1"]);
  });

  it("does not sort when header is not sortable", async () => {
    const user = userEvent.setup();
    const nonSortable: DataTableColumn<Row>[] = [
      { key: "name", label: "Name", sortable: false },
      { key: "qty", label: "Anzahl", sortable: false },
    ];
    render(<DataTable columns={nonSortable} data={rows} />);
    const header = screen.getByRole("columnheader", { name: "Anzahl" });
    await user.click(header);
    const first = getBodyRows()[0];
    expect(first).toBeDefined();
    if (!first) return;
    expect(within(first).getByText("Apple")).toBeInTheDocument();
  });

  it("renders the EmptyState when data is empty", () => {
    render(<DataTable columns={columns} data={[]} emptyMessage="Keine Daten" />);
    expect(screen.getByText("Keine Daten")).toBeInTheDocument();
  });

  it("respects an initialSort prop", () => {
    render(
      <DataTable
        columns={columns}
        data={rows}
        initialSort={{ key: "price", direction: "desc" }}
      />,
    );
    const priceCells = getBodyRows().map(
      (r) => within(r).getAllByRole("cell")[2]?.textContent,
    );
    expect(priceCells).toEqual(["4.99", "1.5", "0.8"]);
  });
});
