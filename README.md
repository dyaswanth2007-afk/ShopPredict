# ShopPredict

ShopPredict is a browser-based sales history and statistical demand analysis application. It helps users record product sales, examine daily demand patterns, estimate future demand from observed history, and calculate a stock target from an empirical probability distribution. It does not use machine learning.

## Project Overview

ShopPredict combines product catalogue information with sales entered by the user or imported from a documented source. Catalogue records do not provide transaction history. When a product has too little actual daily sales history, ShopPredict reports that limitation instead of fabricating a demand estimate.

## Main Features

- Browse an Indian product catalogue and select five unique products at a time.
- Record sales as separate, append-only transactions. Repeated entries for the same product and date remain separate and are summed for daily demand.
- Optionally record a unit selling price; ShopPredict calculates the entry's total amount when a price is provided.
- Review sales history by selected product and date range, including daily quantity totals.
- Import sales files in CSV, XLSX, or XLS format, preview columns, and record source provenance.
- Analyze daily demand with probability mass and cumulative distributions, expected value, variance, and standard deviation.
- Estimate tomorrow's demand from the selected product's complete observed daily history. The estimate is statistical and not guaranteed.
- Recommend stock using the historical demand distribution and selected service level.
- Export analysis and sales data to PDF or CSV.
- Look up optional Government of India wholesale mandi prices, displayed in INR per quintal.

## Technology Stack

- React 18 and TypeScript
- Vite
- Tailwind CSS
- Recharts and Lucide React
- PapaParse and SheetJS (`xlsx`) for data-file processing
- jsPDF for PDF reports
- IndexedDB for imported datasets, sales entries, and history; LocalStorage for browser preferences and product settings
- Vitest for unit tests

## Installation Instructions

Install Node.js and npm, then run:

```bash
npm install
```

## How to Run

Start the Vite development server:

```bash
npm run dev
```

To allow other devices on your local network to reach the development server, use:

```bash
npm run dev -- --host 0.0.0.0
```

Run the production build and unit tests with:

```bash
npm run build
npm test
```

Regenerate the filtered offline product catalogue from its included CSV snapshot with:

```bash
npm run data:india
```

## Environment Variables

No environment variables are required to run the development app. For the optional mandi lookup, enter a data.gov.in API key and the dataset resource ID in the Dashboard. The key is sent for that request and is not saved by the app. Production hosting needs server-side equivalents of the Vite development proxy endpoints for Open Food Facts and data.gov.in.

## Data Sources

- **Open Food Facts:** live product identity records are requested through a Vite server proxy. The app filters for India-tagged products and classifies them as `PUBLIC_DATASET`. Product catalogue information is not sales history. The database is provided under ODbL 1.0; check image rights separately. [API documentation](https://openfoodfacts.github.io/openfoodfacts-server/api/) · [Terms](https://world.openfoodfacts.org/terms-of-use).
- **PackSense India snapshot:** the included `data/india/packsense-india.csv` snapshot is dated 2026-11-03 and is used as an offline fallback. PackSense is derived from Open Food Facts, so it is not an independent source. Its dataset card states ODbL 1.0. Attribution is included in [data/india/NOTICE.txt](data/india/NOTICE.txt). [Dataset card](https://huggingface.co/datasets/PackSense/packsense-india).
- **Government mandi prices:** the Dashboard can request the [Variety-wise Daily Market Prices](https://www.data.gov.in/resource/variety-wise-daily-market-prices-data-commodity) resource through data.gov.in. These are wholesale market prices, not retail prices or sales quantities, and are shown as INR per quintal. API credentials and a resource ID are required. See the [Government Open Data License – India](https://data.gov.in/government-open-data-license-india).
- **Sales history:** the app does not include a verified Indian product-level transaction dataset. Users can enter sales manually or import their own data with provenance. A small dissertation sample is labelled simulated and is not represented as real sales.

## Screenshots

Screenshots can be added here later. No screenshots are included in this repository yet.

## Author

GitHub: [dyaswanth2007-afk](https://github.com/dyaswanth2007-afk)
