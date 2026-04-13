"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const themeOptions = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function ThemePreferencesCard() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme = mounted ? (theme ?? "system") : null;

  return (
    <Card className="max-w-2xl ">
      <CardHeader>
        <CardTitle>Theme</CardTitle>
        <CardDescription>
          Choose how the app looks to you. Pick a single theme, or sync with
          your system and switch automatically.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = activeTheme === option.value;

            return (
              <Button
                key={option.value}
                type="button"
                variant={isActive ? "default" : "outline"}
                className="justify-center"
                onClick={() => setTheme(option.value)}
                disabled={!mounted}
                aria-pressed={isActive}
              >
                <Icon className="size-4" />
                <span>{option.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
