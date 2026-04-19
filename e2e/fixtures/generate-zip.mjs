import JSZip from "jszip";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SAMPLE_CSV = readFileSync(
  join(__dirname, "..", "..", "test", "fixtures", "sample-orders.csv"),
  "utf-8",
);

const zip = new JSZip();
zip.file("Retail.OrderHistory.1.csv", SAMPLE_CSV);
const buf = await zip.generateAsync({ type: "nodebuffer" });
writeFileSync(join(__dirname, "test-export.zip"), buf);
console.log(
  `Generated ${join(__dirname, "test-export.zip")} (${buf.length} bytes)`,
);
