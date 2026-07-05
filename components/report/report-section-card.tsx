import type { ReactNode } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ReportSectionCardProps {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
  dataAvailable?: boolean;
  dataNote?: string;
}

export function ReportSectionCard({
  id,
  title,
  description,
  children,
  dataAvailable = true,
  dataNote,
}: ReportSectionCardProps) {
  return (
    <Card id={id}>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          {!dataAvailable ? (
            <Badge variant="outline" className="text-amber-700 dark:text-amber-300">
              Data unavailable
            </Badge>
          ) : null}
        </div>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {dataNote ? (
          <p className="text-xs text-amber-700 dark:text-amber-300">{dataNote}</p>
        ) : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
