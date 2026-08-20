import { useState, type ChangeEvent, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";

interface AuthFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  label: string;
  icon: React.ReactNode;
  error?: string;
  revealable?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
}

/**
 * Reusable auth form input.
 * - Left icon slot
 * - Optional reveal-password toggle (revealable=true)
 * - Inline error message
 */
export function AuthField({
  label,
  icon,
  error,
  revealable = false,
  type = "text",
  id,
  className,
  ...props
}: AuthFieldProps) {
  const [show, setShow] = useState(false);
  const inputType = revealable ? (show ? "text" : "password") : type;

  return (
    <div className="space-y-1.5">
      <label
        htmlFor={id}
        className="block text-sm font-medium text-foreground"
      >
        {label}
      </label>

      <div className="relative">
        {/* Leading icon */}
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:size-4">
          {icon}
        </span>

        <input
          id={id}
          type={inputType}
          className={[
            "w-full rounded-lg border bg-background/60 py-2.5 pl-10 text-sm transition-all",
            "placeholder:text-muted-foreground/50",
            "focus:outline-none focus:ring-1",
            error
              ? "border-destructive focus:border-destructive focus:ring-destructive/30"
              : "border-border focus:border-primary focus:ring-primary/30",
            revealable ? "pr-10" : "pr-4",
            className ?? "",
          ].join(" ")}
          {...props}
        />

        {/* Reveal toggle */}
        {revealable && (
          <button
            type="button"
            aria-label={show ? "Hide password" : "Show password"}
            onClick={() => setShow((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
