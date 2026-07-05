import { LOADING_STEPS } from "@/lib/config/constants";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LoadingStateProps {
  companyName: string;
  progress: number;
  activeStepIndex: number;
}

export function LoadingState({
  companyName,
  progress,
  activeStepIndex,
}: LoadingStateProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Researching {companyName}</CardTitle>
        <CardDescription>
          Gathering verified data and synthesizing the investment report. This
          may take up to a minute once the agent is connected in Phase 4.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="space-y-3">
          {LOADING_STEPS.map((step, index) => {
            const isComplete = index < activeStepIndex;
            const isActive = index === activeStepIndex;

            return (
              <div
                key={step}
                className="flex items-center gap-3 rounded-lg border px-3 py-2"
              >
                <div
                  className={`size-2 rounded-full ${
                    isComplete
                      ? "bg-emerald-500"
                      : isActive
                        ? "bg-primary animate-pulse"
                        : "bg-muted-foreground/30"
                  }`}
                />
                <span
                  className={`text-sm ${
                    isActive ? "font-medium" : "text-muted-foreground"
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        <div className="space-y-3">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-32 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
