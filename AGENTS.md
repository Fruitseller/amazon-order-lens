# AGENTS.md

Guidance for coding agents working in this repository.

## Project Snapshot

Amazon Order Lens is a frontend-only React/TypeScript app for analyzing Amazon.de GDPR order exports. The product promise is privacy: order data is parsed, analyzed, and persisted locally in the browser; there is no backend, telemetry, or analytics.

Target users are German Amazon.de customers. UI copy is German, currency is EUR, date/time behavior should be Berlin-aware, and imported personal data must not leave the browser.

## Stack And Commands

- Runtime/build: Vite, React 19, TypeScript, CSS Modules, CSS custom properties.
- Data parsing: PapaParse for CSV, JSZip for ZIP exports.
- Charts: Recharts plus a custom SVG calendar heatmap.
- State/persistence: React `useReducer` + Context, native IndexedDB.
- Tests: Vitest + React Testing Library + Playwright.

Use npm, not another package manager. `package-lock.json` is committed.

Common commands:

```bash
npm install
npm run dev          # Vite dev server on http://localhost:5199
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build        # typecheck + production build into dist/
```

The dev server uses `strictPort: true` on port `5199`; Playwright also expects `http://localhost:5199`. GitHub Pages deployment depends on `vite.config.ts` using `base: "/amazon-order-lens/"`.

## Repository Map

- `src/types/` defines the core contracts. Start here before changing data shape.
- `src/services/` contains pure domain logic: CSV parsing, ZIP extraction, category inference, order aggregation, statistics, IndexedDB service.
- `src/workers/parserWorkerLogic.ts` orchestrates ZIP/CSV import into parsed items, aggregates, returns, and progress. `parser.worker.ts` wraps it for worker messaging, but the current import hook calls the logic directly.
- `src/context/` contains `AppState`, actions, reducer, and providers.
- `src/hooks/` connects state, persistence, filtering, import, and derived insights.
- `src/components/` contains UI by feature area: `upload`, `layout`, `filters`, `dashboard`, `charts`, `shared`.
- `src/styles/tokens.css` and `src/styles/global.css` define the dark visual system.
- `test/fixtures/` and `test/helpers/` are shared by unit/component tests.
- `e2e/fixtures/test-export.zip` is the Playwright upload fixture. Regenerate it with `node e2e/fixtures/generate-zip.mjs` if fixture CSV data changes.

## Architecture And Data Flow

Import flow:

1. `UploadScreen` / `DropZone` accepts `.zip` or `.csv`.
2. `useFileImport` converts the file into `ParserWorkerInput`.
3. `runParserWorkerLogic` extracts ZIPs, parses order history, parses optional returns/refunds, aggregates orders, and reports progress.
4. `useFileImport` saves imported data to IndexedDB first, then dispatches `IMPORT_COMPLETE`.
5. `AppShell` switches from upload view to dashboard once `isDataLoaded` is true.

Dashboard flow:

1. `useIndexedDB` loads persisted data on mount and exposes `clear()`.
2. `useFilteredData` applies date, category, and search filters to items, then keeps matching orders by `orderId`.
3. `useInsights` computes all dashboard metrics from filtered order data plus global returns data.
4. Dashboard views render KPI cards, section cards, tables, and charts from `useInsights`.

Navigation uses hash routes only. Add new views by updating `ViewId`, `VIEW_LABELS_DE`, `hashRouter` valid views, `Sidebar` order, `AppShell.viewFor`, and tests.

## Domain Rules To Preserve

- Keep all processing local. Do not add network calls for user data, analytics, telemetry, hosted parsing, or third-party data enrichment.
- Treat Amazon placeholder strings as empty data: `""`, `"Not Available"`, and `"Not Applicable"`.
- Required order row fields are `Order Date` and `Order ID`; invalid rows should be skipped rather than crashing the whole import.
- Support both legacy and current Amazon export schemas:
  - Legacy order history: `Retail.OrderHistory.1.csv`, `.2.csv`, etc.
  - Current order history: `Your Amazon Orders/Order History.csv`.
  - Current renamed columns include `Total Amount`, `Original Quantity`, and `Payment Method Type`.
  - Returns/refunds may come from `Your Returns & Refunds/Refund Details.csv`, `Return Requests.csv`, or legacy `Retail.OrderHistory.Returns.csv`.
- Preserve negative prices and credits. They are valid inputs.
- Date grouping and user-facing formatting should use `Europe/Berlin` semantics. Prefer existing helpers in `src/utils/dateUtils.ts` and `src/utils/formatters.ts`.
- Aggregates are order-level groups keyed by `orderId`; item-level stats should use `OrderItem[]`, order-count stats should use `OrderAggregate[]`.
- `totalOwed` is the amount used for spending totals. Do not silently switch totals to unit price, subtotal, or tax-inclusive recomputations.
- `inferCategory` is keyword-based and priority-ordered. Add tests when adding categories or keywords.
- `PRIME_DAY_DATES` is static through 2025. If updating shopping-event logic for newer exports, extend it deliberately and test exact dates.

## Code Style

- TypeScript is strict. Avoid `any`; ESLint rejects explicit `any`.
- Keep service functions pure where practical. Parser/statistics changes should be testable without React.
- Prefer existing helpers and constants over duplicating formatting, date, category, chart-color, or routing logic.
- Use CSS Modules for component-specific styles and tokens from `src/styles/tokens.css`. Inline styles already exist for simple layout wrappers; avoid broad visual rewrites unless asked.
- UI text should remain German. Code identifiers and comments may stay English or follow local file style.
- Components should stay accessible: use roles/labels that tests and keyboard users can rely on.
- Do not replace the lightweight architecture with a UI framework, state library, date library, backend, or router unless the task explicitly requires it.

## Testing Guidance

Use the smallest useful verification first, then broaden based on risk.

- Parser, ZIP extraction, aggregation, statistics, category inference: add/update tests next to the service in `src/services/*.test.ts`.
- Reducer/context/hooks: use `src/context/*.test.tsx`, `src/hooks/*.test.tsx`, and `test/helpers/renderWithContext.tsx`.
- UI components: use React Testing Library tests next to the component.
- Import and browser workflows: add Playwright tests under `e2e/`.
- IndexedDB tests use `fake-indexeddb` from `test/setup.ts`; reset explicitly with `test/helpers/fakeIndexedDB.ts` when isolation matters.
- Recharts tests rely on mocked layout dimensions in `test/setup.ts`; do not remove those DOM geometry mocks casually.
- Real user export coverage is optional and skipped unless a root-level `Your Orders.zip` exists. Never commit personal export data.

Suggested checks before handing off:

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

Run `npm run test:e2e` when upload, persistence, navigation, filtering, deletion, or browser-only behavior changes.

## Fixtures And Data Safety

- Keep committed fixtures synthetic. Do not commit real Amazon exports, real order IDs tied to a person, addresses, payment details, or tracking numbers.
- If adding CSV fixtures, include German characters and current Amazon column names when relevant.
- If changing `test/fixtures/sample-orders.csv`, consider regenerating `e2e/fixtures/test-export.zip`.
- The `.gitignore` should continue to exclude local build/test outputs and private data files.

## Common Change Recipes

Adding a statistic:

1. Implement the pure calculation in `src/services/statistics.ts`.
2. Add service tests covering empty input, normal input, and edge cases.
3. Expose it from `useInsights` if the UI needs it.
4. Render it in the relevant dashboard view using existing `KpiCard`, `SectionCard`, `DataTable`, or chart patterns.
5. Add a component or E2E test if the behavior is user-visible.

Adding an imported field:

1. Update `src/types/order.ts`.
2. Update parser mapping in `src/services/parser.ts` or `returnsParser.ts`, supporting legacy/current column names with `pick(...)`.
3. Update fixture factories in `test/fixtures/sampleOrders.ts`.
4. Add parser tests for missing, placeholder, and current-format data.
5. Update IndexedDB normalization only if persisted older data needs a default.

Adding a dashboard view:

1. Extend `ViewId` and `VIEW_LABELS_DE`.
2. Update `src/utils/hashRouter.ts`.
3. Add the view component under `src/components/dashboard/`.
4. Wire `Sidebar` and `AppShell.viewFor`.
5. Add tests for routing/navigation and at least one visible view landmark or heading.

## Known Sharp Edges

- `README.md` references a `CLAUDE.md`, but no such file currently exists in this repo.
- License metadata is inconsistent: `README.md` says `0BSD`, `package.json` says `MIT`, and `LICENSE` text is permissive but not labeled. Do not touch this unless the task is about licensing.
- `dist/`, `node_modules/`, `coverage/`, `playwright-report/`, and `test-results/` are generated. Avoid editing or reviewing them as source.
- `useIndexedDB` is called by both `AppShell` and `Header`; be careful when changing its side effects.
- `DataTable` currently uses row index as key. If adding mutable/reorderable table interactions, provide stable keys first.
- The app imports Google Fonts in `index.html`; this is unrelated to order data but still an external request on page load.
