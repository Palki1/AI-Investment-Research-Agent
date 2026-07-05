# Vercel Deployment Guide

Follow this guide to deploy your **AI Investment Research Agent** on Vercel.

## Setup Requirements

Before deploying, ensure you have active API keys for:
1. **OpenAI API Key** (starts with `sk-...`)
2. **Financial Modeling Prep (FMP) API Key** (alphanumeric string)
3. **Tavily Search API Key** (starts with `tvly-...`)

---

## Deployment Steps

### Option 1: Deploying via Vercel CLI (Recommended for Local Devs)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy from project root**:
   ```bash
   vercel
   ```
   Follow the prompts to link the project.

4. **Add Environment Variables**:
   In the Vercel Dashboard, navigate to **Settings > Environment Variables** and add:
   - `OPENAI_API_KEY`: Your OpenAI key
   - `FMP_API_KEY`: Your FMP key
   - `TAVILY_API_KEY`: Your Tavily key
   - `OPENAI_MODEL`: `gpt-4o` (or `gpt-4o-mini`)

5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

---

### Option 2: Deploying via GitHub Integration

1. Push your code to your GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of production ready AI Investment Research Agent"
   git remote add origin https://github.com/Palki1/AI-Investment-Research-Agent.git
   git branch -M main
   git push -u origin main
   ```

2. Go to the **Vercel Dashboard** and click **Add New > Project**.
3. Import your `AI-Investment-Research-Agent` repository.
4. Expand **Environment Variables** and add:
   - `OPENAI_API_KEY`
   - `FMP_API_KEY`
   - `TAVILY_API_KEY`
   - `OPENAI_MODEL` (optional, defaults to `gpt-4o`)
5. Click **Deploy**. Vercel will build and host your application, auto-updating on each push to the `main` branch.

---

## Dynamic Key Management

The application features a built-in **Settings** page that allows users to override the server's environment variables with their own custom API keys.
- Overrides are saved in the client's `localStorage` and sent securely via custom HTTP headers (`x-openai-api-key`, `x-fmp-api-key`, `x-tavily-api-key`).
- This makes the deployed application fully shareable; users without keys can run it out-of-the-box using your server keys, while users with custom keys can utilize their own quotas without mutating server state or leaking keys to other users.
