import { NextResponse } from 'next/server';
import { MOCK_REPORT } from '@/lib/services/mockData';
// import { runResearchGraph } from '@/lib/langgraph/workflow';

export async function POST(req: Request) {
  try {
    const { ticker } = await req.json();

    if (!ticker) {
      return NextResponse.json({ error: 'Ticker is required' }, { status: 400 });
    }

    // Check if we have the OpenAI API key to run the real LangGraph workflow
    if (process.env.OPENAI_API_KEY) {
      // NOTE: Real LangGraph workflow would be called here.
      // const result = await runResearchGraph(ticker);
      // return NextResponse.json(result);
    }

    // Fallback: Simulate network delay and return mock data
    await new Promise(resolve => setTimeout(resolve, 8000));
    
    // Customize the mock data slightly with the requested ticker
    const customizedMock = {
      ...MOCK_REPORT,
      companyOverview: {
        ...MOCK_REPORT.companyOverview,
        industry: "Technology", // generic fallback
      }
    };

    return NextResponse.json(customizedMock);

  } catch (error: any) {
    console.error("Research API Error:", error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
