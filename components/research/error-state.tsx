import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message: string;
  details?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Research failed",
  message,
  details,
  onRetry,
}: ErrorStateProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="size-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="space-y-3">
        <p>{message}</p>
        {details ? (
          <p className="text-sm opacity-90">{details}</p>
        ) : null}
        {onRetry ? (
          <Button type="button" variant="outline" size="sm" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
