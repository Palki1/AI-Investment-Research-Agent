# AI Investment Research Agent

A modern, production-ready autonomous Equity Research Agent built with Node.js and a React-based UI that compiles institutional-grade investment reports using verified financial metrics, news feeds, sentiment analysis, and structured AI narrations.

---

## Key Features

- **Verified Data Guarantee**: Financial statements, profile information, and competitor data are pulled in real-time from the Financial Modeling Prep (FMP) API. The AI engine never generates numbers, eliminating hallucination.
- **Dynamic Chart Suite**: 9 interactive, responsive charts built with **Recharts** rendering Revenue Trend, Net Income, Cash Flow, Debt/Equity stack, Margins, and EPS trends.
- **Local Report Management**: Save, delete, search, sort, and bookmark generated reports client-side using browser `localStorage`.
- **Dynamic API Key Overrides**: Custom Settings page allowing users to override default server credentials (OpenAI, FMP, Tavily keys) dynamically in a thread-safe manner using `AsyncLocalStorage`.
- **Three Exporters**: Download compiled reports as pixel-perfect PDF/Print stylesheets, raw Markdown, or plain text files.
- **Accessibility & Theme**: Full compliance with WCAG contrast, aria roles, and native theme toggles for the interface.

---

## Technical Architecture

```
    User Search
         │
         ▼
[Company Resolver]  ───(Symbol matched)───► [Research Collector]
                                                   │
                                                   ▼
                                         [Data Normalizer] (FMP + Tavily facts)
                                                   │
                                                   ▼
                                        [AsyncLocalStorage] (Request-scoped keys)
                                                   │
                                                   ▼
                                         [AI Analysis Engine] (GPT-4o structured JSON)
                                                   │
                                                   ▼
                                         [Report Assembler] ( Narrative + Verified Metrics)
                                                   │
                                                   ▼
                                            [InvestmentReport]
```

### Modular Structure

- `/app`: App Router views for Dashboard (`/`), Saved Reports (`/history`), and Settings (`/settings`).
- `/server.js`: Node.js entry point for serving the application runtime.
- `/components`: Modular UI:
  - `/charts`: Recharts visualizations.
  - `/dashboard`: Hero, Profile, and Recommendation cards.
  - `/report`: Detailed narrative visualizers and tables.
  - `/history`: Local report managers.
  - `/settings`: Custom key inputs and validation.
- `/lib`:
  - `/agent`: LangChain sequencers, data normalizers, and LLM schemas.
  - `/tools`: FMP client fetchers and Tavily search collectors.
  - `/utils`: Chart calculators and export writers.

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation & Launch

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure environment keys:
   ```bash
   cp .env.example .env.local
   # Fill in OPENAI_API_KEY, FMP_API_KEY, and TAVILY_API_KEY
   ```

3. Spin up the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

4. For production mode:
   ```bash
   npm run build
   npm run start
   ```

---

## Verification & Testing

Verify calculation logic, mock profiles, and data pipelines by running:
```bash
npm run verify:report
```

For general data-layer health checks:
```bash
npm run verify:data
npm run verify:apple
```

---

## Deployment Notes

This project is prepared for a Node.js-based runtime and can be deployed to a standard Node.js host or container platform. For platform-specific guidance, refer to the [Vercel Deployment Guide](docs/VERCEL.md).
