import { NextResponse } from "next/server";

import { isDataLayerEnvConfigured } from "@/lib/env/data-layer";
import { fmpClient } from "@/lib/tools/fmp-client";

export const runtime = "nodejs";

import { requestKeysStorage } from "@/lib/env/data-layer";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const headerFmpKey = request.headers.get("x-fmp-api-key");
  const queryFmpKey = searchParams.get("fmpApiKey") || "";
  const fmpKey = headerFmpKey || queryFmpKey || undefined;

  return await requestKeysStorage.run({
    FMP_API_KEY: fmpKey,
  }, async () => {
    if (!isDataLayerEnvConfigured()) {
      const mockResults = [
        { symbol: "AAPL", name: "Apple Inc.", currency: "USD", stockExchange: "NASDAQ", exchangeShortName: "NASDAQ" },
        { symbol: "MSFT", name: "Microsoft Corporation", currency: "USD", stockExchange: "NASDAQ", exchangeShortName: "NASDAQ" },
        { symbol: "NVDA", name: "NVIDIA Corporation", currency: "USD", stockExchange: "NASDAQ", exchangeShortName: "NASDAQ" },
        { symbol: "TSLA", name: "Tesla Inc.", currency: "USD", stockExchange: "NASDAQ", exchangeShortName: "NASDAQ" },
        { symbol: "RELIANCE.NS", name: "Reliance Industries Limited", currency: "INR", stockExchange: "NSE", exchangeShortName: "NSE" },
      ];
      const filtered = mockResults.filter(
        (c) =>
          c.name.toLowerCase().includes(query.toLowerCase()) ||
          c.symbol.toLowerCase().includes(query.toLowerCase())
      );
      return NextResponse.json({ results: filtered });
    }

    if (query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    const result = await fmpClient.searchCompanies(query, 8);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error.message,
          code: result.error.code,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ results: result.data });
  });
}
