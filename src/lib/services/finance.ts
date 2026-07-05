import yahooFinance from 'yahoo-finance2';

export async function getCompanyData(ticker: string) {
  try {
    const quote = await yahooFinance.quote(ticker);
    const quoteSummary = await yahooFinance.quoteSummary(ticker, {
      modules: ['assetProfile', 'financialData', 'defaultKeyStatistics']
    });

    const profile = quoteSummary.assetProfile || {};
    const financials = quoteSummary.financialData || {};
    const stats = quoteSummary.defaultKeyStatistics || {};

    return {
      overview: {
        industry: profile.industry || 'N/A',
        ceo: profile.companyOfficers?.[0]?.name || 'N/A',
        marketCap: quote.marketCap ? `$${(quote.marketCap / 1e9).toFixed(2)}B` : 'N/A',
        revenue: financials.totalRevenue ? `$${(financials.totalRevenue / 1e9).toFixed(2)}B` : 'N/A',
        employees: profile.fullTimeEmployees?.toString() || 'N/A',
        headquarters: profile.city ? `${profile.city}, ${profile.country}` : 'N/A',
        website: profile.website || 'N/A',
        stockPrice: quote.regularMarketPrice ? `$${quote.regularMarketPrice.toFixed(2)}` : 'N/A',
        peRatio: quote.trailingPE ? quote.trailingPE.toFixed(2) : 'N/A',
        eps: quote.epsTrailingTwelveMonths ? quote.epsTrailingTwelveMonths.toFixed(2) : 'N/A',
        dividendYield: financials.dividendYield ? `${(financials.dividendYield * 100).toFixed(2)}%` : 'N/A',
        beta: stats.beta ? stats.beta.toFixed(2) : 'N/A',
      },
      financialAnalysis: {
        revenueGrowth: financials.revenueGrowth ? `${(financials.revenueGrowth * 100).toFixed(2)}%` : 'N/A',
        profitMargin: financials.profitMargins ? `${(financials.profitMargins * 100).toFixed(2)}%` : 'N/A',
        operatingMargin: financials.operatingMargins ? `${(financials.operatingMargins * 100).toFixed(2)}%` : 'N/A',
        debtToEquity: financials.debtToEquity ? financials.debtToEquity.toFixed(2) : 'N/A',
        currentRatio: financials.currentRatio ? financials.currentRatio.toFixed(2) : 'N/A',
        quickRatio: financials.quickRatio ? financials.quickRatio.toFixed(2) : 'N/A',
        roe: financials.returnOnEquity ? `${(financials.returnOnEquity * 100).toFixed(2)}%` : 'N/A',
        roa: financials.returnOnAssets ? `${(financials.returnOnAssets * 100).toFixed(2)}%` : 'N/A',
        cashFlow: financials.operatingCashflow ? `$${(financials.operatingCashflow / 1e9).toFixed(2)}B` : 'N/A',
        debt: financials.totalDebt ? `$${(financials.totalDebt / 1e9).toFixed(2)}B` : 'N/A',
      }
    };
  } catch (error) {
    console.error(`Error fetching data for ${ticker}:`, error);
    return null;
  }
}

export async function searchTicker(companyName: string): Promise<string | null> {
  try {
    const results = await yahooFinance.search(companyName);
    if (results.quotes && results.quotes.length > 0) {
      // Find the best equity match
      const equity = results.quotes.find(q => q.quoteType === 'EQUITY');
      if (equity) return equity.symbol;
      return results.quotes[0].symbol;
    }
    return null;
  } catch (error) {
    console.error(`Error searching ticker for ${companyName}:`, error);
    return null;
  }
}
