"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, TrendingUp, Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TRENDING_COMPANIES = ["Apple", "Nvidia", "Tesla", "Microsoft", "Reliance"];

export default function Home() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/dashboard/${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[var(--color-background)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(79,70,229,0.15),transparent_50%)]" />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--color-primary)]/10 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2] 
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-[var(--color-accent)]/10 rounded-full blur-[120px]"
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center justify-center p-2 mb-4 bg-white/5 rounded-full backdrop-blur border border-white/10">
            <Activity className="w-5 h-5 text-[var(--color-success)] mr-2" />
            <span className="text-sm font-medium text-white/90">Powered by LangGraph & GPT-4</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white drop-shadow-sm">
            AI Investment <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]">
              Research Agent
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-[var(--color-muted-foreground)]">
            Research any public company using AI and receive a detailed investment recommendation backed by real-time financial data, news, and analysis.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-2xl"
        >
          <form onSubmit={handleSearch} className="relative flex items-center group">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-300" />
            <div className="relative flex w-full bg-[var(--color-card)] rounded-xl border border-white/10 shadow-2xl p-2 items-center">
              <Search className="w-6 h-6 text-[var(--color-muted-foreground)] ml-3" />
              <Input
                type="text"
                placeholder="Enter Company Name (e.g., Apple, Tesla, Reliance)..."
                className="flex-1 border-0 bg-transparent text-lg focus-visible:ring-0 focus-visible:ring-offset-0 h-14 px-4 text-white placeholder:text-[var(--color-muted-foreground)]"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button type="submit" size="lg" className="h-14 px-8 rounded-lg text-lg font-semibold shadow-lg">
                Analyze
              </Button>
            </div>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="pt-8 space-y-4 w-full max-w-2xl"
        >
          <div className="flex items-center justify-center text-sm text-[var(--color-muted-foreground)] font-medium uppercase tracking-wider mb-2">
            <TrendingUp className="w-4 h-4 mr-2" /> Trending Searches
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {TRENDING_COMPANIES.map((company) => (
              <Badge 
                key={company}
                variant="outline"
                className="px-4 py-2 text-sm bg-white/5 hover:bg-white/10 cursor-pointer transition-colors border-white/10"
                onClick={() => {
                  setQuery(company);
                  router.push(`/dashboard/${encodeURIComponent(company)}`);
                }}
              >
                {company}
              </Badge>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
