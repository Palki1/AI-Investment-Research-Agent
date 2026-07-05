# Phase 4 — AI Investment Research Engine

## Overview

Phase 4 connects the Phase 3 data layer to OpenAI GPT-4o via a LangChain-orchestrated pipeline. The engine validates verified data, normalizes facts, generates narrative analysis, and assembles a strongly typed `InvestmentReport`.

**Critical design rule:** Financial metrics are extracted in code from FMP. The LLM never generates numbers.

---

## AI Architecture

```
Company Name
    │
    ▼
collectCompanyResearchData()     ← Phase 3 (FMP + Tavily)
    │
    ▼
validateResearchData()           ← Step 1: Validate
    │
    ▼
normalizeResearchData()          ← Step 2: Normalize facts
    │
    ▼
AiAnalysisService                ← Step 3–4: OpenAI SDK structured output
    │
    ▼
assembleInvestmentReport()       ← Merge verified metrics + narrative
    │
    ▼
investmentReportSchema (Zod)     ← Final validation
    │
    ▼
InvestmentReport JSON
```

### Components

| File | Role |
|---|---|
| `lib/agent/research-agent.ts` | LangChain `RunnableSequence` orchestrator |
| `lib/agent/data-validator.ts` | Step 1 — validate collected data |
| `lib/agent/data-normalizer.ts` | Step 2 — extract verified metrics |
| `lib/agent/ai-analysis-service.ts` | OpenAI SDK + structured output |
| `lib/agent/report-assembler.ts` | Merge LLM narrative + verified metrics |
| `lib/prompts/investment-analysis.ts` | System + user prompts |

---

## Prompt Flow

1. **System prompt** (`INVESTMENT_ANALYSIS_SYSTEM_PROMPT`) — Senior Wall Street analyst persona with strict anti-hallucination rules.
2. **User prompt** — Built from `buildFactualContextBlock()` containing only verified JSON facts.
3. **Structured output** — OpenAI `chat.completions.parse()` with `zodResponseFormat(llmNarrativeReportSchema)`.
4. **Post-processing** — Verified metrics from FMP are attached to financial sections; LLM provides analysis text only.

---

## Data Flow

### Input (from Phase 3)
- FMP: profile, statements, ratios, EV, peers
- Tavily: company news, industry trends, market developments, macro news

### Normalized context (`NormalizedResearchContext`)
- Company identity (ticker, sector, industry)
- `verifiedMetrics` — grouped by section (revenue, profitability, cash flow, debt, liquidity, valuation)
- `newsFacts` — headlines + snippets from Tavily
- `missingData` — explicit list of unavailable sections

### LLM receives
Only the factual JSON block — no raw API responses, no room for metric invention.

### Output (`InvestmentReport`)
19 sections including recommendation, confidence, and investment horizon.

---

## JSON Schema

### Recommendation
```json
{
  "verdict": "INVEST | WATCH | PASS",
  "reasoning": "string",
  "keyDrivers": ["string"]
}
```

### Confidence
```json
{
  "score": 0,
  "explanation": "string",
  "positiveFactors": ["string"],
  "negativeFactors": ["string"]
}
```

### Investment Horizon
```json
{
  "horizon": "Short Term | Medium Term | Long Term",
  "reasoning": "string"
}
```

Full schema: `lib/schemas/report.schema.ts` → `investmentReportSchema`

TypeScript interfaces: `lib/types/investment-report.ts`

---

## How to Test

### 1. Configure API keys

```bash
cp .env.example .env.local
# Set OPENAI_API_KEY, FMP_API_KEY, TAVILY_API_KEY
```

### 2. Generate reports (Apple, Microsoft, Reliance)

```bash
npm run generate:reports
```

Reports saved to `reports/` as JSON files.

### 3. Test via API

```bash
npm run dev

curl -X POST http://localhost:3000/api/research \
  -H "Content-Type: application/json" \
  -d '{"companyName": "Apple"}'
```

---

## Limitations

| Limitation | Impact |
|---|---|
| Free-tier API rate limits | May fail under heavy use; gaps recorded in `missingData` |
| FMP data lag | Financials may not reflect latest quarter |
| News recency | Tavily results depend on search index freshness |
| LLM interpretation | Qualitative analysis may vary between runs |
| Token limits | Very long contexts may truncate (logged as error) |
| Public companies only | Private companies cannot be resolved reliably |

---

## Future Improvements

- Streaming SSE progress to frontend (Phase 5)
- RAG over 10-K / annual report PDFs
- Report caching by ticker + date
- Multi-company comparison mode
- Backtesting recommendations against historical prices
- Human-in-the-loop review for ambiguous ticker resolution
- Cost optimization via `gpt-4o-mini` for draft + GPT-4o for final pass

---

## Environment Variables

| Variable | Required | Default |
|---|---|---|
| `OPENAI_API_KEY` | Yes | — |
| `FMP_API_KEY` | Yes | — |
| `TAVILY_API_KEY` | Yes | — |
| `OPENAI_MODEL` | No | `gpt-4o` |

Set `OPENAI_MODEL=gpt-4.1` if available on your OpenAI account.
