"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { KeyRound, ShieldCheck, AlertCircle, Eye, EyeOff, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SettingsState {
  openaiApiKey: string;
  fmpApiKey: string;
  tavilyApiKey: string;
  openaiModel: string;
}

const initialSettings: SettingsState = {
  openaiApiKey: "",
  fmpApiKey: "",
  tavilyApiKey: "",
  openaiModel: "gpt-4o",
};

export function SettingsForm() {
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<SettingsState>(initialSettings);
  const [showKeys, setShowKeys] = useState({ openai: false, fmp: false, tavily: false });
  const [isSaved, setIsSaved] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem("ai-agent-settings");
      if (stored) {
        setSettings((prev) => ({ ...prev, ...JSON.parse(stored) }));
      }
    } catch {
      // Ignore malformed stored settings.
    }
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded-xl border bg-card text-muted-foreground text-sm">
        Loading settings...
      </div>
    );
  }

  const validateInputs = (): boolean => {
    const errors: string[] = [];

    // OpenAI key format sk-...
    if (settings.openaiApiKey && !settings.openaiApiKey.startsWith("sk-")) {
      errors.push("OpenAI API Key must start with 'sk-'.");
    }

    // Tavily key format tvly-...
    if (settings.tavilyApiKey && !settings.tavilyApiKey.startsWith("tvly-")) {
      errors.push("Tavily API Key must start with 'tvly-'.");
    }

    // FMP key should be non-empty alphanumeric
    if (settings.fmpApiKey && !/^[a-zA-Z0-9]+$/.test(settings.fmpApiKey)) {
      errors.push("FMP API Key must be alphanumeric.");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) {
      return;
    }

    try {
      localStorage.setItem("ai-agent-settings", JSON.stringify(settings));
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    } catch {
      // Ignore storage write failures.
    }
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all custom settings?")) {
      localStorage.removeItem("ai-agent-settings");
      setSettings(initialSettings);
      setIsSaved(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <KeyRound className="size-5 text-primary" /> API Configuration
          </CardTitle>
          <CardDescription>
            Configure custom API keys. Dynamic key overrides are stored securely in your browser&apos;s localStorage and are only sent to the server for agent execution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-5">
            {validationErrors.length > 0 ? (
              <Alert variant="destructive" role="alert">
                <AlertCircle className="size-4" />
                <AlertTitle>Validation Failed</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc pl-4 space-y-1">
                    {validationErrors.map((err) => (
                      <li key={err}>{err}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            ) : null}

            {isSaved ? (
              <Alert className="bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300" role="alert">
                <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
                <AlertTitle>Settings Saved</AlertTitle>
                <AlertDescription>Your custom API keys and model configurations have been updated.</AlertDescription>
              </Alert>
            ) : null}

            <div className="space-y-2">
              <label htmlFor="openai" className="text-sm font-semibold block">
                OpenAI API Key (sk-...)
              </label>
              <div className="relative">
                <Input
                  id="openai"
                  type={showKeys.openai ? "text" : "password"}
                  value={settings.openaiApiKey}
                  onChange={(e) => setSettings({ ...settings, openaiApiKey: e.target.value })}
                  placeholder="sk-proj-..."
                  className="pr-10"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowKeys({ ...showKeys, openai: !showKeys.openai })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showKeys.openai ? "Hide OpenAI key" : "Show OpenAI key"}
                >
                  {showKeys.openai ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="fmp" className="text-sm font-semibold block">
                Financial Modeling Prep (FMP) API Key
              </label>
              <div className="relative">
                <Input
                  id="fmp"
                  type={showKeys.fmp ? "text" : "password"}
                  value={settings.fmpApiKey}
                  onChange={(e) => setSettings({ ...settings, fmpApiKey: e.target.value })}
                  placeholder="Enter FMP Key"
                  className="pr-10"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowKeys({ ...showKeys, fmp: !showKeys.fmp })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showKeys.fmp ? "Hide FMP key" : "Show FMP key"}
                >
                  {showKeys.fmp ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="tavily" className="text-sm font-semibold block">
                Tavily Search API Key (tvly-...)
              </label>
              <div className="relative">
                <Input
                  id="tavily"
                  type={showKeys.tavily ? "text" : "password"}
                  value={settings.tavilyApiKey}
                  onChange={(e) => setSettings({ ...settings, tavilyApiKey: e.target.value })}
                  placeholder="tvly-..."
                  className="pr-10"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowKeys({ ...showKeys, tavily: !showKeys.tavily })}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showKeys.tavily ? "Hide Tavily key" : "Show Tavily key"}
                >
                  {showKeys.tavily ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="model" className="text-sm font-semibold block">
                  Default AI Model
                </label>
                <select
                  id="model"
                  value={settings.openaiModel}
                  onChange={(e) => setSettings({ ...settings, openaiModel: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Choose AI model"
                >
                  <option value="gpt-4o">GPT-4o (High Quality)</option>
                  <option value="gpt-4o-mini">GPT-4o-Mini (Fast & Cheap)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="theme" className="text-sm font-semibold block">
                  Application Theme
                </label>
                <select
                  id="theme"
                  value={theme || "system"}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Choose theme"
                >
                  <option value="system">System Default</option>
                  <option value="light">Light Mode</option>
                  <option value="dark">Dark Mode</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <Button type="submit" className="gap-2">
                <Save className="size-4" /> Save Configuration
              </Button>
              <Button type="button" variant="outline" onClick={handleClear} className="gap-2 text-destructive hover:bg-destructive/10">
                <Trash2 className="size-4" /> Clear All
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
