"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, ShieldCheck, Zap } from "lucide-react";
import { ReportContent } from "@/types";

export function InvestmentDecision({ data }: { data: ReportContent }) {
  const isInvest = data.decision === 'INVEST';

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-white/5 to-white/0">
      <CardContent className="p-0">
        <div className={`p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8 ${
          isInvest ? 'bg-[var(--color-success)]/10' : 'bg-[var(--color-danger)]/10'
        }`}>
          <div className="flex items-center gap-6">
            <div className={`p-6 rounded-full shadow-lg ${
              isInvest ? 'bg-[var(--color-success)]' : 'bg-[var(--color-danger)]'
            }`}>
              {isInvest ? (
                <CheckCircle className="w-16 h-16 text-white" />
              ) : (
                <XCircle className="w-16 h-16 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-widest text-[var(--color-muted-foreground)] uppercase mb-1">
                Final Recommendation
              </h2>
              <div className="flex items-center gap-4">
                <span className={`text-6xl font-extrabold tracking-tight ${
                  isInvest ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'
                }`}>
                  {data.decision}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-8 w-full md:w-auto">
            <div className="flex flex-col items-center p-4 bg-[var(--color-card)] rounded-xl border border-white/5 shadow-inner">
              <Zap className="w-6 h-6 text-[var(--color-primary)] mb-2" />
              <span className="text-3xl font-bold text-white">{data.confidence}%</span>
              <span className="text-xs text-[var(--color-muted-foreground)] uppercase tracking-wider font-semibold">Confidence</span>
            </div>
            <div className="flex flex-col items-center p-4 bg-[var(--color-card)] rounded-xl border border-white/5 shadow-inner">
              {data.riskLevel === 'Low' ? (
                <ShieldCheck className="w-6 h-6 text-[var(--color-success)] mb-2" />
              ) : (
                <AlertTriangle className={`w-6 h-6 mb-2 ${data.riskLevel === 'Medium' ? 'text-yellow-500' : 'text-[var(--color-danger)]'}`} />
              )}
              <span className={`text-2xl font-bold ${
                data.riskLevel === 'Low' ? 'text-[var(--color-success)]' :
                data.riskLevel === 'Medium' ? 'text-yellow-500' : 'text-[var(--color-danger)]'
              }`}>{data.riskLevel}</span>
              <span className="text-xs text-[var(--color-muted-foreground)] uppercase tracking-wider font-semibold">Risk Level</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
