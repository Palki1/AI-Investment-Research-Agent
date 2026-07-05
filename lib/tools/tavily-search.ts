import {
  ApiError,
  errorResult,
  successResult,
  type DataResult,
} from "@/lib/errors/api-error";
import { getTavilyApiKey } from "@/lib/env/data-layer";
import { fetchWithRetry } from "@/lib/http/fetch-with-retry";
import { logger } from "@/lib/logger";
import type {
  TavilyNewsBundle,
  TavilySearchResponse,
  TavilySearchResultItem,
  TavilySearchTopic,
} from "@/lib/types/data-layer";

const SOURCE = "tavily-search";
const TAVILY_URL = "https://api.tavily.com/search";

interface TavilyApiResponse {
  query: string;
  answer?: string;
  results?: Array<{
    title: string;
    url: string;
    content: string;
    score: number;
    published_date?: string;
  }>;
  response_time?: number;
}

export interface TavilySearchOptions {
  query: string;
  topic?: TavilySearchTopic;
  maxResults?: number;
  searchDepth?: "basic" | "advanced";
  days?: number;
  includeAnswer?: boolean;
}

function getTopicQuery(
  topic: TavilySearchTopic,
  companyName: string,
  sector?: string,
): string {
  switch (topic) {
    case "company_news":
      return `${companyName} company news earnings guidance latest developments`;
    case "industry_trends":
      return `${sector ?? companyName} industry trends outlook 2025 2026`;
    case "market_developments":
      return `${companyName} stock market developments analyst ratings price action`;
    case "macroeconomic_news":
      return `macroeconomic news interest rates inflation market outlook impact ${sector ?? "equities"}`;
    default:
      return companyName;
  }
}

function mapTavilyResponse(
  query: string,
  payload: TavilyApiResponse,
): TavilySearchResponse {
  return {
    query,
    answer: payload.answer,
    responseTime: payload.response_time,
    results: (payload.results ?? []).map(
      (item): TavilySearchResultItem => ({
        title: item.title,
        url: item.url,
        content: item.content,
        score: item.score,
        publishedDate: item.published_date,
      }),
    ),
  };
}

export class TavilySearchClient {
  async search(options: TavilySearchOptions): Promise<DataResult<TavilySearchResponse>> {
    const query = options.query.trim();

    if (!query) {
      return errorResult(
        new ApiError({
          code: "INVALID_INPUT",
          message: "Search query cannot be empty",
          source: SOURCE,
          retryable: false,
        }),
      );
    }

    let apiKey: string;

    try {
      apiKey = getTavilyApiKey();
    } catch (error) {
      const apiError =
        error instanceof ApiError
          ? error
          : new ApiError({
              code: "MISSING_API_KEY",
              message: "TAVILY_API_KEY is not configured",
              source: SOURCE,
              retryable: false,
            });

      return errorResult(apiError);
    }

    try {
      logger.debug(SOURCE, "Tavily search request", {
        query,
        topic: options.topic,
        maxResults: options.maxResults ?? 5,
      });

      const payload = await fetchWithRetry<TavilyApiResponse>({
        url: TAVILY_URL,
        init: {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            api_key: apiKey,
            query,
            max_results: options.maxResults ?? 5,
            search_depth: options.searchDepth ?? "advanced",
            include_answer: options.includeAnswer ?? true,
            days: options.days ?? 180,
          }),
        },
        source: SOURCE,
      });

      if (!payload.results || payload.results.length === 0) {
        return errorResult(
          new ApiError({
            code: "NOT_FOUND",
            message: `No Tavily results found for query "${query}"`,
            source: SOURCE,
            retryable: false,
            metadata: { query, topic: options.topic },
          }),
        );
      }

      logger.info(SOURCE, "Tavily search completed", {
        query,
        resultCount: payload.results.length,
      });

      return successResult(mapTavilyResponse(query, payload));
    } catch (error) {
      if (error instanceof ApiError) {
        logger.warn(SOURCE, "Tavily search failed", error.toJSON());
        return errorResult(error);
      }

      const wrapped = new ApiError({
        code: "UNKNOWN",
        message: "Tavily search failed unexpectedly",
        source: SOURCE,
        retryable: false,
        cause: error instanceof Error ? error.message : String(error),
      });

      logger.error(SOURCE, wrapped.message, wrapped.toJSON());
      return errorResult(wrapped);
    }
  }

  async searchTopic(
    topic: TavilySearchTopic,
    companyName: string,
    sector?: string,
  ): Promise<DataResult<TavilySearchResponse>> {
    const query = getTopicQuery(topic, companyName, sector);

    return this.search({
      query,
      topic,
      maxResults: 5,
      includeAnswer: true,
    });
  }

  async getCompanyNewsBundle(
    companyName: string,
    sector?: string,
  ): Promise<TavilyNewsBundle> {
    logger.info(SOURCE, "Fetching news bundle", { companyName, sector });

    const topics: TavilySearchTopic[] = [
      "company_news",
      "industry_trends",
      "market_developments",
      "macroeconomic_news",
    ];

    const results = await Promise.all(
      topics.map(async (topic) => ({
        topic,
        result: await this.searchTopic(topic, companyName, sector),
      })),
    );

    const unavailable: string[] = [];
    const errors: ApiError[] = [];

    for (const { topic, result } of results) {
      if (!result.success) {
        unavailable.push(topic);
        errors.push(result.error);
      }
    }

    if (errors.length > 0) {
      logger.warn(SOURCE, "News bundle completed with gaps", {
        companyName,
        unavailable,
      });
    } else {
      logger.info(SOURCE, "News bundle fetched successfully", { companyName });
    }

    const byTopic = Object.fromEntries(results.map(({ topic, result }) => [topic, result]));

    return {
      companyNews: byTopic.company_news?.success ? byTopic.company_news.data : null,
      industryTrends: byTopic.industry_trends?.success
        ? byTopic.industry_trends.data
        : null,
      marketDevelopments: byTopic.market_developments?.success
        ? byTopic.market_developments.data
        : null,
      macroeconomicNews: byTopic.macroeconomic_news?.success
        ? byTopic.macroeconomic_news.data
        : null,
      unavailable,
      errors,
    };
  }
}

export const tavilySearchClient = new TavilySearchClient();

export async function searchCompanyNews(
  companyName: string,
  sector?: string,
): Promise<TavilyNewsBundle> {
  return tavilySearchClient.getCompanyNewsBundle(companyName, sector);
}
