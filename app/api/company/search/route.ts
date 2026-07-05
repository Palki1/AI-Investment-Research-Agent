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
      return NextResponse.json(
        {
          error: "FMP_API_KEY is not configured",
          code: "ENV_NOT_CONFIGURED",
        },
        { status: 503 },
      );
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
