/**
 * AccessOverrideToggle.tsx
 * Inline control rendered on individual enrollment profile rows.
 * Switches between "Sequential Progress Lock" and "Full Instant Access Override"
 * using the access-override endpoint via RTK Query.
 */
import { useState } from "react";
import { Shield, Zap, RefreshCw } from "lucide-react";
import { useSetAccessOverrideMutation } from "@/features/curriculum/curriculumApi";
import type { AccessStrategy } from "@/features/curriculum/curriculumApi";
import { toast } from "sonner";

interface AccessOverrideToggleProps {
  enrollmentId: string;
  currentStrategy: AccessStrategy;
  studentName?: string;
}

export function AccessOverrideToggle({
  enrollmentId,
  currentStrategy,
  studentName,
}: AccessOverrideToggleProps) {
  const [strategy, setStrategy] = useState<AccessStrategy>(currentStrategy);
  const [setOverride, { isLoading }] = useSetAccessOverrideMutation();

  const handleToggle = async (newStrategy: AccessStrategy) => {
    if (newStrategy === strategy || isLoading) return;

    try {
      await setOverride({ enrollmentId, strategy: newStrategy }).unwrap();
      setStrategy(newStrategy);
      toast.success(
        newStrategy === "FULL_ACCESS"
          ? `🔓 Full Access granted${studentName ? ` for ${studentName}` : ""}`
          : `🔒 Sequential lock re-applied${studentName ? ` for ${studentName}` : ""}`,
      );
    } catch {
      toast.error("Failed to update access strategy.");
    }
  };

  return (
    <div
      role="group"
      aria-label="Access strategy toggle"
      className="flex items-center gap-1 rounded-xl border border-[var(--hairline)] bg-[var(--surface-2)]/50 p-1"
    >
      {/* Sequential */}
      <StrategyButton
        id={`strategy-sequential-${enrollmentId}`}
        label="Sequential"
        description="Lock"
        icon={<Shield className="h-3 w-3" />}
        active={strategy === "SEQUENTIAL"}
        disabled={isLoading}
        activeClass="bg-slate-600 text-slate-100"
        onClick={() => handleToggle("SEQUENTIAL")}
      />

      {/* Loading spinner sits between */}
      {isLoading && (
        <RefreshCw className="mx-1 h-3 w-3 shrink-0 animate-spin text-muted-foreground" />
      )}

      {/* Full Access */}
      <StrategyButton
        id={`strategy-full-access-${enrollmentId}`}
        label="Full Access"
        description="Override"
        icon={<Zap className="h-3 w-3" />}
        active={strategy === "FULL_ACCESS"}
        disabled={isLoading}
        activeClass="bg-violet-600 text-white shadow-md shadow-violet-500/25"
        onClick={() => handleToggle("FULL_ACCESS")}
      />
    </div>
  );
}

// ─── Internal StrategyButton ──────────────────────────────────────────────────

function StrategyButton({
  id,
  label,
  description,
  icon,
  active,
  disabled,
  activeClass,
  onClick,
}: {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  active: boolean;
  disabled: boolean;
  activeClass: string;
  onClick: () => void;
}) {
  return (
    <button
      id={id}
      onClick={onClick}
      disabled={disabled}
      className={[
        "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-all duration-200",
        active ? activeClass : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      ].join(" ")}
      aria-pressed={active}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      <span className="text-[9px] opacity-60 hidden sm:inline">({description})</span>
    </button>
  );
}
