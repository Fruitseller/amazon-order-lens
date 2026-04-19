import { describe, expect, it } from "vitest";
import { inferCategory } from "./categoryInference";

describe("inferCategory — 12 categories with DE + EN keywords", () => {
  it("classifies computer products", () => {
    expect(inferCategory("Laptop 14 Zoll mit 16GB RAM")).toBe("computer");
    expect(inferCategory("Mechanical Keyboard RGB")).toBe("computer");
    expect(inferCategory("Monitor 27 Zoll 4K")).toBe("computer");
    expect(inferCategory("Wireless mouse logitech")).toBe("computer");
  });

  it("classifies elektronik products", () => {
    expect(inferCategory("USB-C Kabel 2m geflochten")).toBe("elektronik");
    expect(inferCategory("Bluetooth Kopfhörer Noise Cancelling")).toBe("elektronik");
    expect(inferCategory("HDMI Kabel 4K 3m")).toBe("elektronik");
    expect(inferCategory("Powerbank 20000mAh USB-C")).toBe("elektronik");
  });

  it("classifies haushalt products", () => {
    expect(inferCategory("Spülmittel 1L Zitrone")).toBe("haushalt");
    expect(inferCategory("Glühbirne E27 LED 10W")).toBe("haushalt");
    expect(inferCategory("Light bulb replacement pack")).toBe("haushalt");
  });

  it("classifies kueche products", () => {
    expect(inferCategory("Pfanne beschichtet 28cm")).toBe("kueche");
    expect(inferCategory("Chef knife kitchen stainless")).toBe("kueche");
    expect(inferCategory("Backform Silikon Kuchen")).toBe("kueche");
  });

  it("classifies beauty products", () => {
    expect(inferCategory("Shampoo Anti-Schuppen 500ml")).toBe("beauty");
    expect(inferCategory("Body lotion moisturizing 400ml")).toBe("beauty");
    expect(inferCategory("Zahnbürste elektrisch")).toBe("beauty");
  });

  it("classifies kleidung products", () => {
    expect(inferCategory("T-Shirt Herren Baumwolle schwarz L")).toBe("kleidung");
    expect(inferCategory("Winter jacket waterproof men")).toBe("kleidung");
    expect(inferCategory("Socken Wolle Winter")).toBe("kleidung");
  });

  it("classifies buecher products", () => {
    expect(inferCategory("Taschenbuch Roman bestseller 2023")).toBe("buecher");
    expect(inferCategory("Paperback novel fiction 2023")).toBe("buecher");
    expect(inferCategory("Kochbuch: Französische Küche für Anfänger")).toBe("buecher");
  });

  it("classifies spielzeug products", () => {
    expect(inferCategory("Lego Star Wars Mini Kit")).toBe("spielzeug");
    expect(inferCategory("Puzzle 1000 Teile Landschaft")).toBe("spielzeug");
    expect(inferCategory("Playmobil Schloss")).toBe("spielzeug");
  });

  it("classifies garten products", () => {
    expect(inferCategory("Gartenhandschuhe Größe M")).toBe("garten");
    expect(inferCategory("Blumentopf keramik 20cm")).toBe("garten");
    expect(inferCategory("Garden hose 20m retractable")).toBe("garten");
  });

  it("classifies buero products", () => {
    expect(inferCategory("Ordner A4 schwarz 10er Pack")).toBe("buero");
    expect(inferCategory("Druckerpatrone HP 903XL")).toBe("buero");
    expect(inferCategory("Printer paper A4 ream")).toBe("buero");
  });

  it("classifies lebensmittel products", () => {
    expect(inferCategory("Bio Espresso Kaffeebohnen 1kg")).toBe("lebensmittel");
    expect(inferCategory("Earl grey tea bags 100 count")).toBe("lebensmittel");
    expect(inferCategory("Protein Riegel Schokolade")).toBe("lebensmittel");
  });

  it("falls back to sonstiges for unknown products", () => {
    expect(inferCategory("Random Unknown Item XYZ123")).toBe("sonstiges");
    expect(inferCategory("")).toBe("sonstiges");
  });

  it("is case-insensitive", () => {
    expect(inferCategory("LAPTOP CASE")).toBe("computer");
    expect(inferCategory("laptop case")).toBe("computer");
    expect(inferCategory("LaPtOp CaSe")).toBe("computer");
  });

  it("respects priority: Laptop Tasche → computer (not kleidung)", () => {
    expect(inferCategory("Laptop Tasche 15 Zoll")).toBe("computer");
  });

  it("respects priority: Kochbuch → buecher (not kueche)", () => {
    expect(inferCategory("Kochbuch französische Küche")).toBe("buecher");
  });

  it("respects priority: Gartenhandschuhe → garten (not kleidung)", () => {
    expect(inferCategory("Gartenhandschuhe Größe M")).toBe("garten");
  });
});
