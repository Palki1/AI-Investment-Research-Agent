"use client";

import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Circle } from "lucide-react";
import { useEffect, useState } from "react";
import { Card } from "./ui/card";

const steps = [
  "Finding company...",
  "Collecting financial data...",
  "Reading latest news...",
  "Analyzing competitors...",
  "Evaluating risks...",
  "Generating recommendation..."
];

export function LoadingScreen({ currentStepIndex }: { currentStepIndex: number }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Artificial progress bar logic that smoothly increments based on step index
    const targetProgress = Math.min(((currentStepIndex + 1) / steps.length) * 100, 100);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < targetProgress) {
          return prev + 1;
        }
        return prev;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [currentStepIndex]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full max-w-2xl mx-auto p-4">
      <Card className="w-full p-8 space-y-8 bg-black/40 backdrop-blur-md border-white/10">
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Loader2 className="w-12 h-12 text-[var(--color-primary)] mx-auto" />
          </motion.div>
          <h2 className="text-2xl font-bold tracking-tight text-white">AI Agent Working</h2>
          <p className="text-[var(--color-muted-foreground)] text-sm">Please wait while we gather and analyze the data.</p>
        </div>

        <div className="space-y-2 relative">
          <div className="flex justify-between text-xs font-medium text-[var(--color-muted-foreground)] mb-1">
            <span>Overall Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <div className="space-y-4 mt-8">
          {steps.map((step, index) => {
            const isCompleted = index < currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <motion.div
                key={step}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center space-x-3 transition-colors duration-300 ${
                  isCompleted ? "text-white" : isCurrent ? "text-[var(--color-primary)]" : "text-white/30"
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5 text-[var(--color-success)]" />
                ) : isCurrent ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </motion.div>
                ) : (
                  <Circle className="w-5 h-5" />
                )}
                <span className={`text-sm ${isCurrent ? 'font-medium' : ''}`}>{step}</span>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
