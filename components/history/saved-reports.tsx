"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Trash2, Bookmark, Star, ArrowUpDown, Calendar, ChevronRight } from "lucide-react";

import type { InvestmentReport } from "@/lib/types/investment-report";
import { getRecommendationStyles } from "@/lib/utils/recommendation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function SavedReportsManager() {
  const router = useRouter();
  const [reports, setReports] = useState<InvestmentReport[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]); // Array of report timestamps/IDs
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date-desc" | "date-asc" | "name-asc" | "name-desc">("date-desc");
  const [filterBookmarks, setFilterBookmarks] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const storedReports = localStorage.getItem("ai-agent-reports");
      if (storedReports) {
        setReports(JSON.parse(storedReports));
      }
      const storedBookmarks = localStorage.getItem("ai-agent-bookmarks");
      if (storedBookmarks) {
        setBookmarks(JSON.parse(storedBookmarks));
      }
    } catch (e) {
      console.error("Failed to load reports history", e);
    }
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border bg-card text-muted-foreground text-sm">
        Loading reports history...
      </div>
    );
  }

  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updatedBookmarks = [];
    if (bookmarks.includes(id)) {
      updatedBookmarks = bookmarks.filter((b) => b !== id);
    } else {
      updatedBookmarks = [...bookmarks, id];
    }
    setBookmarks(updatedBookmarks);
    localStorage.setItem("ai-agent-bookmarks", JSON.stringify(updatedBookmarks));
  };

  const handleDeleteReport = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this saved report?")) {
      const updatedReports = reports.filter((r) => r.meta.analyzedAt !== id);
      setReports(updatedReports);
      localStorage.setItem("ai-agent-reports", JSON.stringify(updatedReports));

      // Remove from bookmarks too
      if (bookmarks.includes(id)) {
        const updatedBookmarks = bookmarks.filter((b) => b !== id);
        setBookmarks(updatedBookmarks);
        localStorage.setItem("ai-agent-bookmarks", JSON.stringify(updatedBookmarks));
      }
    }
  };

  const handleSelectReport = (report: InvestmentReport) => {
    try {
      localStorage.setItem("ai-agent-active-report", JSON.stringify(report));
      router.push("/");
    } catch (e) {
      console.error("Failed to set active report", e);
    }
  };

  // Filter reports
  const filteredReports = reports.filter((report) => {
    const nameMatch = report.meta.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const tickerMatch = (report.meta.ticker || "").toLowerCase().includes(searchQuery.toLowerCase());
    const queryMatch = nameMatch || tickerMatch;

    if (filterBookmarks) {
      return queryMatch && bookmarks.includes(report.meta.analyzedAt);
    }
    return queryMatch;
  });

  // Sort reports
  const sortedReports = [...filteredReports].sort((a, b) => {
    if (sortBy === "date-desc") {
      return b.meta.analyzedAt.localeCompare(a.meta.analyzedAt);
    }
    if (sortBy === "date-asc") {
      return a.meta.analyzedAt.localeCompare(b.meta.analyzedAt);
    }
    if (sortBy === "name-asc") {
      return a.meta.companyName.localeCompare(b.meta.companyName);
    }
    if (sortBy === "name-desc") {
      return b.meta.companyName.localeCompare(a.meta.companyName);
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by company or ticker..."
            className="pl-9"
          />
        </div>

        {/* Sort & Bookmarks Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant={filterBookmarks ? "default" : "outline"}
            onClick={() => setFilterBookmarks(!filterBookmarks)}
            className="gap-2"
            size="sm"
          >
            <Star className={`size-4 ${filterBookmarks ? "fill-primary-foreground" : ""}`} />
            Bookmarks Only
          </Button>

          <div className="flex items-center gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-sm font-medium">
            <ArrowUpDown className="size-3.5 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as "date-desc" | "date-asc" | "name-asc" | "name-desc")}
              className="bg-transparent pr-1 text-xs focus-visible:outline-none"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Company A-Z</option>
              <option value="name-desc">Company Z-A</option>
            </select>
          </div>
        </div>
      </div>

      {sortedReports.length === 0 ? (
        <Card className="border-dashed bg-muted/10">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Bookmark className="size-8 text-muted-foreground/50 mb-3" />
            <h3 className="font-semibold text-lg">No saved reports found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              {searchQuery || filterBookmarks
                ? "No saved reports match your search criteria."
                : "Analyze a company on the Dashboard and click 'Save Report' to store it here."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {sortedReports.map((report) => {
            const id = report.meta.analyzedAt;
            const isBookmarked = bookmarks.includes(id);
            const verdictStyles = getRecommendationStyles(report.finalRecommendation.verdict);

            return (
              <Card
                key={id}
                onClick={() => handleSelectReport(report)}
                className="group relative cursor-pointer border hover:border-primary/50 transition-all duration-200"
              >
                <CardHeader className="pb-3 flex flex-row items-start justify-between space-y-0 gap-2">
                  <div>
                    <CardTitle className="text-base group-hover:text-primary transition-colors">
                      {report.meta.companyName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span className="font-semibold">{report.meta.ticker}</span>
                      <span>·</span>
                      <span>{report.meta.exchange}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleToggleBookmark(id, e)}
                      className="size-8 hover:bg-muted text-muted-foreground hover:text-amber-500"
                      aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                    >
                      <Star className={`size-4 ${isBookmarked ? "fill-amber-400 text-amber-400" : ""}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDeleteReport(id, e)}
                      className="size-8 hover:bg-muted text-muted-foreground hover:text-destructive"
                      aria-label="Delete report"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="text-sm space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={verdictStyles.badge}>{report.finalRecommendation.verdict}</Badge>
                    <Badge variant="outline">{report.confidenceScore.score}% confidence</Badge>
                    <Badge variant="outline">{report.investmentHorizon.horizon}</Badge>
                  </div>

                  <p className="line-clamp-2 text-xs text-muted-foreground leading-relaxed">
                    {report.executiveSummary}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-2.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {new Date(report.meta.analyzedAt).toLocaleDateString(undefined, {
                        dateStyle: "medium",
                      })}
                    </span>
                    <span className="flex items-center gap-0.5 text-primary opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                      Open Report <ChevronRight className="size-3" />
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
