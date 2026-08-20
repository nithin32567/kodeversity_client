import { FcGoogle } from "react-icons/fc";
import { FaApple, FaGithub } from "react-icons/fa";

// Inline Microsoft "Windows" 4-squares SVG — avoids react-icons naming inconsistencies
function MicrosoftIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 21 21"
      className={className}
      aria-hidden
    >
      <rect x="1"  y="1"  width="9" height="9" fill="#f25022" />
      <rect x="11" y="1"  width="9" height="9" fill="#7fba00" />
      <rect x="1"  y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}

interface SocialAuthButtonsProps {
  disabled?: boolean;
  /** Called with the chosen provider. Only "google" is wired up; others are UI-only for now. */
  onSelect?: (provider: "google" | "apple" | "github" | "microsoft") => void;
}

type Provider = {
  id: "google" | "apple" | "github" | "microsoft";
  label: string;
};

const PROVIDERS: Provider[] = [
  { id: "google",    label: "Google"    },
  { id: "apple",     label: "Apple"     },
  { id: "github",    label: "GitHub"    },
  { id: "microsoft", label: "Microsoft" },
];

function ProviderIcon({ id }: { id: Provider["id"] }) {
  if (id === "google")    return <FcGoogle  className="size-[18px] shrink-0" aria-hidden />;
  if (id === "apple")     return <FaApple   className="size-[18px] shrink-0 text-foreground" aria-hidden />;
  if (id === "github")    return <FaGithub  className="size-[18px] shrink-0 text-foreground" aria-hidden />;
  if (id === "microsoft") return <MicrosoftIcon className="size-[18px] shrink-0" />;
  return null;
}

export function SocialAuthButtons({ disabled, onSelect }: SocialAuthButtonsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {PROVIDERS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          disabled={disabled}
          onClick={() => onSelect?.(id)}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-border bg-background text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ProviderIcon id={id} />
          {label}
        </button>
      ))}
    </div>
  );
}
