import {
  ApiError,
  errorResult,
  successResult,
  type DataResult,
} from "@/lib/errors/api-error";
import { logger } from "@/lib/logger";
import type {
  CompanyResolverResult,
  FmpSearchResult,
  ResolvedCompany,
  ResolverConfidence,
} from "@/lib/types/data-layer";
import { fmpClient } from "@/lib/tools/fmp-client";

const SOURCE = "company-resolver";

const KNOWN_ALIASES: Record<string, string> = {
  apple: "AAPL",
  "apple inc": "AAPL",
  microsoft: "MSFT",
  nvidia: "NVDA",
  tesla: "TSLA",
  infosys: "INFY",
  "reliance industries": "RELIANCE.NS",
  "reliance industries limited": "RELIANCE.NS",
  reliance: "RELIANCE.NS",
};

function normalizeInput(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function looksLikeTicker(value: string): boolean {
  return /^[A-Z0-9.-]{1,12}$/.test(value.trim().toUpperCase());
}

function scoreCandidate(
  input: string,
  candidate: FmpSearchResult,
  preferredSymbol?: string,
): number {
  const normalizedInput = normalizeInput(input);
  const normalizedName = normalizeInput(candidate.name);
  let score = 0;

  if (preferredSymbol && candidate.symbol.toUpperCase() === preferredSymbol) {
    score += 100;
  }

  if (candidate.symbol.toUpperCase() === input.trim().toUpperCase()) {
    score += 90;
  }

  if (normalizedName === normalizedInput) {
    score += 80;
  }

  if (normalizedName.startsWith(normalizedInput)) {
    score += 40;
  }

  if (normalizedName.includes(normalizedInput)) {
    score += 20;
  }

  if (candidate.exchangeShortName === "NASDAQ" || candidate.exchangeShortName === "NYSE") {
    score += 5;
  }

  if (candidate.exchangeShortName === "NSE" || candidate.symbol.endsWith(".NS")) {
    if (normalizedInput.includes("reliance") || normalizedInput.includes("infosys")) {
      score += 10;
    }
  }

  return score;
}

function toConfidence(
  topScore: number,
  secondScore: number,
  candidateCount: number,
): ResolverConfidence {
  if (candidateCount === 1 || topScore - secondScore >= 40) {
    return "HIGH";
  }

  if (topScore - secondScore >= 15) {
    return "MEDIUM";
  }

  return "LOW";
}

function buildResolvedCompany(
  input: string,
  candidate: FmpSearchResult,
  candidates: FmpSearchResult[],
  confidence: ResolverConfidence,
  note?: string,
): ResolvedCompany {
  return {
    input,
    symbol: candidate.symbol,
    name: candidate.name,
    exchange: candidate.stockExchange,
    exchangeShortName: candidate.exchangeShortName,
    currency: candidate.currency,
    confidence,
    candidates,
    note,
  };
}

export class CompanyResolver {
  async resolveCompanyName(companyName: string): Promise<CompanyResolverResult> {
    const input = companyName.trim();

    if (!input) {
      return {
        resolved: null,
        error: new ApiError({
          code: "INVALID_INPUT",
          message: "Company name cannot be empty",
          source: SOURCE,
          retryable: false,
        }),
      };
    }

    logger.info(SOURCE, "Resolving company", { input });

    if (looksLikeTicker(input)) {
      const symbol = input.toUpperCase();
      const profileResult = await fmpClient.getCompanyProfile(symbol);

      if (profileResult.success) {
        const profile = profileResult.data;
        return {
          resolved: {
            input,
            symbol: profile.symbol,
            name: profile.companyName,
            exchange: profile.exchange,
            exchangeShortName: profile.exchangeShortName,
            currency: profile.currency,
            confidence: "HIGH",
            candidates: [
              {
                symbol: profile.symbol,
                name: profile.companyName,
                currency: profile.currency,
                stockExchange: profile.exchange,
                exchangeShortName: profile.exchangeShortName,
              },
            ],
            note: "Resolved directly from ticker symbol",
          },
          error: null,
        };
      }
    }

    const aliasSymbol = KNOWN_ALIASES[normalizeInput(input)];
    const searchResult = await fmpClient.searchCompanies(input, 8);

    if (!searchResult.success) {
      logger.warn(SOURCE, "Company search failed", searchResult.error.toJSON());

      if (aliasSymbol) {
        const aliasProfile = await fmpClient.getCompanyProfile(aliasSymbol);

        if (aliasProfile.success) {
          return {
            resolved: buildResolvedCompany(
              input,
              {
                symbol: aliasProfile.data.symbol,
                name: aliasProfile.data.companyName,
                currency: aliasProfile.data.currency,
                stockExchange: aliasProfile.data.exchange,
                exchangeShortName: aliasProfile.data.exchangeShortName,
              },
              [],
              "MEDIUM",
              "Resolved using known alias because search returned no results",
            ),
            error: null,
          };
        }
      }

      return {
        resolved: null,
        error: searchResult.error,
      };
    }

    const candidates = searchResult.data;

    if (candidates.length === 0) {
      if (aliasSymbol) {
        const aliasProfile = await fmpClient.getCompanyProfile(aliasSymbol);

        if (aliasProfile.success) {
          return {
            resolved: buildResolvedCompany(
              input,
              {
                symbol: aliasProfile.data.symbol,
                name: aliasProfile.data.companyName,
                currency: aliasProfile.data.currency,
                stockExchange: aliasProfile.data.exchange,
                exchangeShortName: aliasProfile.data.exchangeShortName,
              },
              [],
              "MEDIUM",
              "Resolved using known alias because search returned no matches",
            ),
            error: null,
          };
        }
      }

      return {
        resolved: null,
        error: new ApiError({
          code: "NOT_FOUND",
          message: `No company match found for "${input}"`,
          source: SOURCE,
          retryable: false,
        }),
      };
    }

    const ranked = [...candidates]
      .map((candidate) => ({
        candidate,
        score: scoreCandidate(input, candidate, aliasSymbol),
      }))
      .sort((a, b) => b.score - a.score);

    const top = ranked[0];
    const second = ranked[1];
    const confidence = toConfidence(
      top.score,
      second?.score ?? 0,
      ranked.length,
    );

    if (confidence === "LOW") {
      return {
        resolved: null,
        error: new ApiError({
          code: "AMBIGUOUS_MATCH",
          message: `Company name "${input}" is ambiguous`,
          source: SOURCE,
          retryable: false,
          metadata: {
            candidates: ranked.slice(0, 5).map(({ candidate, score }) => ({
              symbol: candidate.symbol,
              name: candidate.name,
              exchange: candidate.exchangeShortName,
              score,
            })),
          },
        }),
      };
    }

    const note =
      aliasSymbol && top.candidate.symbol.toUpperCase() === aliasSymbol
        ? "Matched using known alias and search ranking"
        : confidence === "MEDIUM"
          ? "Multiple similar matches found; best match selected with medium confidence"
          : undefined;

    logger.info(SOURCE, "Company resolved", {
      input,
      symbol: top.candidate.symbol,
      confidence,
    });

    return {
      resolved: buildResolvedCompany(
        input,
        top.candidate,
        candidates,
        confidence,
        note,
      ),
      error: null,
    };
  }

  async resolveCompanyNameOrThrow(companyName: string): Promise<ResolvedCompany> {
    const result = await this.resolveCompanyName(companyName);

    if (result.error) {
      throw result.error;
    }

    if (!result.resolved) {
      throw new ApiError({
        code: "NOT_FOUND",
        message: `Unable to resolve company "${companyName}"`,
        source: SOURCE,
        retryable: false,
      });
    }

    return result.resolved;
  }
}

export const companyResolver = new CompanyResolver();

export async function resolveCompany(
  companyName: string,
): Promise<CompanyResolverResult> {
  return companyResolver.resolveCompanyName(companyName);
}

export async function resolveCompanyStrict(
  companyName: string,
): Promise<DataResult<ResolvedCompany>> {
  const result = await companyResolver.resolveCompanyName(companyName);

  if (result.error) {
    return errorResult(result.error);
  }

  if (!result.resolved) {
    return errorResult(
      new ApiError({
        code: "NOT_FOUND",
        message: `Unable to resolve company "${companyName}"`,
        source: SOURCE,
        retryable: false,
      }),
    );
  }

  return successResult(result.resolved);
}
