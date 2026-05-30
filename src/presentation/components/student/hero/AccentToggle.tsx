import { useState } from "react";
import { Palette } from "lucide-react";
import { ACCENT_COLORS, setAccent, useAccent } from "@/presentation/lib/useAccent";

export function AccentToggle() {
  const current = useAccent();
  const [open, setOpen] = useState(false);

  return (
    <div className="pointer-events-auto absolute bottom-5 right-5 z-20 font-mono">
      <div className="flex items-center gap-2">
        {open && (
          <div className="flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-2 py-1.5 backdrop-blur-md">
            {ACCENT_COLORS.map((c) => {
              const active = c.value.toLowerCase() === current.toLowerCase();
              return (
                <button
                  key={c.value}
                  type="button"
                  aria-label={`Accent ${c.name}`}
                  onClick={() => setAccent(c.value)}
                  className={`h-5 w-5 rounded-full ring-2 ring-offset-2 ring-offset-background transition-transform hover:scale-110 ${active ? "ring-foreground/80" : "ring-transparent"}`}
                  style={{ background: c.value }}
                />
              );
            })}
          </div>
        )}
        <button
          type="button"
          aria-label="Change accent color"
          onClick={() => setOpen((v) => !v)}
          className="grid h-9 w-9 place-items-center rounded-full border border-border/60 bg-background/70 text-muted-foreground backdrop-blur-md transition hover:text-foreground"
        >
          <Palette className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
