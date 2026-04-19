# Amazon Order Lens

Frontend-only React/TypeScript app that analyzes your Amazon purchase history from the official GDPR data export. **All processing happens locally in your browser — no data ever leaves your device.**

Target audience: Amazon.de customers (UI is in German, prices in EUR, dates in `DD.MM.YYYY`).

## Features

- **Übersicht** — total spending, order count, average order value, cumulative-spending chart
- **Ausgaben** — monthly/yearly breakdowns, top 20 most expensive items, Prime savings estimate
- **Muster** — day-of-week / hour-of-day distributions, calendar heatmap, fulfillment speed
- **Kategorien** — auto-inferred category breakdown (donut), top items table, repeat purchases
- **Fun Facts** — investment opportunity cost (8 % p.a.), package/CO₂ estimate, first order ever, payment-method mix

## How to get your Amazon data

1. Go to [amazon.de/hz/privacy-central/data-requests](https://www.amazon.de/hz/privacy-central/data-requests/preview.html)
2. Select **"Deine Bestellungen"** from the dropdown
3. Click **"Anfrage absenden"**
4. Wait 6–36 hours for Amazon's email
5. Download the ZIP
6. Drop the ZIP into this app

## Running locally

```bash
npm install
npm run dev         # dev server at http://localhost:5173
npm run build       # production build → dist/
npm run preview     # preview the production build
```

## Testing

```bash
npm test                      # Vitest unit/component tests
npm run test:watch            # watch mode
npm run test:coverage         # coverage report
npm run test:e2e              # Playwright end-to-end tests
```

The project is built with strict TDD — every service, hook, and component has tests next to it.

## Architecture

| Layer | Tech |
| --- | --- |
| Build | Vite + `@vitejs/plugin-react` |
| UI | React 19, CSS Modules, CSS Custom Properties |
| Charts | Recharts + a custom SVG calendar heatmap |
| CSV parsing | PapaParse |
| ZIP extraction | JSZip |
| State | `useReducer` + Context |
| Persistence | native IndexedDB |
| Testing | Vitest + React Testing Library + Playwright |

No UI framework, no state library, no date library — just native `Intl.DateTimeFormat` and the primitives above. See `CLAUDE.md` for the full rationale.

## Privacy

- Everything runs client-side. There is no backend, no analytics, no telemetry.
- Parsed data is persisted only in your browser's IndexedDB.
- "Daten löschen" wipes both app state and IndexedDB for this origin.

## License

0BSD — see [LICENSE](LICENSE).
