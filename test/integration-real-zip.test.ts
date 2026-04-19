import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { runParserWorkerLogic } from "../src/workers/parserWorkerLogic";

const REAL_ZIP = join(__dirname, "..", "Your Orders.zip");

describe.skipIf(!existsSync(REAL_ZIP))("real-world Amazon export", () => {
  it("extracts, parses, and aggregates the actual uploaded ZIP", async () => {
    const buf = readFileSync(REAL_ZIP);
    const data = new Uint8Array(buf);
    const result = await runParserWorkerLogic({ kind: "zip", data });
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.orders.length).toBeGreaterThan(0);
    // A real export should have more than one order for a multi-year account
    expect(result.orders.length).toBeGreaterThan(5);
    // Sanity: no item flagged as gift when its message is "Not Available"
    const falseGifts = result.items.filter(
      (i) => i.isGift && i.giftMessage === "Not Available",
    );
    expect(falseGifts).toHaveLength(0);
    // Prime detection sanity: items with shippingCharge=0 & Pri Dom/premium-de
    // should aggregate into at least some Prime orders.
    const primeOrders = result.orders.filter((o) => o.isPrime);
    console.log(
      `real zip: ${result.items.length} items, ${result.orders.length} orders, ${primeOrders.length} prime`,
    );
  });
});
