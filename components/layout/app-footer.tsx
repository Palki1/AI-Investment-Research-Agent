import { DISCLAIMER } from "@/lib/config/constants";

export function AppFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <p className="text-xs leading-relaxed text-muted-foreground">
          {DISCLAIMER}
        </p>
      </div>
    </footer>
  );
}
