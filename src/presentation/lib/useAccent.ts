import { useEffect, useState } from "react";

export const ACCENT_COLORS = [
  { name: "Magenta", value: "#de04fb" },
  { name: "Electric Blue", value: "#0F54EC" },
] as const;

const STORAGE_KEY = "kv-accent";
const EVENT_NAME = "kv:accent-change";
const DEFAULT = ACCENT_COLORS[0].value;

export function getStoredAccent(): string {
  if (typeof window === "undefined") return DEFAULT;
  return localStorage.getItem(STORAGE_KEY) || DEFAULT;
}

function applyToRoot(color: string) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  // Single source of truth — every derived token uses color-mix(... var(--primary) ...).
  root.style.setProperty("--primary", color);
}

export function setAccent(color: string) {
  if (typeof window === "undefined") return;
  applyToRoot(color);
  localStorage.setItem(STORAGE_KEY, color);
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: color }));
}

export function hexToRgbString(hex: string): string {
  const h = hex.replace("#", "");
  const v =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = parseInt(v, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

export function useAccentRgb(): string {
  return hexToRgbString(useAccent());
}

export function useAccent(): string {
  const [color, setColor] = useState<string>(() => getStoredAccent());

  useEffect(() => {
    const initial = getStoredAccent();
    setColor(initial);
    applyToRoot(initial);

    const handler = (e: Event) => {
      const c = (e as CustomEvent<string>).detail;
      if (c) setColor(c);
    };
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  return color;
}
