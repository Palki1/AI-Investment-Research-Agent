import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";

interface PageShellProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  maxWidth?: string;
  className?: string;
}

export function PageShell({
  children,
  title,
  description,
  maxWidth = "max-w-6xl",
  className,
}: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppHeader />
      <main className={`mx-auto flex w-full flex-1 flex-col px-4 py-8 sm:px-6 ${maxWidth} ${className ?? ""}`.trim()}>
        {(title || description) ? (
          <header className="mb-6 space-y-2">
            {title ? <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1> : null}
            {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
          </header>
        ) : null}
        {children}
      </main>
      <AppFooter />
    </div>
  );
}
